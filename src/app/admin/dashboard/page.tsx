import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "来客履歴 | 管理者ダッシュボード",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
