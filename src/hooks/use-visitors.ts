"use client";

import { useCallback, useEffect, useState } from "react";
import type { Status, Visitor } from "@/lib/types";
import {
  createVisitor,
  deleteVisitor,
  loadVisitors,
  saveVisitors,
  updateVisitorStatus,
} from "@/lib/visitor-storage";

export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setVisitors(loadVisitors());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveVisitors(visitors);
  }, [visitors, isReady]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "visitor-reception-data") {
        setVisitors(loadVisitors());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addVisitor = useCallback(
    (
      data: Pick<
        Visitor,
        "purpose" | "visitor_name" | "message" | "return_visit_scheduled_at"
      >,
    ) => {
      const visitor = createVisitor(data);
      setVisitors((prev) => [visitor, ...prev]);
      return visitor;
    },
    [],
  );

  const changeStatus = useCallback((id: string, status: Status) => {
    setVisitors((prev) => updateVisitorStatus(prev, id, status));
  }, []);

  const removeVisitor = useCallback((id: string) => {
    setVisitors((prev) => deleteVisitor(prev, id));
  }, []);

  return {
    visitors,
    isReady,
    addVisitor,
    changeStatus,
    removeVisitor,
  };
}
