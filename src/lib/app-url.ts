export function getAppBaseUrl(fallbackOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getVisitorPageUrl(fallbackOrigin?: string): string {
  return `${getAppBaseUrl(fallbackOrigin)}/visitor`;
}
