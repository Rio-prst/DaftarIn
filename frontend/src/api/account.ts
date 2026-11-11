import { request } from "./transport";
export interface AccountProfile {
  id: string;
  display_name: string;
  email: string;
  phone: string;
  identity?: {
    nik_last_four: string;
    family_card_last_four: string;
    photo_uploaded: boolean;
  } | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}
export interface AccountPreferences {
  font_size: "normal" | "large";
  high_contrast: boolean;
  notify_in_app: boolean;
}
export interface AccountSession {
  id: string;
  current: boolean;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
}
export const accountApi = {
  profile: () => request<AccountProfile>("/account"),
  updateProfile: (name: string, phone: string, version?: string) =>
    request<AccountProfile>("/account/profile", {
      method: "PATCH",
      body: {
        display_name: name,
        phone,
        ...(version ? { expected_updated_at: version } : {}),
      },
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/account/password", {
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword },
    }),
  sessions: () => request<AccountSession[]>("/account/sessions"),
  revokeSession: (id: string) =>
    request<void>("/account/sessions/" + encodeURIComponent(id), {
      method: "DELETE",
    }),
  preferences: () => request<AccountPreferences>("/account/preferences"),
  updatePreferences: (body: AccountPreferences) =>
    request<AccountPreferences>("/account/preferences", {
      method: "PATCH",
      body,
    }),
};
