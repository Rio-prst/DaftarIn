import { createContext, useContext } from "react";
import type { AccountPreferences } from "../api/account";
export interface PreferencesValue {
  preferences: AccountPreferences;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  save: (value: AccountPreferences) => Promise<void>;
  reload: () => Promise<void>;
}
export const UserPreferencesContext = createContext<PreferencesValue | null>(
  null,
);
export function useUserPreferences() {
  const value = useContext(UserPreferencesContext);
  if (!value) throw new Error("UserPreferencesProvider is required.");
  return value;
}
