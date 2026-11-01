import { request } from "./transport";
export interface ManagedAccount {
  id: string;
  display_name: string;
  email: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  roles: { code: string; agency: { id: string; name: string } | null }[];
}
export interface AgencyOption {
  id: string;
  name: string;
  region: { name: string };
}
export interface AuditEntry {
  id: string;
  action: string;
  objectType: string;
  objectId: string;
  outcome: string;
  createdAt: string;
  actor: { displayName: string } | null;
}
export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
}
const search = (q: string, cursor?: string) =>
  "?" + new URLSearchParams({ q, limit: "20", ...(cursor ? { cursor } : {}) });
export const adminApi = {
  users: (q: string, cursor?: string) =>
    request<CursorPage<ManagedAccount>>("/admin/users" + search(q, cursor)),
  agencies: () => request<AgencyOption[]>("/admin/agencies"),
  audit: (q: string, cursor?: string) =>
    request<CursorPage<AuditEntry>>("/admin/audit" + search(q, cursor)),
  changeAccess: (
    id: string,
    input: {
      role: "citizen" | "officer";
      status: "ACTIVE" | "SUSPENDED";
      agency_id?: string;
      current_password: string;
      expected_updated_at: string;
    },
  ) =>
    request<void>("/admin/users/" + encodeURIComponent(id) + "/access", {
      method: "PATCH",
      body: input,
    }),
};
