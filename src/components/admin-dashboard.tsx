"use client";

import { useState } from "react";
import { Users, AlertCircle, Clock, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVisitors } from "@/hooks/use-visitors";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import { STATUSES, type Status, type Visitor } from "@/lib/types";
import {
  countPending,
  formatDateTime,
  getLastVisitorTime,
  purposeBadgeClass,
} from "@/lib/visitor-storage";

export function AdminDashboard() {
  const { visitors, isReady, error, changeStatus, removeVisitor } = useVisitors({
    playChimeOnInsert: true,
    enablePolling: true,
  });
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const pendingCount = countPending(visitors);
  const totalCount = visitors.length;
  const lastVisitorTime = getLastVisitorTime(visitors);

  const sortedVisitors = [...visitors].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const handleAddToCalendar = (visitor: Visitor) => {
    if (!visitor.return_visit_scheduled_at) return;
    const url = buildGoogleCalendarUrl(visitor);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConfirmDelete = async () => {
    if (!visitorToDelete) return;

    try {
      setActionError(null);
      await removeVisitor(visitorToDelete.id);
      setVisitorToDelete(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "来客データの削除に失敗しました",
      );
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      setActionError(null);
      await changeStatus(id, status);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "ステータスの更新に失敗しました",
      );
    }
  };

  return (
    <>
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            管理者ダッシュボード
          </h1>
          <p className="text-sm text-muted-foreground">
            来客履歴の確認と対応管理（リアルタイム同期）
          </p>
        </header>

        {(error || actionError) && (
          <p className="mb-4 text-sm text-destructive">{error ?? actionError}</p>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未対応数</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {isReady ? pendingCount : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総来客数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isReady ? totalCount : "—"}
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最終来客時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {isReady
                  ? lastVisitorTime
                    ? formatDateTime(lastVisitorTime)
                    : "—"
                  : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>来客履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {!isReady ? (
              <p className="text-sm text-muted-foreground">読み込み中...</p>
            ) : sortedVisitors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                来客履歴はありません
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">日時</TableHead>
                    <TableHead className="w-[110px]">用件</TableHead>
                    <TableHead className="w-[110px]">名前</TableHead>
                    <TableHead>伝言</TableHead>
                    <TableHead className="w-[150px]">再来訪予定</TableHead>
                    <TableHead className="w-[130px]">ステータス</TableHead>
                    <TableHead className="w-[120px]">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTime(visitor.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={purposeBadgeClass(visitor.purpose)}
                        >
                          {visitor.purpose}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {visitor.visitor_name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {visitor.message || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {visitor.return_visit_scheduled_at
                          ? formatDateTime(visitor.return_visit_scheduled_at)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={visitor.status}
                          onValueChange={(value: Status) =>
                            handleStatusChange(visitor.id, value)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {visitor.return_visit_scheduled_at && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="カレンダー登録"
                              onClick={() => handleAddToCalendar(visitor)}
                            >
                              <span aria-hidden="true">📅</span>
                              <span className="sr-only">カレンダー登録</span>
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="削除"
                            onClick={() => setVisitorToDelete(visitor)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">削除</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={visitorToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setVisitorToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>来客履歴を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {visitorToDelete && (
                <>
                  <span className="font-medium text-foreground">
                    {visitorToDelete.visitor_name}
                  </span>
                  さん（{visitorToDelete.purpose}）の履歴を削除します。
                  この操作は取り消せません。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
