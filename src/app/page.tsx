import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">来客受付システム</h1>
        <p className="text-muted-foreground">
          訪問者受付と管理者ダッシュボードのモックアップ
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/visitor">訪問者画面</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/dashboard">管理者画面</Link>
        </Button>
      </div>
    </main>
  );
}
