import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "管理者ログイン | 来客受付",
  description: "管理者ダッシュボードへのログイン",
};

interface AdminLoginPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const redirectPath =
    params.from?.startsWith("/admin/dashboard") ? params.from : undefined;

  return <AdminLoginForm redirectPath={redirectPath} />;
}
