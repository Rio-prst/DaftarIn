import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

interface Message {
  sender: "user" | "bot";
  text: string;
  sources?: string[];
  time?: string;
}

const KNOWLEDGE_BASE = [
  {
    keywords: ["ejaan", "nama", "beda", "huruf"],
    reply:
      "Bandingkan data yang kamu isi dengan dokumen sumber. Buka tahap Data untuk memperbaiki isian, atau tahap Dokumen untuk mengganti berkas. Setiap perubahan data atau berkas akan menandai pemeriksaan lama agar diperiksa ulang.",
    sources: [
      "Permendagri No. 73 Tahun 2022 tentang Pencatatan Nama pada Dokumen Kependudukan",
    ],
  },
  {
    keywords: ["biaya", "tarif", "bayar", "gratis", "lama", "waktu"],
    reply:
      "Pengurusan dokumen kependudukan seperti Pembaruan Kartu Keluarga dan KTP-el pada Disdukcapil tidak dipungut biaya (Rp 0 / Gratis) sesuai UU No. 24 Tahun 2013. Estimasi penyelesaian standar adalah 1–3 hari kerja setelah berkas dinyatakan lengkap.",
    sources: ["UU No. 24 Tahun 2013 Pasal 79A"],
  },
  {
    keywords: [
      "barcode",
      "terpotong",
      "buram",
      "foto",
      "scan",
      "dokumen",
      "perbaikan",
    ],
    reply:
      "Ambil foto ulang dengan seluruh sudut dokumen dan barcode/QR terlihat utuh. Di tahap Dokumen, kamu dapat mengganti berkas ke Versi 2 (atau memuat berkas contoh perbaikan utuh), lalu menjalankan pemeriksaan ulang di tahap Pemeriksaan.",
    sources: ["Permendagri No. 109 Tahun 2019 tentang Formulir dan Buku Adminduk"],
  },
];

export const ChatbotModal: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { user, isChatOpen, closeChat } = useApp();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const onClose = propOnClose || closeChat;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `Halo ${user?.name || "Warga"}, ada langkah yang membingungkan? Aku bisa membantu menjelaskan cara menggunakan DaftarIn.`,
      sources: [],
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
      const first = controls[0],
        last = controls[controls.length - 1];
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
          "Coba buka panduan layanan atau tanyakan cara menyiapkan foto dokumen dan memperbaiki isian. Bantuan demo ini belum terhubung ke layanan AI.";
        botSources = [];
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
    }, 600);
  };

  const quickPrompts = [
    "Kenapa ejaan nama saya terdeteksi beda?",
    "Berapa biaya pengurusan KK?",
    "Kenapa barcode KK tidak boleh terpotong?",
    "Berapa lama proses pembuatan KTP?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4 animate-fade-in font-sans">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-heading"
        className="bg-white rounded-xl w-full max-w-[540px] shadow-lg flex flex-col h-[620px] max-h-[90vh] overflow-hidden border border-[#DDE5EF]"
      >
        {/* Header */}
        <div className="h-[68px] bg-[#142C4B] px-5 flex items-center justify-between text-white border-b border-[#233F66] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1769D2] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">
                smart_toy
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="help-heading"
                  className="font-display font-bold text-[16px] leading-tight"
                >
                  Bantuan DaftarIn
                </h3>
              </div>
              <p className="text-[12px] text-[#C8DCF5] mt-0.5">
                Panduan penggunaan · jawaban contoh
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup bantuan"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Message Log */}
        <div
          role="log"
          aria-live="polite"
          className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F5F7FB]"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-[#1769D2] text-white rounded-br-none"
                    : "bg-white text-[#172B45] border border-[#DDE5EF] rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#DDE5EF] text-[11px] text-[#52657A]">
                    <span className="font-bold text-[#142C4B] block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#1769D2]">
                        verified
                      </span>
                      Rujukan Regulasi Resmi:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {m.sources.map((s, idx) => (
                        <li key={idx} className="text-[#52657A]">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.time && (
                  <div
                    className={`text-[10px] mt-1.5 text-right ${m.sender === "user" ? "text-white/70" : "text-[#74777E]"}`}
                  >
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-[#52657A] text-[12px] bg-white p-3 rounded-xl border border-[#DDE5EF] w-max shadow-sm">
              <span className="animate-spin material-symbols-outlined text-[16px] text-[#1769D2]">
                progress_activity
              </span>
              <span>Menyiapkan penjelasan dari panduan DaftarIn...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-[#DDE5EF] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              className="whitespace-nowrap px-2.5 py-1 bg-[#F5F7FB] hover:bg-[#E7F0FF] text-[#1769D2] hover:text-[#1256AE] border border-[#DDE5EF] rounded-full text-[11px] font-medium transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="p-3 bg-white border-t border-[#DDE5EF] flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Pertanyaan bantuan"
            placeholder="Tanyakan langkah yang membingungkan…"
            className="flex-1 px-3.5 py-2 text-[13px] border border-[#DDE5EF] rounded-lg focus:outline-none focus:border-[#1769D2] text-[#172B45]"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-4 py-2 bg-[#1769D2] hover:bg-[#1256AE] disabled:opacity-40 text-white font-semibold rounded-lg text-[13px] transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span>Kirim</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
