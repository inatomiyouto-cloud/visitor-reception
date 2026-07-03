# 来客受付システム

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui で構築した来客受付のモックアップです。

## 画面

| パス | 説明 |
|------|------|
| `/` | トップページ（各画面へのリンク） |
| `/visitor` | 訪問者画面（モバイルファースト） |
| `/admin/dashboard` | 管理者ダッシュボード |

## データ

- フロントエンドのみ（`localStorage` + `useState`）
- 初回アクセス時にモックデータ 4 件を自動投入
- 訪問者画面からの送信は管理者画面と同一ストレージを共有

### データ構造

```typescript
{
  id: string;
  created_at: string;      // ISO 8601
  purpose: "配達" | "アポあり" | "集金・営業" | "その他";
  visitor_name: string;
  message: string;
  status: "未対応" | "対応中" | "対応済み";
}
```

## セットアップ

```bash
cd visitor-reception
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 動作確認のヒント

1. `/visitor` で用件・名前を入力して「呼出を通知する」を押す
2. `/admin/dashboard` で新しい来客が履歴に追加されていることを確認
3. ステータスをドロップダウンで変更し、未対応数が更新されることを確認
