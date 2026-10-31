import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { retrieveAdmindukKnowledge, type RagResult } from "../utils/admindukRag";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  legalCitations?: string[];
  actionSteps?: string[];
  quickAction?: {
    label: string;
    route: string;
  };
  time: string;
}

export const ChatbotModal: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const navigate = useNavigate();
  const { user, isChatOpen, closeChat, activePreparation, services } = useApp();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const onClose = propOnClose || closeChat;

  const [seniorFontMode, setSeniorFontMode] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const currentService = services.find((s) => s.id === activePreparation?.serviceId);

  const greetingName = user?.name && user.name !== "Pengunjung" ? `Bapak/Ibu ${user.name.split(" ")[0]}` : "Bapak/Ibu";

  const initialGreeting = currentService
    ? `Halo ${greetingName}! Saya Asisten Regulasi Kependudukan DaftarIn. Saya melihat Anda sedang menyiapkan pengurusan ${currentService.name}. Silakan tanyakan hal seputar syarat berkas fisik, perbedaan ejaan nama, atau biaya resmi.`
    : `Halo ${greetingName}! Selamat datang di Asisten Layanan Kependudukan DaftarIn. Kami siap membantu Anda memahami persyaratan KTP-el, Kartu Keluarga, dan Akta sesuai regulasi resmi Kemendagri RI agar berkas Anda lengkap dan siap tanpa kendala di loket kelurahan.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: initialGreeting,
      legalCitations: [
        "UU No. 24 Tahun 2013 Pasal 79A (Pelayanan Adminduk Bebas Biaya Rp 0)",
        "Permendagri No. 109 Tahun 2019 (Dokumen Kependudukan Ber-barcode TTE Sah)",
      ],
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
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeak = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendPrompt = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userQuery = text.trim();
    setInput("");

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userQuery,
        time: now,
      },
    ]);
    setIsTyping(true);

    // Jalankan Mesin RAG Semantik Kependudukan
    setTimeout(() => {
      const ragResult: RagResult = retrieveAdmindukKnowledge(userQuery, activePreparation?.serviceId);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: ragResult.synthesizedAnswer,
          legalCitations: ragResult.legalCitations,
          actionSteps: ragResult.actionSteps,
          quickAction: ragResult.quickAction,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  const handleActionClick = (route: string) => {
    onClose();
    navigate(route);
  };

  const quickPrompts = [
    "Apakah ada biaya pengurusan dokumen?",
    "Ejaan nama di KTP dan Akta berbeda?",
    "Syarat memperbarui Kartu Keluarga",
    "KTP rusak atau hilang bagaimana?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in font-sans">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-heading"
        className="bg-white rounded-2xl w-full max-w-[580px] shadow-2xl flex flex-col h-[650px] max-h-[92vh] overflow-hidden border border-[#CBD5E1]"
      >
        {/* Header Ramah Lansia & Berkontras Tinggi */}
        <div className="min-h-[72px] bg-[#0F223D] px-5 py-3 flex items-center justify-between text-white border-b border-[#1E3B66] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1769D2] flex items-center justify-center text-white shadow-md ring-2 ring-blue-400/30 shrink-0">
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
                  Asisten Regulasi Warga
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  RAG Kemendagri
                </span>
              </div>
              <p className="text-[13px] text-[#C2D8F2] mt-0.5 font-medium">
                Pencarian Semantik Regulasi UU &amp; Standar Disdukcapil RI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Ukuran Teks untuk Kemudahan Membaca Lansia */}
            <button
              type="button"
              onClick={() => setSeniorFontMode(!seniorFontMode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                seniorFontMode
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="Perbesar teks untuk kemudahan membaca"
              aria-label="Ubah ukuran teks"
            >
              <span>{seniorFontMode ? "Teks Normal" : "Perbesar Teks"}</span>
            </button>

            <button
              type="button"
              aria-label="Tutup bantuan"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Message Log dengan Teks Nyaman & Suara Text-to-Speech */}
        <div
          role="log"
          aria-live="polite"
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#F8FAFC]"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[88%] rounded-2xl px-4 py-3.5 leading-relaxed shadow-xs ${
                  seniorFontMode ? "text-[17px]" : "text-[15px] sm:text-[16px]"
                } ${
                  m.sender === "user"
                    ? "bg-[#1769D2] text-white rounded-br-xs font-medium"
                    : "bg-white text-[#0F223D] border border-[#CBD5E1] rounded-bl-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-line flex-1">{m.text}</p>
                  {m.sender === "bot" && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(m.id, m.text)}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        speakingMsgId === m.id
                          ? "bg-amber-100 text-amber-700 animate-pulse"
                          : "text-slate-400 hover:text-[#1769D2] hover:bg-slate-100"
                      }`}
                      title={speakingMsgId === m.id ? "Hentikan suara" : "Dengarkan pesan suara"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {speakingMsgId === m.id ? "volume_off" : "volume_up"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Checklist Tindakan Warga */}
                {m.actionSteps && m.actionSteps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="font-bold text-[13px] text-slate-900 block mb-1">
                      Langkah yang Perlu Dilakukan:
                    </span>
                    <ul className="space-y-1.5 text-[13px] sm:text-[14px] text-slate-700">
                      {m.actionSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dasar Hukum Resmi (Citations dari RAG Kependudukan) */}
                {m.legalCitations && m.legalCitations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 text-[12px] sm:text-[13px] text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-[16px] text-[#1769D2]">
                        menu_book
                      </span>
                      Dasar Hukum Terkait:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {m.legalCitations.map((s, idx) => (
                        <li key={idx} className="italic text-slate-700">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tombol Aksi Langsung ke Rute Terkait */}
                {m.quickAction && (
                  <div className="mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleActionClick(m.quickAction!.route)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1769D2] font-semibold text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 border border-blue-200 transition-all active:scale-98 shadow-2xs"
                    >
                      <span>{m.quickAction.label}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
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
              <span>Menelusuri database regulasi resmi RI…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (TIDAK ADA SCROLLBAR WINDOWS JELEK LAGI) */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(q)}
              className="text-[13px] sm:text-[14px] font-medium bg-white border border-slate-300 hover:border-[#1769D2] hover:text-[#1769D2] text-slate-700 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all shadow-2xs shrink-0 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar Standar 48px untuk Aksesibilitas Touch / Desktop */}
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
              placeholder="Tanyakan syarat dokumen, biaya, atau ejaan nama di sini…"
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

export default ChatbotModal;
