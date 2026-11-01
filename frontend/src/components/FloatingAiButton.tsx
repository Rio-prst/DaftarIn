import { useEffect, useRef, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function FloatingAiButton() {
  const { openChat, isChatOpen } = useApp();
  const { pathname } = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    button.style.setProperty("--chat-footer-height", "0px");
    if (!pathname.startsWith("/persiapan/")) return;

    let footer: Element | null = null;
    const resize = new ResizeObserver(() => {
      button.style.setProperty(
        "--chat-footer-height",
        (footer?.getBoundingClientRect().height || 0) + "px",
      );
    });
    const attach = () => {
      const next = document.querySelector(".preparation-actions");
      if (next === footer) return;
      resize.disconnect();
      footer = next;
      if (footer) resize.observe(footer);
      button.style.setProperty(
        "--chat-footer-height",
        (footer?.getBoundingClientRect().height || 0) + "px",
      );
    };
    attach();
    // A lazy route can mount its sticky actions after this component's effect.
    const mutation = new MutationObserver(attach);
    mutation.observe(document.getElementById("root") || document.body, {
      childList: true,
      subtree: true,
    });
    return () => {
      mutation.disconnect();
      resize.disconnect();
    };
  }, [pathname]);

  return (
    <aside aria-label="Asisten panduan">
      <button
        ref={buttonRef}
        onClick={openChat}
        type="button"
        aria-label="Tanya asisten"
        aria-haspopup="dialog"
        aria-controls="service-chat-dialog"
        aria-expanded={isChatOpen}
        className={"floating-chat" + (isChatOpen ? " is-open" : "")}
        style={{ "--chat-footer-height": "0px" } as CSSProperties}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 11.5a8 8 0 0 1-8 8H5l-4 3 1.6-6A8 8 0 1 1 20 11.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            transform="translate(1 -1)"
          />
          <circle cx="8" cy="10.5" r="1" fill="currentColor" />
          <circle cx="12" cy="10.5" r="1" fill="currentColor" />
          <circle cx="16" cy="10.5" r="1" fill="currentColor" />
        </svg>
        <span className="floating-chat-label">Tanya asisten</span>
      </button>
    </aside>
  );
}
export default FloatingAiButton;
