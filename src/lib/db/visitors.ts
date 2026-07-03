import type { Purpose, Status, Visitor } from "@/lib/types";

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

const globalStore = globalThis as typeof globalThis & {
  __visitorDb?: Visitor[];
};

function getStore(): Visitor[] {
  if (!globalStore.__visitorDb) {
    globalStore.__visitorDb = structuredClone(MOCK_VISITORS);
  }
  return globalStore.__visitorDb;
}

export function listVisitors(): Visitor[] {
  return [...getStore()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function findVisitor(id: string): Visitor | undefined {
  return getStore().find((visitor) => visitor.id === id);
}

export function insertVisitor(
  data: Pick<
    Visitor,
    "purpose" | "visitor_name" | "message" | "return_visit_scheduled_at"
  >,
): Visitor {
  const visitor: Visitor = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    purpose: data.purpose,
    visitor_name: data.visitor_name,
    message: data.message,
    status: "未対応",
    return_visit_scheduled_at: data.return_visit_scheduled_at,
  };

  getStore().unshift(visitor);
  return visitor;
}

export function patchVisitorStatus(id: string, status: Status): Visitor | null {
  const store = getStore();
  const index = store.findIndex((visitor) => visitor.id === id);
  if (index === -1) return null;

  store[index] = { ...store[index], status };
  return store[index];
}

export function removeVisitor(id: string): boolean {
  const store = getStore();
  const index = store.findIndex((visitor) => visitor.id === id);
  if (index === -1) return false;

  store.splice(index, 1);
  return true;
}

export function isValidPurpose(value: unknown): value is Purpose {
  return (
    value === "配達" ||
    value === "アポあり" ||
    value === "集金・営業" ||
    value === "その他"
  );
}

export function isValidStatus(value: unknown): value is Status {
  return value === "未対応" || value === "対応中" || value === "対応済み";
}
