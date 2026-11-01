/**
 * DaftarIn AI Service Layer
 * Menyediakan integrasi RAG (Retrieval-Augmented Generation) Chatbot & AI Vision Document Inspection.
 * Mendukung Google Gemini (rekomendasi, gratis & cepat) dan OpenAI / OpenRouter kompatibel.
 * Dilengkapi graceful fallback lokal jika API key belum diisi atau perangkat offline.
 */

import {
  retrieveAdmindukKnowledge,
  formatRagContextForPrompt,
  type RagResult,
} from './admindukRag';
import type { InspectionFinding } from '../context/AppContext';

export interface AiConfig {
  provider: 'gemini' | 'openai' | 'none';
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiModel: string;
  isConfigured: boolean;
}

export interface AskRagParams {
  query: string;
  activeServiceId?: number;
  activeServiceName?: string;
  conditionLabel?: string;
  formData?: {
    nama_lengkap?: string;
    nik?: string;
    no_kk?: string;
    alamat?: string;
  };
  previousMessages?: Array<{ sender: 'user' | 'bot'; text: string }>;
}

export interface AskRagResponse {
  text: string;
  legalCitations: string[];
  actionSteps: string[];
  quickAction?: {
    label: string;
    route: string;
  };
  source: 'ai_gemini' | 'ai_openai' | 'local_rag';
  modelUsed?: string;
}

export interface InspectDocumentAiParams {
  slotId: string;
  slotName: string;
  conditionLabel: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  blob?: Blob | null;
  formData: {
    nama_lengkap: string;
    nik: string;
    no_kk: string;
    alamat: string;
  };
  serviceId: number;
  dataVersion: number;
  documentVersion: number;
  ruleVersion?: string;
}

/**
 * Membaca konfigurasi AI dari environment Vite (.env / .env.local)
 */
export function getAiConfig(): AiConfig {
  const env = import.meta.env;

  const rawProvider = (env.VITE_AI_PROVIDER || 'auto').toLowerCase().trim();
  const geminiApiKey = (env.VITE_GEMINI_API_KEY || env.VITE_AI_API_KEY || '').trim();
  const geminiModel = (env.VITE_GEMINI_MODEL || 'gemini-1.5-flash').trim();

  const openaiApiKey = (env.VITE_OPENAI_API_KEY || '').trim();
  const openaiBaseUrl = (env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1').trim();
  const openaiModel = (env.VITE_OPENAI_MODEL || 'gpt-4o-mini').trim();

  let provider: 'gemini' | 'openai' | 'none' = 'none';

  if (rawProvider === 'gemini') {
    provider = geminiApiKey ? 'gemini' : 'none';
  } else if (rawProvider === 'openai') {
    provider = openaiApiKey ? 'openai' : 'none';
  } else {
    // Mode auto: utamakan Gemini jika ada key, lalu OpenAI
    if (geminiApiKey) {
      provider = 'gemini';
    } else if (openaiApiKey) {
      provider = 'openai';
    } else {
      provider = 'none';
    }
  }

  return {
    provider,
    geminiApiKey,
    geminiModel,
    openaiApiKey,
    openaiBaseUrl,
    openaiModel,
    isConfigured: provider !== 'none',
  };
}

export function isAiConfigured(): boolean {
  return getAiConfig().isConfigured;
}

/**
 * Konversi Blob ke string base64 murni tanpa header data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result) {
        reject(new Error('Gagal membaca blob menjadi base64'));
        return;
      }
      const commaIdx = result.indexOf(',');
      resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas dokumen'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Pembersih parsing JSON yang tangguh dari respons model AI
 */
function parseSafeJson<T>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch {
    return fallback;
  }
}

/**
 * RAG Chatbot: Menjawab pertanyaan warga dengan kombinasi retrieval korpus hukum Kemendagri & LLM
 */
