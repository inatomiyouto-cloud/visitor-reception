import type { Purpose, Status, Visitor } from "@/lib/types";

export const STORAGE_KEY = "visitor-reception-data";
export const STORAGE_VERSION_KEY = "visitor-reception-data-version";
/** モックデータのスキーマが変わったらインクリメントする */
export const STORAGE_VERSION = 2;
export const MOCK_VISITORS: Visitor[] = [
  {
    id: "mock-1",
    created_at: "2026-07-02T09:15:00.000Z",
    purpose: "配達",
    visitor_name: "山田 太郎",
    message: "Amazonの荷物をお届けに参りました。",
    status: "未対応",
    return_visit_scheduled_at: null,
  },
  {
    id: "mock-2",
    created_at: "2026-07-02T10:30:00.000Z",
    purpose: "アポあり",
    visitor_name: "佐藤 花子",
    message: "14時の打ち合わせで参りました。",
    status: "対応中",
    return_visit_scheduled_at: "2026-07-10T05:00:00.000Z",
  },
  {
    id: "mock-3",
    created_at: "2026-07-02T11:00:00.000Z",
    purpose: "集金・営業",
    visitor_name: "鈴木 一郎",
    message: "新サービスのご提案です。",
    status: "対応済み",
    return_visit_scheduled_at: null,
  },
  {
    id: "mock-4",
    created_at: "2026-07-02T13:45:00.000Z",
    purpose: "その他",
    visitor_name: "田中 美咲",
    message: "書類の受け取りに参りました。",
    status: "未対応",
    return_visit_scheduled_at: "2026-07-05T06:30:00.000Z",
  },
];

function parseVisitor(value: unknown): Visitor | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    typeof v.created_at !== "string" ||
    typeof v.purpose !== "string" ||
    typeof v.visitor_name !== "string" ||
    typeof v.message !== "string" ||
    typeof v.status !== "string"
  ) {
    return null;
  }

  return {
    id: v.id,
    created_at: v.created_at,
    purpose: v.purpose as Visitor["purpose"],
    visitor_name: v.visitor_name,
    message: v.message,
    status: v.status as Visitor["status"],
    return_visit_scheduled_at:
      typeof v.return_visit_scheduled_at === "string"
        ? v.return_visit_scheduled_at
        : null,
  };
}

export function loadVisitors(): Visitor[] {
  if (typeof window === "undefined") return MOCK_VISITORS;

  try {
    const storedVersion = window.localStorage.getItem(STORAGE_VERSION_KEY);
    if (storedVersion !== String(STORAGE_VERSION)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VISITORS));
      window.localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return MOCK_VISITORS;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VISITORS));
      window.localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return MOCK_VISITORS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VISITORS));
      window.localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return MOCK_VISITORS;
    }
    const visitors = parsed
      .map(parseVisitor)
      .filter((visitor): visitor is Visitor => visitor !== null);

    if (visitors.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VISITORS));
      window.localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return MOCK_VISITORS;
    }
    return visitors;
  } catch {
    return MOCK_VISITORS;
  }
}

export function saveVisitors(visitors: Visitor[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
}

export function createVisitor(
  data: Pick<
    Visitor,
    "purpose" | "visitor_name" | "message" | "return_visit_scheduled_at"
  >,
): Visitor {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    purpose: data.purpose,
    visitor_name: data.visitor_name,
    message: data.message,
    status: "未対応",
    return_visit_scheduled_at: data.return_visit_scheduled_at,
  };
}

export function updateVisitorStatus(
  visitors: Visitor[],
  id: string,
  status: Status,
): Visitor[] {
  return visitors.map((visitor) =>
    visitor.id === id ? { ...visitor, status } : visitor,
  );
}

export function countPending(visitors: Visitor[]): number {
  return visitors.filter((v) => v.status === "未対応").length;
}

export function getLastVisitorTime(visitors: Visitor[]): string | null {
  if (visitors.length === 0) return null;

  const latest = visitors.reduce((prev, current) =>
    new Date(current.created_at).getTime() > new Date(prev.created_at).getTime()
      ? current
      : prev,
  );

  return latest.created_at;
}

export function deleteVisitor(visitors: Visitor[], id: string): Visitor[] {
  return visitors.filter((visitor) => visitor.id !== id);
}

export function purposeBadgeClass(purpose: Purpose): string {
  switch (purpose) {
    case "配達":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "アポあり":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "集金・営業":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "その他":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

export function statusBadgeClass(status: Status): string {
  switch (status) {
    case "未対応":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "対応中":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "対応済み":
      return "bg-green-100 text-green-800 hover:bg-green-100";
  }
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
