/**
 * DaftarIn Adminduk RAG (Retrieval-Augmented Generation) Engine
 * Mesin pencarian semantik regulasi kependudukan & pensintesis jawaban resmi Adminduk RI.
 */

export interface RagChunk {
  id: string;
  category: 'biaya' | 'ejaan_nama' | 'kk' | 'ktp' | 'akta' | 'pindah' | 'foto_berkas' | 'legalitas' | 'jam_layanan';
  topic: string;
  legalBasis: string;
  keywords: string[];
  summaryAnswer: string;
  actionChecklist: string[];
  suggestedAction?: {
    label: string;
    route: string;
  };
}

export interface RagResult {
  query: string;
  matchedChunks: RagChunk[];
  bestMatch: RagChunk;
  relevanceScore: number;
  synthesizedAnswer: string;
  legalCitations: string[];
  actionSteps: string[];
  quickAction?: {
    label: string;
    route: string;
  };
}

export const ADMINDUK_KNOWLEDGE_CORPUS: RagChunk[] = [
  {
    id: 'biaya-gratis-uu24',
    category: 'biaya',
    topic: 'Biaya Pengurusan & Larangan Pungutan Liar (Pungli)',
    legalBasis: 'Pasal 79A UU No. 24 Tahun 2013 tentang Perubahan atas UU No. 23 Tahun 2006 tentang Administrasi Kependudukan',
    keywords: ['biaya', 'tarif', 'bayar', 'gratis', 'uang', 'pungli', 'dana', 'retribusi', 'denda', 'rp 0', 'pembayaran'],
    summaryAnswer: 'Seluruh pengurusan dokumen kependudukan (KTP-el, Kartu Keluarga, Akta Kelahiran, Surat Pindah) di Indonesia adalah 100% GRATIS (Rp 0). Pejabat atau petugas loket dilarang memungut biaya apapun.',
    actionChecklist: [
      'Jangan menyerahkan uang kepada siapapun baik di kelurahan maupun loket Disdukcapil.',
      'Jika menemukan pungutan liar, laporkan melalui portal pengaduan resmi SP4N LAPOR! (lapor.go.id) atau Halo Dukcapil (1500537).'
    ],
    suggestedAction: {
      label: 'Mulai Persiapan Dokumen Mandiri',
      route: '/persiapan'
    }
  },
  {
    id: 'ejaan-nama-permendagri73',
    category: 'ejaan_nama',
    topic: 'Perbedaan Huruf/Ejaan Nama pada KTP, KK, Ijazah, dan Akta',
    legalBasis: 'Permendagri No. 73 Tahun 2022 tentang Pencatatan Nama pada Dokumen Kependudukan (Pasal 4 & 5)',
    keywords: ['ejaan', 'nama', 'beda', 'huruf', 'salah', 'ijazah', 'akta', 'perbaikan nama', 'ganti nama', 'selisih', 'koreksi'],
    summaryAnswer: 'Rujukan utama keabsahan nama adalah Akta Kelahiran. Perbedaan penulisan nama antara KTP/KK dengan Ijazah dapat dibetulkan langsung di Disdukcapil tanpa perlu penetapan pengadilan negeri, selama perbaikan nama tidak mengubah identitas mendasar.',
    actionChecklist: [
      'Bawa fisik Akta Kelahiran asli dan Ijazah sekolah terakhir.',
      'Bawa Kartu Keluarga (KK) asli untuk disinkronkan datanya.',
      'Petugas verifikasi Disdukcapil akan menerbitkan KK dan KTP-el baru dengan nama yang sudah diselaraskan.'
    ],
    suggestedAction: {
      label: 'Periksa Data Pemohon di Tahap 2',
      route: '/persiapan/data'
    }
  },
  {
    id: 'aturan-nama-baru-permendagri73',
    category: 'ejaan_nama',
    topic: 'Aturan Pemberian Nama Anak Baru Lahir',
    legalBasis: 'Permendagri No. 73 Tahun 2022 Pasal 4 ayat (2)',
    keywords: ['nama anak', 'syarat nama', 'panjang nama', 'singkatan nama', 'aturan nama', 'karakter nama'],
    summaryAnswer: 'Pencatatan nama baru pada dokumen kependudukan wajib memenuhi ketentuan:\n1. Menggunakan minimal 2 (dua) kata.\n2. Maksimal 60 karakter termasuk spasi.\n3. Mudah dibaca, tidak bermakna negatif, dan tidak bertentangan dengan norma agama/kesusilaan.\n4. Tidak boleh menggunakan singkatan (kecuali tidak diartikan lain), angka, atau tanda baca.',
    actionChecklist: [
      'Pastikan nama anak minimal dua suku kata.',
      'Hindari penulisan gelar kehormatan pada akta kelahiran (hanya nama diri).',
      'Siapkan Surat Keterangan Lahir dari dokter/bidan RS.'
    ],
    suggestedAction: {
      label: 'Lihat Syarat Akta Kelahiran',
      route: '/layanan/3'
    }
  },
  {
    id: 'kk-baru-menikah-perpres96',
    category: 'kk',
    topic: 'Penerbitan Kartu Keluarga (KK) Baru Pasangan Menikah',
    legalBasis: 'Perpres No. 96 Tahun 2018 tentang Persyaratan dan Tata Cara Pendaftaran Penduduk dan Pencatatan Sipil (Pasal 11)',
    keywords: ['nikah', 'menikah', 'pengantin', 'buku nikah', 'kk baru', 'pisah kk', 'pecah kk', 'keluarga baru'],
    summaryAnswer: 'Pasangan yang baru menikah berhak menerbitkan Kartu Keluarga (KK) mandiri yang terpisah dari orang tua.',
    actionChecklist: [
      'Buku Nikah / Akta Perkawinan asli dan fotokopi.',
      'Kartu Keluarga (KK) asli masing-masing orang tua suami dan istri.',
      'KTP-el suami dan istri untuk pembaruan status kawin dan alamat.'
    ],
    suggestedAction: {
      label: 'Persiapkan Berkas KK Baru',
      route: '/layanan/1'
    }
  },
  {
    id: 'kk-tambah-anak-kelahiran',
    category: 'kk',
    topic: 'Penambahan Anggota Keluarga Baru (Anak Lahir) ke Dalam KK',
    legalBasis: 'Perpres No. 96 Tahun 2018 Pasal 12 & Permendagri No. 108 Tahun 2019',
    keywords: ['tambah anak', 'anak lahir', 'masuk kk', 'tambah anggota', 'anggota baru', 'bayi'],
    summaryAnswer: 'Penambahan anak ke KK dilakukan bersamaan dengan penerbitan Akta Kelahiran dan Kartu Identitas Anak (KIA) secara terpadu.',
    actionChecklist: [
      'Surat Keterangan Kelahiran dari Rumah Sakit, Klinik, atau Bidan penolong.',
      'Buku Nikah / Akta Perkawinan orang tua.',
      'Kartu Keluarga (KK) asli orang tua.',
      'KTP-el kedua orang tua.'
    ],
    suggestedAction: {
      label: 'Lihat Panduan KK & Akta',
      route: '/layanan/1'
    }
  },
  {
    id: 'ktp-rusak-hilang-kemendagri',
    category: 'ktp',
    topic: 'Penggantian KTP-el Rusak atau Hilang',
    legalBasis: 'Permendagri No. 8 Tahun 2016 tentang Pedoman Penerbitan KTP-el (Pasal 8)',
    keywords: ['ktp rusak', 'ktp hilang', 'patah', 'chip rusak', 'buram', 'hilang dompet', 'surat polisi', 'ganti ktp'],
    summaryAnswer: 'Jika KTP-el rusak (patah, terkelupas, chip tidak terbaca): Bawa fisik KTP yang rusak ke kantor Disdukcapil/Kecamatan untuk langsung diganti baru tanpa perlu surat polisi.\nJika KTP-el hilang: Minta Surat Tanda Penerimaan Laporan Kehilangan (STPLK) dari Polsek setempat, lalu bawa bersama fotokopi KK.',
    actionChecklist: [
      'Untuk KTP Rusak: Bawa fisik KTP rusak + Fotokopi KK.',
      'Untuk KTP Hilang: Bawa Surat Kehilangan Polsek + Fotokopi KK.',
      'Tidak perlu perekaman sidik jari/foto ulang kecuali ada perubahan data fisik mendasar.'
    ],
    suggestedAction: {
      label: 'Cek Panduan KTP-el',
      route: '/layanan/2'
    }
  },
  {
    id: 'pindah-domisili-skpwni-perpres96',
    category: 'pindah',
    topic: 'Pindah Domisili Penduduk (SKPWNI) Tanpa Surat Pengantar RT/RW',
    legalBasis: 'Perpres No. 96 Tahun 2018 Pasal 25 & Permendagri No. 108 Tahun 2019',
    keywords: ['pindah', 'domisili', 'skpwni', 'antar kota', 'antar provinsi', 'rt rw', 'kelurahan', 'surat pindah', 'surat pengantar'],
    summaryAnswer: 'Pindah domisili kini TIDAK LAGI MEMERLUKAN surat pengantar RT/RW. Penduduk cukup membawa Kartu Keluarga (KK) ke kantor Disdukcapil daerah asal untuk diterbitkan SKPWNI.',
    actionChecklist: [
      'Kartu Keluarga (KK) asli daerah asal.',
      'KTP-el pemohon dan anggota keluarga yang ikut pindah.',
      'Alamat tujuan pindah lengkap (RT, RW, Desa/Kelurahan, Kecamatan, Kab/Kota).'
    ],
    suggestedAction: {
      label: 'Panduan Pindah Domisili',
      route: '/layanan/4'
    }
  },
  {
    id: 'standar-berkas-tte-barcode-permendagri109',
    category: 'foto_berkas',
    topic: 'Ketentuan Fisik Dokumen Kependudukan Ber-barcode (TTE) & Legalisir',
    legalBasis: 'Permendagri No. 109 Tahun 2019 tentang Formulir dan Buku Dokumen Adminduk',
    keywords: ['barcode', 'tte', 'qr code', 'legalisir', 'kertas hvs', 'a4', 'tanda tangan elektronik', 'cap basah', 'foto berkas'],
    summaryAnswer: 'Semua dokumen adminduk terbitan terbaru (sejak 2019) menggunakan kertas putih HVS A4 80 gram dengan Tanda Tangan Elektronik (TTE) berupa Barcode QR Code. Dokumen ini SAH secara hukum dan TIDAK PERLU DILEGALISIR LAGI oleh Disdukcapil.',
    actionChecklist: [
      'Pastikan saat memfoto dokumen, barcode QR Code tidak tertutup, tidak terpotong, dan tidak silau.',
      'Verifikasi keaslian dokumen dapat dipindai menggunakan aplikasi pemindai QR Code di smartphone (terhubung ke situs resmi Dukcapil Kemendagri).'
    ],
    suggestedAction: {
      label: 'Unggah Berkas ke DaftarIn',
      route: '/persiapan/dokumen'
    }
  },
  {
    id: 'waktu-layanan-spm-dukcapil',
    category: 'jam_layanan',
    topic: 'Standar Waktu Penyelesaian Dokumen & Jam Operasional Loket',
    legalBasis: 'Permendagri No. 19 Tahun 2018 tentang Peningkatan Kualitas Layanan Adminduk',
    keywords: ['jam', 'waktu', 'buka', 'tutup', 'kantor', 'loket', 'hari kerja', 'berapa hari', 'durasi', 'jadwal'],
    summaryAnswer: 'Standar Pelayanan Minimal (SPM) penerbitan dokumen digital adalah 1 hingga 3 hari kerja setelah berkas dinyatakan lengkap oleh petugas verifikasi. Jam pelayanan loket fisik di kelurahan dan Disdukcapil umumnya buka Senin–Jumat pukul 08.00–15.00 WIB.',
    actionChecklist: [
      'Gunakan DaftarIn untuk pra-verifikasi berkas Anda 24 jam sebelum datang ke kantor kelurahan.',
      'Bawa struk bukti persiapan berkas untuk mempercepat giliran pemeriksaan loket.'
    ],
    suggestedAction: {
      label: 'Cek Status Pelacakan',
      route: '/pelacakan'
    }
  }
];

