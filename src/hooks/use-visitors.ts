"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Status, Visitor } from "@/lib/types";
import { playNotificationChime } from "@/lib/chime";
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from "@/lib/realtime";

interface UseVisitorsOptions {
  playChimeOnInsert?: boolean;
  enablePolling?: boolean;
}

async function fetchVisitors(): Promise<Visitor[]> {
  const response = await fetch("/api/visitors", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("来客データの取得に失敗しました");
  }

  const data = (await response.json()) as { visitors: Visitor[] };
  return data.visitors;
}

export function useVisitors(options: UseVisitorsOptions = {}) {
  const { playChimeOnInsert = false, enablePolling = false } = options;
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isReadyRef = useRef(false);

  const refresh = useCallback(
    async (opts?: { detectNew?: boolean }) => {
      const data = await fetchVisitors();

      if (
        opts?.detectNew &&
        playChimeOnInsert &&
        isReadyRef.current &&
        knownIdsRef.current.size > 0
      ) {
        const hasNewVisitor = data.some(
          (visitor) => !knownIdsRef.current.has(visitor.id),
        );

        if (hasNewVisitor) {
          playNotificationChime();
        }
      }

      knownIdsRef.current = new Set(data.map((visitor) => visitor.id));
      setVisitors(data);
      setError(null);
      return data;
    },
    [playChimeOnInsert],
  );

  useEffect(() => {
    refresh()
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "来客データの取得に失敗しました",
        );
      })
      .finally(() => {
        isReadyRef.current = true;
        setIsReady(true);
      });
  }, [refresh]);

  useEffect(() => {
    if (!enablePolling || !isReady) return;

    const intervalId = window.setInterval(() => {
      refresh({ detectNew: true }).catch(() => {
        // ポーリング失敗は次回に任せる
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, isReady, refresh]);

  useEffect(() => {
    return subscribeRealtimeEvents((event) => {
      if (event.type === "INSERT") {
        setVisitors((prev) => {
          if (prev.some((visitor) => visitor.id === event.visitor.id)) {
            return prev;
          }

          knownIdsRef.current.add(event.visitor.id);

          if (playChimeOnInsert) {
            playNotificationChime();
          }

          return [event.visitor, ...prev];
        });
        return;
      }

      if (event.type === "UPDATE") {
        setVisitors((prev) =>
          prev.map((visitor) =>
            visitor.id === event.visitor.id ? event.visitor : visitor,
          ),
        );
        return;
      }

      knownIdsRef.current.delete(event.id);
      setVisitors((prev) => prev.filter((visitor) => visitor.id !== event.id));
    });
  }, [playChimeOnInsert]);

  const addVisitor = useCallback(
    async (
      data: Pick<
        Visitor,
        "purpose" | "visitor_name" | "message" | "return_visit_scheduled_at"
      >,
    ) => {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "呼出通知の送信に失敗しました");
      }

      const result = (await response.json()) as { visitor: Visitor };
      knownIdsRef.current.add(result.visitor.id);
      broadcastRealtimeEvent({ type: "INSERT", visitor: result.visitor });
      return result.visitor;
    },
    [],
  );

  const changeStatus = useCallback(async (id: string, status: Status) => {
    const response = await fetch(`/api/visitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("ステータスの更新に失敗しました");
    }

    const result = (await response.json()) as { visitor: Visitor };
    setVisitors((prev) =>
      prev.map((visitor) =>
        visitor.id === result.visitor.id ? result.visitor : visitor,
      ),
    );
    broadcastRealtimeEvent({ type: "UPDATE", visitor: result.visitor });
    return result.visitor;
  }, []);

  const removeVisitor = useCallback(async (id: string) => {
    const response = await fetch(`/api/visitors/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("来客データの削除に失敗しました");
    }

    knownIdsRef.current.delete(id);
    setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));
    broadcastRealtimeEvent({ type: "DELETE", id });
  }, []);

  return {
    visitors,
    isReady,
    error,
    refresh,
    addVisitor,
    changeStatus,
    removeVisitor,
  };
}
