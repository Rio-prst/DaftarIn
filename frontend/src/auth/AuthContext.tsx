import { clearChatSessions } from "../utils/chatSession";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  startTransition,
  type ReactNode,
} from "react";
import { mockAuth } from "./mockAuth";
import { serverAuth } from "./serverAuth";
import { accountApi } from "../api/account";
import { useNavigate } from "react-router-dom";
import type { Account, RegisterInput } from "./types";
export const SERVER_AUTH_ENABLED = import.meta.env.VITE_AUTH_MODE === "api";
interface AuthValue {
  user: Account | null;
  isLoading: boolean;
  error: string | null;
  mode: "api" | "demo";
  login: (identifier: string, password: string) => Promise<Account>;
  register: (
    input: RegisterInput,
  ) => Promise<{ account: Account; signedIn: boolean }>;
  logout: (redirect?: string) => Promise<void>;
  updateProfile: (input: {
    name: string;
    phone: string;
    expectedUpdatedAt?: string;
  }) => Promise<string | undefined>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<Account | null>(() =>
    SERVER_AUTH_ENABLED ? null : mockAuth.currentUser(),
  );
  const [isLoading, setIsLoading] = useState(SERVER_AUTH_ENABLED);
  const [error, setError] = useState<string | null>(null);
  const sessionGeneration = useRef(0);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      const generation = sessionGeneration.current;
      if (!SERVER_AUTH_ENABLED) {
        if (!mockAuth.currentUser()) setUser(null);
        return;
      }
      try {
        const account = await serverAuth.currentUser();
        if (alive && generation === sessionGeneration.current) {
          setUser(account);
          setError(null);
        }
      } catch (cause) {
        if (alive && generation === sessionGeneration.current)
          setError(
            cause instanceof Error
              ? cause.message
              : "Sesi belum dapat diperiksa.",
          );
      } finally {
        if (alive && generation === sessionGeneration.current)
          setIsLoading(false);
      }
    };
    if (SERVER_AUTH_ENABLED) void check();
    const focus = () => void check();
    const timer = SERVER_AUTH_ENABLED
      ? undefined
      : window.setInterval(focus, 30000);
    window.addEventListener("focus", focus);
    return () => {
      alive = false;
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, []);
  const value: AuthValue = {
    user,
    isLoading,
    error,
    mode: SERVER_AUTH_ENABLED ? "api" : "demo",
    login: async (identifier, password) => {
      const account = await (SERVER_AUTH_ENABLED
        ? serverAuth.login(identifier, password)
        : mockAuth.login(identifier, password));
      ++sessionGeneration.current;
      clearChatSessions();
      setUser(account);
      setError(null);
      setIsLoading(false);
      return account;
    },
    register: async (input) => {
      const account = await (SERVER_AUTH_ENABLED
        ? serverAuth.register(input)
        : mockAuth.register(input));
      clearChatSessions();
      if (!SERVER_AUTH_ENABLED) setUser(account);
      return { account, signedIn: !SERVER_AUTH_ENABLED };
    },
    logout: async (redirect) => {
      if (SERVER_AUTH_ENABLED) await serverAuth.logout();
      else mockAuth.logout();
      clearChatSessions();
      ++sessionGeneration.current;
      startTransition(() => {
        setUser(null);
        setError(null);
        setIsLoading(false);
        if (redirect) navigate(redirect, { replace: true });
      });
    },
    updateProfile: async (input) => {
      if (SERVER_AUTH_ENABLED) {
        const profile = await accountApi.updateProfile(
          input.name,
          input.phone,
          input.expectedUpdatedAt,
        );
        setUser((current) =>
          current?.id === profile.id
            ? { ...current, name: profile.display_name, phone: profile.phone }
            : current,
        );
        return profile.updated_at;
      }
      setUser(mockAuth.updateProfile(input));
      return undefined;
    },
    changePassword: async (currentPassword, newPassword) => {
      const targetEmail = user?.email || "";
      if (SERVER_AUTH_ENABLED)
        await accountApi.changePassword(currentPassword, newPassword);
      else await mockAuth.changePassword(currentPassword, newPassword);
      ++sessionGeneration.current;
      const targetUrl = `/masuk?password_changed=1${targetEmail ? "&email=" + encodeURIComponent(targetEmail) : ""}`;
      navigate(targetUrl, { replace: true });
      startTransition(() => {
        setUser(null);
        setIsLoading(false);
      });
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider is required.");
  return auth;
}
