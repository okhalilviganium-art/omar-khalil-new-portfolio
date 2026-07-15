"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCountAction } from "@/lib/actions/messages";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useUnreadMessageCount() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const c = await getUnreadCountAction();
      setCount(c);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("messages-badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          setCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<{ status: string }>) => {
          const newStatus = (payload.new as { status: string }).status;
          const oldStatus = (payload.old as { status: string })?.status;
          if (oldStatus === "unread" && newStatus !== "unread") {
            setCount((prev) => Math.max(0, prev - 1));
          } else if (oldStatus !== "unread" && newStatus === "unread") {
            setCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return count;
}
