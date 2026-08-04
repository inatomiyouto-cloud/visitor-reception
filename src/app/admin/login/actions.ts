"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminAuthCookieOptions,
  ADMIN_AUTH_COOKIE,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export interface LoginState {
  error?: string;
}

export async function loginAdmin(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState | null> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "パスワードを入力してください" };
  }

  if (!verifyAdminPassword(password)) {
    return { error: "パスワードが正しくありません" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE, "true", adminAuthCookieOptions);

  const from = formData.get("from");
  if (typeof from === "string" && from.startsWith("/admin/dashboard")) {
    redirect(from);
  }

  redirect("/admin/dashboard");
}
