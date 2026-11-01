import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { accountApi, type AccountPreferences } from "../api/account";
import { UserPreferencesContext } from "./context";
const defaults: AccountPreferences = {
  font_size: "normal",
  high_contrast: false,
  notify_in_app: true,
};
export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user, mode } = useAuth();
  const owner = user?.id;
  const ownerRef = useRef(owner);
  const [preferences, setPreferences] = useState(defaults);
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setPreferences(defaults);
    setError(null);
    setSaving(false);
    setLoading(true);
    try {
      let value = defaults;
      if (mode === "api" && owner) value = await accountApi.preferences();
      else {
        const stored = JSON.parse(
          localStorage.getItem("daftarin:" + (owner || "guest") + ":preferences:v1") ||
            "null",
        );
        if (
          stored &&
          ["normal", "large"].includes(stored.font_size) &&
          typeof stored.high_contrast === "boolean" &&
          typeof stored.notify_in_app === "boolean"
        )
          value = stored;
      }
      const guest=JSON.parse(localStorage.getItem('daftarin:guest:preferences:v1')||'null');
      if(guest&&['normal','large'].includes(guest.font_size)&&typeof guest.high_contrast==='boolean')value={...value,font_size:guest.font_size,high_contrast:guest.high_contrast};
      if (ownerRef.current === owner) setPreferences(value);
    } catch (cause) {
      if (ownerRef.current === owner)
        setError(
          cause instanceof Error
            ? cause.message
            : "Setelan belum dapat dimuat.",
        );
    } finally {
      if (ownerRef.current === owner) setLoading(false);
    }
  }, [owner, mode]);
  useEffect(() => {
    ownerRef.current = owner;
    void reload();
    return () => { ownerRef.current = undefined; };
  }, [reload, owner]);
  useEffect(() => {
    const element = document.documentElement;
    const originalSize = element.style.fontSize;
    const originalContrast = element.dataset.contrast;
    element.style.fontSize = preferences.font_size === "large" ? "20px" : "";
    if (preferences.high_contrast) element.dataset.contrast = "high";
    else delete element.dataset.contrast;
    return () => {
      element.style.fontSize = originalSize;
      if (originalContrast) element.dataset.contrast = originalContrast;
      else delete element.dataset.contrast;
    };
  }, [preferences.font_size, preferences.high_contrast]);
  const save = async (value: AccountPreferences) => {
    setSaving(true);
    try {
      const next =
        mode === "api" && owner ? await accountApi.updatePreferences(value) : value;
      if (mode === "demo" || !owner)
        localStorage.setItem(
          "daftarin:" + (owner || "guest") + ":preferences:v1",
          JSON.stringify(next),
        );
      if(owner)localStorage.removeItem('daftarin:guest:preferences:v1');
      if (ownerRef.current === owner) {
        setPreferences(next);
        setError(null);
      }
    } finally {
      if (ownerRef.current === owner) setSaving(false);
    }
  };
  return (
    <UserPreferencesContext.Provider
      value={{ preferences, isLoading, error, isSaving, save, reload }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}