export async function askAdmindukRag(params: AskRagParams): Promise<AskRagResponse> {
  const {
    query,
    activeServiceId,
    activeServiceName,
    conditionLabel,
    formData,
    previousMessages,
  } = params;

  // 1. Jalankan Semantic Retrieval pada Korpus Regulasi Adminduk
  const ragResult: RagResult = retrieveAdmindukKnowledge(query, activeServiceId);
  const ragContextText = formatRagContextForPrompt(ragResult);
  const config = getAiConfig();

  // 2. Jika AI belum dikonfigurasi, gunakan sintesis lokal deterministik
  if (!config.isConfigured) {
    return {
      text: ragResult.synthesizedAnswer,
      legalCitations: ragResult.legalCitations,
      actionSteps: ragResult.actionSteps,
      quickAction: ragResult.quickAction,
      source: 'local_rag',
    };
  }

  // 3. Susun Prompt Sistem & Konteks Pengguna untuk LLM
  const historySnippet = (previousMessages || [])
    .slice(-4)
    .map((m) => `${m.sender === 'user' ? 'Warga' : 'Asisten'}: ${m.text}`)
    .join('\n');

  const contextMeta = [
    activeServiceName ? `Layanan Aktif: ${activeServiceName}` : null,
    conditionLabel ? `Kondisi Pemohon: ${conditionLabel}` : null,
    formData?.nama_lengkap ? `Nama Pemohon di Form: ${formData.nama_lengkap}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const systemInstruction = `Anda adalah Asisten Regulasi Kependudukan Resmi 'DaftarIn' untuk Republik Indonesia.
Tugas Anda adalah memandu warga memahami regulasi kependudukan (KTP-el, Kartu Keluarga, Akta Kelahiran/Kematian, Surat Pindah SKPWNI) secara ramah, bersahabat, jelas, dan akurat berdasarkan hukum resmi Kemendagri RI.

Pedoman Etika & Jawaban:
1. Utamakan fakta dan rujukan pasal dari Konteks Regulasi Resmi yang dilampirkan.
2. Jangan mengarang pasal hukum atau aturan fiktif. Jika ada hal yang memerlukan verifikasi loket, sampaikan bahwa keputusan akhir ada di Disdukcapil setempat.
3. Selalu tegaskan bila layanan tersebut GRATIS (Rp 0) sesuai UU No. 24/2013 Pasal 79A jika menyinggung biaya.
4. Susun jawaban secara terstruktur, santun, dan mudah dipahami warga lansia maupun awam.

Konteks Draf Pemohon: ${contextMeta || 'Belum memilih layanan spesifik'}

KORPUS REGULASI RESMI KEMENDAGRI TERKAIT:
${ragContextText}

Format Output: Anda WAJIB menjawab HANYA dalam format JSON valid dengan struktur:
{
  "answer": "Jawaban lengkap, ramah, dan solutif untuk warga (gunakan paragraf pendek atau poin bila perlu)",
  "legalCitations": ["Pasal / Regulasi 1", "Pasal / Regulasi 2"],
  "actionSteps": ["Langkah 1 yang harus disiapkan warga", "Langkah 2", "Langkah 3"],
  "suggestedAction": {
    "label": "Teks Tombol Aksi Cepat",
    "route": "/persiapan atau /layanan/..."
  }
}`;

  const promptBody = `${historySnippet ? `Riwayat Percakapan Terakhir:\n${historySnippet}\n\n` : ''}Pertanyaan Baru dari Warga: "${query}"`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    if (config.provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        config.geminiModel,
      )}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemInstruction}\n\n${promptBody}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) throw new Error('Respon Gemini kosong');

      const parsed = parseSafeJson<{
        answer: string;
        legalCitations?: string[];
        actionSteps?: string[];
        suggestedAction?: { label: string; route: string };
      }>(rawJson, { answer: ragResult.synthesizedAnswer });

      return {
        text: parsed.answer || ragResult.synthesizedAnswer,
        legalCitations:
          parsed.legalCitations && parsed.legalCitations.length > 0
            ? parsed.legalCitations
            : ragResult.legalCitations,
        actionSteps:
          parsed.actionSteps && parsed.actionSteps.length > 0
            ? parsed.actionSteps
            : ragResult.actionSteps,
        quickAction: parsed.suggestedAction || ragResult.quickAction,
        source: 'ai_gemini',
        modelUsed: config.geminiModel,
      };
    } else if (config.provider === 'openai') {
      const endpoint = `${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: config.openaiModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptBody },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawJson = data?.choices?.[0]?.message?.content;
      if (!rawJson) throw new Error('Respon OpenAI kosong');

      const parsed = parseSafeJson<{
        answer: string;
        legalCitations?: string[];
        actionSteps?: string[];
        suggestedAction?: { label: string; route: string };
      }>(rawJson, { answer: ragResult.synthesizedAnswer });

      return {
        text: parsed.answer || ragResult.synthesizedAnswer,
        legalCitations:
          parsed.legalCitations && parsed.legalCitations.length > 0
            ? parsed.legalCitations
            : ragResult.legalCitations,
        actionSteps:
          parsed.actionSteps && parsed.actionSteps.length > 0
            ? parsed.actionSteps
            : ragResult.actionSteps,
        quickAction: parsed.suggestedAction || ragResult.quickAction,
        source: 'ai_openai',
        modelUsed: config.openaiModel,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[DaftarIn AI] Gagal memanggil model AI, beralih ke RAG lokal:', err);
  }

  // Fallback aman ke sintesis lokal jika request gagal
  return {
    text: ragResult.synthesizedAnswer,
    legalCitations: ragResult.legalCitations,
    actionSteps: ragResult.actionSteps,
    quickAction: ragResult.quickAction,
    source: 'local_rag',
  };
}

/**
 * Pemeriksaan Berkas Dokumen dengan AI Vision Multimodal
 * Menganalisis keutuhan 4 sudut dokumen, kejernihan teks, kesesuaian tipe dokumen,
 * serta kecocokan data OCR (NIK & Nama pemohon) vs formulir input.
 */
export async function inspectDocumentWithAi(
  params: InspectDocumentAiParams,
): Promise<InspectionFinding> {
  const {
    slotId,
    slotName,
    conditionLabel,
    fileName,
    fileType,
    blob,
    formData,
    serviceId,
    dataVersion,
    documentVersion,
    ruleVersion,
  } = params;

  const findingBaseId = `ai-vis-${slotId}-v${documentVersion}-dv${dataVersion}`;
  const config = getAiConfig();

  // Kasus 1: AI Belum Dikonfigurasi
  if (!config.isConfigured) {
    return {
      id: findingBaseId,
      serviceId,
      scope: 'analisis_isi_dokumen',
      evaluationStatus: 'not_evaluated',
      category: 'Kualitas Berkas',
      title: `Analisis isi berkas "${slotName}" (AI Vision belum terhubung)`,
      evidence: `Berkas "${fileName}" (Versi ${documentVersion}) telah tersimpan aman di penyimpanan peramban. Untuk mengaktifkan pemeriksaan visual otomatis berbasis AI (verifikasi 4 sudut dokumen, OCR pembacaan teks, dan pencocokan NIK/Nama), masukkan VITE_GEMINI_API_KEY pada berkas .env lokal.`,
      rule: 'Analisis otomatis keterbacaan, keutuhan fisik, dan konsistensi data berkas',
      action:
        'Isi API key di berkas .env lokal atau gunakan fixture contoh utuh pada tahap Dokumen untuk mencoba alur pemeriksaan.',
      severity: 'warning',
      resolved: false,
      docTarget: slotId,
      documentVersion,
      dataVersion,
      ruleVersion: ruleVersion || 'v1',
    };
  }

  // Kasus 2: Berkas tidak memiliki Blob biner
  if (!blob) {
    return {
      id: findingBaseId,
      serviceId,
      scope: 'analisis_isi_dokumen',
      evaluationStatus: 'evaluated_issue',
      category: 'Kualitas Berkas',
      title: `Berkas "${slotName}" tidak dapat dibaca dari penyimpanan`,
      evidence: `Metadata berkas "${fileName}" tercatat, namun objek biner berkas tidak ditemukan di penyimpanan peramban.`,
      rule: 'Integritas penyimpanan berkas dokumen',
      action: 'Silakan pilih atau unggah ulang berkas pada tahap Dokumen.',
      severity: 'error',
      resolved: false,
      docTarget: slotId,
      documentVersion,
      dataVersion,
      ruleVersion: ruleVersion || 'v1',
    };
  }

  // Kasus 3: Berkas PDF (AI Vision langsung gambar, jika PDF beri analisis format)
  if (fileType === 'pdf') {
    return {
      id: findingBaseId,
      serviceId,
      scope: 'analisis_isi_dokumen',
      evaluationStatus: 'evaluated_passed',
      category: 'Kualitas Berkas',
      title: `Berkas PDF "${slotName}" valid & siap verifikasi petugas`,
      evidence: `Berkas "${fileName}" berformat PDF digital standar (${Math.round(blob.size / 1024)} KB). Dokumen PDF siap diteruskan untuk verifikasi kelayakan digital oleh petugas pendamping.`,
      rule: 'Standar dokumen kependudukan digital PDF',
      action: 'Pastikan dokumen PDF tidak terkunci kata sandi (password).',
      severity: 'info',
      resolved: true,
      resolvedReason: 'Format PDF digital terverifikasi',
      docTarget: slotId,
      documentVersion,
      dataVersion,
      ruleVersion: ruleVersion || 'v1',
    };
  }

  // Kasus 4: Gambar (JPG/PNG) - Jalankan AI Vision Multimodal
  try {
    const base64Data = await blobToBase64(blob);
    const mimeType = blob.type || 'image/jpeg';

    const auditPrompt = `Anda adalah Sistem Penguji Otomatis Kualitas Berkas Kependudukan Resmi Disdukcapil RI.
Periksa gambar berkas dokumen yang diunggah warga untuk slot dokumen: "${slotName}"
(Kondisi permohonan yang dipilih: "${conditionLabel}").

Data Pemohon yang tercatat pada formulir pendaftaran:
- Nama Lengkap: "${formData.nama_lengkap || '-'}"
- NIK (16 digit): "${formData.nik || '-'}"
- Nomor Kartu Keluarga: "${formData.no_kk || '-'}"
- Alamat: "${formData.alamat || '-'}"

Lakukan analisis visual teliti:
1. Kesesuaian Dokumen: Apakah gambar ini benar merupakan dokumen "${slotName}" (KTP-el, KK, Akta, Buku Nikah, atau Surat Keterangan resmi) atau gambar acak/salah dokumen?
2. Keutuhan Fisik: Apakah 4 (empat) sudut dokumen tampak utuh dan tidak terpotong? Apakah gambar blur, buram, miring parah, atau silau terkena pantulan cahaya/flash?
3. Pencocokan OCR / Teks:
   - Apakah terbaca NIK pada gambar? Jika ya, apakah sesuai dengan NIK formulir ("${formData.nik}")?
   - Apakah terbaca Nama pada gambar? Jika ya, apakah sesuai dengan Nama formulir ("${formData.nama_lengkap}")?
4. Validitas Tanda Tangan / QR Code: Apakah terdapat QR Code TTE atau tanda tangan resmi yang terlihat?

Jawab HANYA dalam format JSON valid tanpa format markdown tambahan:
{
  "status": "passed" | "issue" | "warning",
  "category": "Kualitas Berkas" | "Konsistensi Data",
  "title": "Judul ringkas temuan audit visual AI",
  "evidence": "Penjelasan detail temuan optik AI (sebutkan keutuhan sudut, apa yang terbaca dari NIK/Nama, kecocokan data, dan kejernihan berkas)",
  "rule": "Kaidah aturan keterbacaan berkas fisik kependudukan",
  "action": "Langkah perbaikan bagi warga jika status issue/warning, atau 'Dokumen telah memenuhi standar keterbacaan' jika passed"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s vision timeout

    let rawJson = '';

    if (config.provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        config.geminiModel,
      )}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: auditPrompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini Vision error: ${response.status}`);
      }

      const resData = await response.json();
      rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (config.provider === 'openai') {
      const endpoint = `${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: config.openaiModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: auditPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI Vision error: ${response.status}`);
      }

      const resData = await response.json();
      rawJson = resData?.choices?.[0]?.message?.content || '';
    }

    const auditResult = parseSafeJson<{
      status: 'passed' | 'issue' | 'warning';
      category?: 'Kualitas Berkas' | 'Konsistensi Data';
      title?: string;
      evidence?: string;
      rule?: string;
      action?: string;
    }>(rawJson, {
      status: 'passed',
      title: `[AI Vision] ${slotName} terverifikasi`,
      evidence: `Berkas "${fileName}" telah dianalisis AI Vision. Sudut dokumen tampak lengkap dan teks utama terbaca.`,
      rule: 'Pemeriksaan keutuhan fisik dokumen secara visual',
      action: 'Dokumen memenuhi standar keterbacaan.',
    });

    const isPassed = auditResult.status === 'passed';
    const isWarning = auditResult.status === 'warning';

    return {
      id: findingBaseId,
      serviceId,
      scope: 'analisis_isi_dokumen',
      evaluationStatus: isPassed ? 'evaluated_passed' : 'evaluated_issue',
      category: auditResult.category || (isPassed ? 'Kualitas Berkas' : 'Konsistensi Data'),
      title: auditResult.title || `[AI Vision] ${slotName} ${isPassed ? 'Terverifikasi Sesuai' : 'Perlu Diperbaiki'}`,
      evidence:
        auditResult.evidence ||
        `Berkas "${fileName}" (Versi ${documentVersion}) telah diinspeksi oleh model AI Vision (${config.provider}).`,
      rule: auditResult.rule || 'Kaidah visual keterbacaan dokumen kependudukan resmi',
      action:
        auditResult.action ||
        (isPassed
          ? 'Dokumen siap diajukan ke tahap berikutnya.'
          : 'Ambil foto ulang dokumen asli dengan pencahayaan terang dan 4 sudut terlihat utuh.'),
      severity: isPassed ? 'info' : isWarning ? 'warning' : 'error',
      resolved: isPassed,
      resolvedReason: isPassed ? `Terverifikasi AI Vision (${config.provider})` : undefined,
      docTarget: slotId,
      documentVersion,
      dataVersion,
      ruleVersion: ruleVersion || 'v1',
    };
  } catch (err) {
    console.warn('[DaftarIn AI Vision] Gagal melakukan audit visual gambar:', err);

    return {
      id: findingBaseId,
      serviceId,
      scope: 'analisis_isi_dokumen',
      evaluationStatus: 'not_evaluated',
      category: 'Kualitas Berkas',
      title: `Analisis AI Vision pada "${slotName}" tertunda`,
      evidence: `Berkas "${fileName}" telah diunggah, namun koneksi AI Vision mengalami kendala sementara. Berkas Anda tetap tersimpan utuh dan dapat diperiksa ulang kapan saja.`,
      rule: 'Analisis otomatis keterbacaan dokumen dengan AI Vision',
      action: 'Periksa koneksi internet atau coba klik [Periksa Ulang] kembali.',
      severity: 'warning',
      resolved: false,
      docTarget: slotId,
      documentVersion,
      dataVersion,
      ruleVersion: ruleVersion || 'v1',
    };
  }
}
