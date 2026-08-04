import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "来客受付 | 訪問者画面",
  description: "用件・名前・伝言を入力してホストへ通知します",
};

export default function VisitorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">{children}</div>
  );
}
