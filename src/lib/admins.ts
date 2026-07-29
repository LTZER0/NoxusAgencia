export const ADMIN_EMAILS = [
  'lutoy70@gmail.com',
  'diegoaugusto.davo@gmail.com'
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
