import type { Visitor } from "@/lib/types";
import { formatDateTime } from "@/lib/visitor-storage";

function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function buildLineVisitorMessage(visitor: Visitor): string {
  const purpose = visitor.purpose;
  const visitorName = visitor.visitor_name.trim() || "未入力";
  const message = visitor.message.trim() || "なし";
  const returnVisit = visitor.return_visit_scheduled_at
    ? formatDateTime(visitor.return_visit_scheduled_at)
    : "なし";
  const dashboardUrl = `${getAppBaseUrl()}/admin/dashboard`;

  return [
    "🔔【来客がありました】",
    `${purpose} ${visitorName} 様`,
    `伝言：「${message}」`,
    `再来訪予定：${returnVisit}`,
    "",
    "👇ダッシュボードで対応ステータスを変更する",
    dashboardUrl,
  ].join("\n");
}

export async function sendLineVisitorNotification(
  visitor: Visitor,
): Promise<{ sent: boolean; mock: boolean; error?: string }> {
  const text = buildLineVisitorMessage(visitor);
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;

  if (!accessToken || !userId) {
    console.log("[LINE Mock] 環境変数未設定のため送信をスキップしました");
    console.log(
      "[LINE Mock] LINE_CHANNEL_ACCESS_TOKEN:",
      accessToken ? "設定済" : "未設定",
    );
    console.log("[LINE Mock] LINE_USER_ID:", userId ? "設定済" : "未設定");
    console.log(
      "[LINE Mock] NEXT_PUBLIC_APP_URL:",
      process.env.NEXT_PUBLIC_APP_URL ?? "未設定（localhost:3000 を使用）",
    );
    console.log("[LINE Mock] 送信内容:\n", text);
    return { sent: false, mock: true };
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[LINE] 送信失敗:", response.status, errorBody);
    return {
      sent: false,
      mock: false,
      error: `LINE API エラー (${response.status})`,
    };
  }

  console.log("[LINE] 来客通知を送信しました:", visitor.visitor_name);
  return { sent: true, mock: false };
}
