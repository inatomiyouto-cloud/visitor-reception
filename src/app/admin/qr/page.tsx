import type { Metadata } from "next";

import { VisitorQrCodePanel } from "@/components/visitor-qr-code-panel";

export const metadata: Metadata = {
  title: "訪問者用QRコード | 管理者",
  description: "来客受付画面へのQRコードを表示・ダウンロード",
};

export default function AdminQrPage() {
  return <VisitorQrCodePanel />;
}