// Helper: Indonesian Stopwords Removal
const STOPWORDS = new Set([
  'yang', 'untuk', 'pada', 'ke', 'para', 'namun', 'menurut', 'antara', 'dia', 'dua',
  'ia', 'seperti', 'jika', 'sehingga', 'kembali', 'dan', 'ini', 'karena', 'oleh',
  'saat', 'sejak', 'ada', 'agar', 'bisa', 'saya', 'kami', 'kamu', 'anda', 'apakah',
  'bagaimana', 'apa', 'kenapa', 'mengapa', 'dimana', 'kapan', 'sudah', 'belum', 'tolong'
]);

/**
 * Mesin Retrieval RAG: Menemukan regulasi kependudukan paling relevan berbasis query warga
 */
export function retrieveAdmindukKnowledge(userQuery: string, activeServiceId?: number): RagResult {
  const queryClean = userQuery.toLowerCase().trim();
  const tokens = queryClean
    .split(/[\s,?.!-]+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));

  let ranked = ADMINDUK_KNOWLEDGE_CORPUS.map(chunk => {
    let score = 0;

    // 1. Title / Topic Match
    const topicLower = chunk.topic.toLowerCase();
    tokens.forEach(tok => {
      if (topicLower.includes(tok)) score += 6;
    });

    // 2. Keyword Match
    chunk.keywords.forEach(kw => {
      if (queryClean.includes(kw)) score += 8;
      tokens.forEach(tok => {
        if (kw === tok) score += 5;
        else if (kw.includes(tok)) score += 2;
      });
    });

    // 3. Summary Content Match
    const contentLower = chunk.summaryAnswer.toLowerCase();
    tokens.forEach(tok => {
      if (contentLower.includes(tok)) score += 2;
    });

    // 4. Contextual Service Bias (jika warga sedang membuka alur layanan tertentu)
    if (activeServiceId === 1 && chunk.category === 'kk') score += 4;
    if (activeServiceId === 2 && chunk.category === 'ktp') score += 4;
    if (activeServiceId === 3 && chunk.category === 'akta') score += 4;
    if (activeServiceId === 4 && chunk.category === 'pindah') score += 4;

    return { chunk, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  // Fallback default jika tidak ada keyword yang cocok
  const best = ranked[0]?.score > 3 ? ranked[0].chunk : ADMINDUK_KNOWLEDGE_CORPUS[0];
  const matchedChunks = ranked.filter(r => r.score > 3).slice(0, 3).map(r => r.chunk);
  if (matchedChunks.length === 0) matchedChunks.push(best);

  // Sintesis Jawaban Terstruktur RAG
  const synthesizedAnswer = best.summaryAnswer;
  const legalCitations = Array.from(new Set(matchedChunks.map(c => c.legalBasis)));
  const actionSteps = best.actionChecklist;

  return {
    query: userQuery,
    matchedChunks,
    bestMatch: best,
    relevanceScore: ranked[0]?.score || 0,
    synthesizedAnswer,
    legalCitations,
    actionSteps,
    quickAction: best.suggestedAction
  };
}
