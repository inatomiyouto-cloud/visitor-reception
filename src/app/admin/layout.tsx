import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理者ダッシュボード | 来客受付",
  description: "来客履歴の確認・対応管理",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/30">{children}</div>
  );
}
