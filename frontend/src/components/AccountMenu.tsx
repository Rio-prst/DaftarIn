import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { roleLabels } from "../auth/mockAuth";
export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  if (!user) return null;
  return (
    <div className="account-menu" ref={root}>
      <button
        className="account-trigger"
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="account-menu-content"
        aria-label={"Menu akun " + user.name}
        onClick={() => setOpen(!open)}
      >
        <span className="user-initials" aria-hidden="true">
          {user.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>
        <span className="account-trigger-name">{user.name}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div id="account-menu-content" className="account-dropdown">
          <div>
            <strong>{user.name}</strong>
            <small>{roleLabels[user.role]}</small>
          </div>
          <Link to="/akun" onClick={() => setOpen(false)}>
            Akun saya
          </Link>
          <button
            type="button"
            disabled={leaving}
            onClick={async () => {
              setLeaving(true);
              setError("");
              try {
                await logout("/");
                navigate("/", { replace: true });
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Belum berhasil keluar. Coba lagi.",
                );
              } finally {
                setLeaving(false);
              }
            }}
          >
            {leaving ? "Sedang keluar…" : "Keluar"}
          </button>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
