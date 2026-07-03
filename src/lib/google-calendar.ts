import type { Visitor } from "@/lib/types";

function formatGoogleCalendarDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

export function buildGoogleCalendarUrl(visitor: Visitor): string {
  if (!visitor.return_visit_scheduled_at) return "";

  const start = new Date(visitor.return_visit_scheduled_at);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `再来訪：${visitor.purpose} ${visitor.visitor_name}様`,
    dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
  });

  if (visitor.message) {
    params.set("details", visitor.message);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
