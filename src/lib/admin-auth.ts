export const ADMIN_AUTH_COOKIE = "admin_authenticated";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

export function verifyAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}

export function isAdminAuthenticated(
  cookieValue: string | undefined,
): boolean {
  return cookieValue === "true";
}

export const adminAuthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
