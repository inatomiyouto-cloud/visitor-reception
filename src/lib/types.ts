export const PURPOSES = ["配達", "アポあり", "集金・営業", "その他"] as const;

export const STATUSES = ["未対応", "対応中", "対応済み"] as const;

export type Purpose = (typeof PURPOSES)[number];

export type Status = (typeof STATUSES)[number];

export interface Visitor {
  id: string;
  created_at: string;
  purpose: Purpose;
  visitor_name: string;
  message: string;
  status: Status;
  return_visit_scheduled_at: string | null;
}
