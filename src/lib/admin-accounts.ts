export const ADMIN_EMAILS = ["admin_exchange@jbe.go.kr"] as const;

export function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
