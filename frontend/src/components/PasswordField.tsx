import { useState } from "react";
export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete = "current-password",
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={
            error ? id + "-error" : hint ? id + "-hint" : undefined
          }
        />
        <button
          type="button"
          aria-label={
            (visible ? "Sembunyikan " : "Tampilkan ") + label.toLowerCase()
          }
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? "Sembunyikan" : "Lihat"}
        </button>
      </div>
      {hint && !error && (
        <p id={id + "-hint"} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={id + "-error"} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
