import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

interface Message {
  sender: "user" | "bot";
  text: string;
  sources?: string[];
  time?: string;
  quickActions?: { label: string; action: () => void }[];
}

interface KnowledgeItem {
  keywords: string[];
  reply: string;
  sources: string[];
  category: string;
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    category: "Perbedaan Nama & Ejaan",
    keywords: ["ejaan", "nama", "beda", "huruf", "salah tulis", "ijazah", "akta"],
    reply: "Apabila nama pada KTP/KK berbeda dengan Ijazah atau Akta Kelahiran, rujukan utama pencatatan adalah Akta Kelahiran resmi. Sesuai Permendagri No. 73/2022, perbaikan penulisan nama dapat dilakukan tanpa penetapan pengadilan selama tidak mengubah makna nama secara mendasar. Cukup lampirkan Ijazah terakhir dan Akta Kelahiran pada tahap 'Unggah Dokumen'.",
    sources: [
      "Permendagri No. 73 Tahun 2022 tentang Pencatatan Nama pada Dokumen Kependudukan",
      "Pasal 52 UU No. 24 Tahun 2013 tentang Administrasi Kependudukan"
    ]
  },
  {
    category: "Biaya & Waktu Proses",
    keywords: ["biaya", "tarif", "bayar", "gratis", "uang", "pungli", "lama", "waktu", "berapa hari", "durasi", "selesai"],
    reply: "Seluruh pengurusan dokumen kependudukan (KTP-el, KK, Akta Kelahiran, Surat Pindah) TIDAK DIPUNGUT BIAYA (100% GRATIS Rp 0). Jangan membayar kepada pihak manapun. Standar waktu penyelesaian dokumen digital (ber-barcode TTE) adalah 1–3 hari kerja sejak berkas dinyatakan lengkap oleh petugas verifikasi.",
    sources: [
      "UU No. 24 Tahun 2013 Pasal 79A (Larangan Pungutan Biaya Dokumen Kependudukan)",
      "Standar Pelayanan Minimal (SPM) Dirjen Dukcapil Kemendagri"
    ]
  },
  {
    category: "Foto Berkas & Barcode",
    keywords: ["barcode", "terpotong", "buram", "foto", "scan", "kamera", "gelap", "silau", "format", "ukuran", "mb"],
    reply: "Tips agar berkas langsung lolos verifikasi awal:\n1. Foto dokumen di atas meja datar dengan pencahayaan terang alami.\n2. Pastikan 4 sudut kartu/kertas terlihat utuh (tidak terpotong bingkai).\n3. Barcode QR Code harus tajam dan tidak terkena pantulan kilap lampu (flash).\n4. Format yang didukung: JPG, PNG, atau PDF dengan ukuran maksimal 5 MB per berkas.",
    sources: [
      "Permendagri No. 109 Tahun 2019 tentang Formulir dan Buku Dokumen Kependudukan"
    ]
  },
  {
    category: "Pembaruan Kartu Keluarga",
    keywords: ["kk", "keluarga", "nikah", "tambah anak", "pisah kk", "pecah kk", "pindah kk"],
    reply: "Untuk pengurusan Kartu Keluarga (KK):\n• Menikah Baru: Lampirkan Buku Nikah/Akta Perkawinan dan KK orang tua masing-masing.\n• Tambah Anak: Lampirkan Surat Keterangan Lahir dari Bidan/RS dan Buku Nikah.\n• Pecah KK: Bisa dilakukan bagi anggota keluarga yang sudah dewasa dan mandiri.",
    sources: [
      "Perpres No. 96 Tahun 2018 tentang Persyaratan dan Tata Cara Pendaftaran Penduduk"
    ]
  },
  {
    category: "KTP Hilang / Rusak",
    keywords: ["ktp hilang", "hilang", "rusak", "patah", "chip", "ganti ktp"],
    reply: "Jika KTP-el Anda hilang:\n1. Minta Surat Tanda Penerimaan Laporan Kehilangan (STPLK) dari Polsek setempat.\n2. Bawa salinan Kartu Keluarga (KK).\n3. Jika KTP rusak/patah, cukup bawa fisik KTP yang rusak ke kantor Disdukcapil/Kecamatan tanpa perlu surat polisi.",
    sources: [
      "Permendagri No. 8 Tahun 2016 tentang Penerbitan KTP Elektronik"
    ]
  },
  {
    category: "Jam Pelayanan & Lokasi",
    keywords: ["jam", "loket", "kantor", "kelurahan", "kecamatan", "buka", "tutup", "jadwal", "hari kerja"],
    reply: "Layanan tatap muka di Kantor Kelurahan dan Disdukcapil buka pada hari kerja: Senin–Jumat pukul 08.00–15.00 WIB. Melalui DaftarIn, Anda dapat memeriksa berkas secara mandiri 24 jam sebelum datang ke loket resmi.",
    sources: ["Pedoman Jam Pelayanan Publik Nasional"]
  }
];

