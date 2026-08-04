"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import { loginAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminLoginFormProps {
  redirectPath?: string;
}

export function AdminLoginForm({ redirectPath }: AdminLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">管理者ログイン</h1>
          <p className="text-sm text-muted-foreground">
            ダッシュボードを表示するにはパスワードが必要です
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {redirectPath && (
            <input type="hidden" name="from" value={redirectPath} />
          )}

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="パスワードを入力"
              className="h-11"
              disabled={isPending}
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="h-11 w-full" disabled={isPending}>
            {isPending ? "確認中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </div>
  );
}
