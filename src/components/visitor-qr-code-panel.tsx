"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Download, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVisitorPageUrl } from "@/lib/app-url";

export function VisitorQrCodePanel() {
  const [visitorUrl, setVisitorUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = getVisitorPageUrl(window.location.origin);
    setVisitorUrl(url);

    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then(setQrDataUrl)
      .catch(() => setError("QRコードの生成に失敗しました"));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(visitorUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("URLのコピーに失敗しました");
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ダッシュボードへ戻る
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">訪問者用 QRコード</h1>
            <p className="text-sm text-muted-foreground">
              受付に掲示してスキャンしてもらいます
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">来客受付画面への QRコード</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : qrDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="訪問者画面へのQRコード"
                className="rounded-lg border bg-white p-4"
                width={320}
                height={320}
              />
              <p className="break-all text-center text-sm text-muted-foreground">
                {visitorUrl}
              </p>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "コピーしました" : "URLをコピー"}
                </Button>
                <Button asChild className="flex-1">
                  <a href={qrDataUrl} download="visitor-reception-qr.png">
                    <Download className="mr-2 h-4 w-4" />
                    PNGをダウンロード
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">QRコードを生成中...</p>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        ※ QRコードは `/visitor`（訪問者画面）を開きます。管理者画面にはアクセスできません。
      </p>
    </div>
  );
}
