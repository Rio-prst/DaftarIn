import { useAuth } from "../auth/AuthContext";
import { chatSessionKey, readChatSession, writeChatSession, type ChatMessage as Message } from "../utils/chatSession";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { askAdmindukRag, safeChatRoute } from "../utils/aiService";

const quickPrompts = [
  "Apakah ada biaya pengurusan dokumen?",
  "Ejaan nama di KTP dan Akta berbeda?",
  "Syarat memperbarui Kartu Keluarga",
  "KTP rusak atau hilang bagaimana?",
];

export function ChatbotModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storageKey = chatSessionKey(user?.id);
  const { isChatOpen, closeChat, activePreparation } = useApp();
  const isOpen = propIsOpen ?? isChatOpen;
  const onClose = propOnClose ?? closeChat;
  const [largeText, setLargeText] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => readChatSession(storageKey));
  useEffect(() => { writeChatSession(storageKey, messages); }, [storageKey, messages]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const closeCallback = useRef(onClose);

  useEffect(() => {
    closeCallback.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 && element.getClientRects().length > 0,
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
    dialog.addEventListener("keydown", keepFocusInside);
    return () => {
      dialog.removeEventListener("keydown", keepFocusInside);
      pending.current?.abort();
      setLoading(false);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [isOpen]);
  useEffect(() => {
    if (isOpen && logRef.current)
      logRef.current.scrollTop =
        messages.length === 1 ? 0 : logRef.current.scrollHeight;
  }, [isOpen, messages]);
  if (!isOpen) return null;

  const speak = (message: Message) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speakingId === message.id) {
      setSpeakingId(null);
      return;
    }
    const speech = new SpeechSynthesisUtterance(message.text);
    speech.lang = "id-ID";
    speech.rate = 0.95;
    speech.onend = () => setSpeakingId(null);
    speech.onerror = () => setSpeakingId(null);
    setSpeakingId(message.id);
    window.speechSynthesis.speak(speech);
  };
  const send = async (text: string) => {
    const query = text.trim();
    if (!query || loading) return;
    const id = crypto.randomUUID(),
      controller = new AbortController();
    pending.current = controller;
    setInput("");
    setLoading(true);
    const history = messages
      .filter((item) => item.id !== "welcome")
      .slice(-4)
      .map((item) => ({ sender: item.sender, text: item.text }));
    setMessages((previous) => [
      ...previous,
      { id: "question-" + id, sender: "user", text: query },
    ]);
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const result = await askAdmindukRag({
        query,
        activeServiceId: activePreparation?.serviceId,
        previousMessages: history,
        signal: controller.signal,
      });
      setMessages((previous) => [
        ...previous,
        { id: "answer-" + id, sender: "bot", ...result },
      ]);
    } catch {
      if (dialogRef.current?.open)
        setMessages((previous) => [
          ...previous,
          {
            id: "answer-" + id,
            sender: "bot",
            text: "Permintaan dihentikan atau koneksi terlalu lama. Coba lagi atau buka bantuan petugas.",
            quickAction: { label: "Bantuan petugas", route: "/bantuan" },
          },
        ]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id="service-chat-dialog"
      aria-labelledby="help-heading"
      aria-describedby="help-description"
      className="service-help-dialog"
      onCancel={(event) => {
        event.preventDefault();
        closeCallback.current();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCallback.current();
      }}
    >
      <section className="service-help-panel">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2
              id="help-heading"
              className="text-lg font-semibold text-[#17324D]"
            >
              Bantuan layanan
            </h2>
            <p
              id="help-description"
              className="mt-1 text-sm leading-relaxed text-slate-600"
            >
              Asisten membantu memahami panduan. Periksa sumber layanan sebelum
              mengurus di instansi.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Tutup bantuan"
            onClick={onClose}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </header>
        <div className="flex shrink-0 items-center justify-end border-b border-slate-200 px-4 py-1">
          <button
            type="button"
            aria-pressed={largeText}
            onClick={() => setLargeText((previous) => !previous)}
            className="min-h-[44px] rounded-lg px-2 text-sm font-medium text-[#17324D] hover:bg-slate-50"
          >
            {largeText ? "Gunakan teks biasa" : "Perbesar teks"}
          </button>
        </div>
        <div
          ref={logRef}
          role="log"
          aria-label="Percakapan bantuan"
          aria-live="polite"
          className={
            "min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 leading-relaxed sm:p-5 " +
            (largeText ? "text-lg" : "text-base")
          }
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                "min-w-0 rounded-xl border p-4 [overflow-wrap:anywhere] " +
                (message.sender === "user"
                  ? "ml-5 border-blue-200 bg-blue-50"
                  : "mr-2 border-slate-200 bg-white")
              }
            >
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 whitespace-pre-line">
                  {message.text}
                </p>
                {message.sender === "bot" && (
                  <button
                    type="button"
                    onClick={() => speak(message)}
                    aria-label={
                      speakingId === message.id
                        ? "Hentikan suara"
                        : "Dengarkan jawaban"
                    }
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      aria-hidden="true"
                    >
                      {speakingId === message.id ? "volume_off" : "volume_up"}
                    </span>
                  </button>
                )}
              </div>
              {message.notice && (
                <p className="text-sm mt-2" role="status">
                  {message.notice}
                </p>
              )}
              {message.source && (
                <p className="text-xs text-slate-500 mt-2">
                  {message.source === "ai"
                    ? "Asisten AI · panduan pendamping"
                    : "Panduan lokal"}
                </p>
              )}
              {Boolean(message.actionSteps?.length) && (
                <ol className="mt-3 list-decimal space-y-2 border-t border-slate-200 pl-5 pt-3">
                  {message.actionSteps?.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
              {Boolean(message.legalCitations?.length) && (
                <details className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
                  <summary className="cursor-pointer py-1 font-medium">
                    Rujukan dalam panduan
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {message.legalCitations?.map((citation) => (
                      <li key={citation}>{citation}</li>
                    ))}
                  </ul>
                </details>
              )}
              {message.quickAction && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (safeChatRoute(message.quickAction!.route))
                      navigate(message.quickAction!.route);
                  }}
                  className="mt-3 min-h-[44px] max-w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-[#17324D] hover:bg-slate-50"
                >
                  {message.quickAction.label} →
                </button>
              )}
            </article>
          ))}
        </div>
        <div
          className="flex shrink-0 gap-2 overflow-x-auto border-t border-slate-200 px-4 py-3"
          aria-label="Contoh pertanyaan"
        >
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={loading}
              onClick={() => void send(prompt)}
              className="min-h-[44px] shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        {loading && (
          <p className="px-4 py-2 text-sm" role="status">
            Asisten sedang menyiapkan jawaban…{" "}
            <button
              type="button"
              className="text-link min-h-[44px]"
              onClick={() => pending.current?.abort()}
            >
              Hentikan
            </button>
          </p>
        )}
        <button
          type="button"
          className="text-link px-4 min-h-[44px] text-sm"
          onClick={() => {
            onClose();
            navigate("/bantuan");
          }}
        >
          Masih bingung? Buka bantuan petugas
        </button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="flex shrink-0 gap-2 border-t border-slate-200 p-3 sm:p-4"
        >
          <label htmlFor="service-help-question" className="sr-only">
            Pertanyaan bantuan
          </label>
          <input
            id="service-help-question"
            type="text"
            value={input}
            maxLength={1000}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tulis pertanyaan…"
            className="min-h-[48px] min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Kirim pertanyaan"
            className="flex min-h-[48px] w-[48px] shrink-0 items-center justify-center rounded-lg bg-[#17324D] text-white disabled:opacity-50"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              send
            </span>
          </button>
        </form>
      </section>
    </dialog>
  );
}
export default ChatbotModal;