export const ChatbotModal: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { user, isChatOpen, closeChat, activePreparation, services } = useApp();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const onClose = propOnClose || closeChat;

  const currentService = services.find((s) => s.id === activePreparation?.serviceId);

  const initialGreeting = currentService
    ? `Halo ${user?.name || "Bapak/Ibu"}! Saya Asisten AI DaftarIn. Saya melihat Anda sedang menyiapkan pengurusan ${currentService.name}. Ada dokumen atau persyaratan yang ingin ditanyakan?`
    : `Halo ${user?.name || "Bapak/Ibu"}! Saya Asisten AI Dokumen Kependudukan. Saya siap membantu memeriksa persyaratan KTP, Kartu Keluarga, Akta, dan aturan resmi Adminduk agar berkas Anda siap tanpa kendala.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: initialGreeting,
      sources: ["Layanan Asisten Cerdas Kependudukan RI"],
      time: "Baru saja",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeCallback = useRef(onClose);
  useEffect(() => {
    closeCallback.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const panel = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    panel.querySelector<HTMLInputElement>("input")?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCallback.current();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
        ),
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    panel.addEventListener("keydown", handleKey);
    return () => {
      panel.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendPrompt = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userQuery = text.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userQuery,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = userQuery.toLowerCase();
      const matched = KNOWLEDGE_BASE.find((item) =>
        item.keywords.some((kw) => lower.includes(kw)),
      );

      let botReply = "";
      let botSources: string[] = [];

      if (matched) {
        botReply = matched.reply;
        botSources = matched.sources;
      } else {
        botReply =
          "Terima kasih atas pertanyaannya. Untuk memastikan kelengkapan berkas kependudukan Anda, silakan ikuti alur 4 tahap DaftarIn (Kebutuhan → Biodata → Unggah Dokumen → Tinjau). Anda juga dapat memilih pertanyaan cepat di bawah ini untuk panduan spesifik seputar KTP, KK, atau Akta.";
        botSources = [
          "Standar Operasional Prosedur Pelayanan Adminduk Terpadu"
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          sources: botSources,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const quickPrompts = [
    "Berapa lama dan apakah ada biaya pengurusan?",
    "Bagaimana jika ejaan nama di KTP dan Ijazah berbeda?",
    "Tips agar foto KTP/KK lolos verifikasi dan tidak buram",
    "Apa syarat memperbarui Kartu Keluarga?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in font-sans">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-heading"
        className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl flex flex-col h-[640px] max-h-[92vh] overflow-hidden border border-[#D0DBE8]"
      >
        {/* Header Ramah Lansia & Berkontras Tinggi */}
        <div className="min-h-[72px] bg-[#0F223D] px-5 py-3 flex items-center justify-between text-white border-b border-[#1E3B66] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1769D2] flex items-center justify-center text-white shadow-md ring-2 ring-blue-400/30">
              <span className="material-symbols-outlined text-[24px]">
                support_agent
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="help-heading"
                  className="font-display font-bold text-[17px] tracking-tight leading-tight"
                >
                  Asisten Dokumen Warga
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Aktif 24 Jam
                </span>
              </div>
              <p className="text-[13px] text-[#C2D8F2] mt-0.5 font-medium">
                Panduan Resmi Adminduk &amp; Regulasi Kependudukan
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup bantuan"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Message Log dengan Teks Besar 15px & Spasi Lega */}
        <div
          role="log"
          aria-live="polite"
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#F8FAFC]"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3.5 text-[15px] sm:text-[16px] leading-relaxed shadow-xs ${
                  m.sender === "user"
                    ? "bg-[#1769D2] text-white rounded-br-xs font-medium"
                    : "bg-white text-[#0F223D] border border-[#CBD5E1] rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-[12px] sm:text-[13px] text-slate-600">
                    <span className="font-semibold text-slate-800">Dasar Hukum:</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                      {m.sources.map((s, idx) => (
                        <li key={idx} className="italic">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-[12px] text-slate-500 mt-1 px-1 font-medium">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-fit text-[14px]">
              <span className="material-symbols-outlined text-[18px] animate-spin text-[#1769D2]">
                sync
              </span>
              <span>Asisten sedang menyiapkan jawaban resmi…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Besar & Mudah Diklik Lansia) */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(q)}
              className="text-[13px] sm:text-[14px] bg-white border border-slate-300 hover:border-[#1769D2] hover:text-[#1769D2] text-slate-700 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all shadow-2xs shrink-0 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar (Tinggi Minimum 48px untuk Aksesibilitas Layar Sentuh) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#CBD5E1]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(input);
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan persyaratan dokumen Anda di sini…"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 h-[48px] text-[15px] sm:text-[16px] text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-2 focus:ring-[#1769D2]/20 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-[48px] px-5 rounded-xl bg-[#1769D2] hover:bg-[#1255AC] active:scale-95 text-white font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              aria-label="Kirim pertanyaan"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              <span className="hidden sm:inline text-[15px]">Tanya</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
