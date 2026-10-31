import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { mockAuth } from "./mockAuth";
import type { Account, RegisterInput } from "./types";
interface AuthValue {
  user: Account | null;
  login: (identifier: string, password: string) => Promise<Account>;
  register: (input: RegisterInput) => Promise<Account>;
  logout: () => void;
  updateProfile: (input: { name: string; phone: string }) => void;
}
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(() =>
    mockAuth.currentUser(),
  );
  useEffect(() => {
    const check = () => {
      if (!mockAuth.currentUser()) setUser(null);
    };
    const timer = window.setInterval(check, 30000);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, []);
  const value: AuthValue = {
    user,
    login: async (identifier, password) => {
      const account = await mockAuth.login(identifier, password);
      setUser(account);
      return account;
    },
    register: async (input) => {
      const account = await mockAuth.register(input);
      setUser(account);
      return account;
    },
    logout: () => {
      mockAuth.logout();
      setUser(null);
    },
    updateProfile: (input) => setUser(mockAuth.updateProfile(input)),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider is required.");
  return auth;
}
