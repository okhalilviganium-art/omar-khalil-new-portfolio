"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dbToMessage } from "@/lib/supabase/messages";
import type { DbMessage } from "@/types/supabase";
import type { Message } from "@/lib/supabase/messages";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useMessagesRealtime(
  initial: Message[],
  opts?: { onInsert?: () => void }
) {
  const [messages, setMessages] = useState<Message[]>(initial);

  useEffect(() => {
    const id = requestAnimationFrame(() => { setMessages(initial); });
    return () => cancelAnimationFrame(id);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<DbMessage>) => {
          const newMsg = dbToMessage(payload.new as DbMessage);
          setMessages((prev) => [newMsg, ...prev]);
          opts?.onInsert?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<DbMessage>) => {
          const updated = dbToMessage(payload.new as DbMessage);
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<DbMessage>) => {
          const old = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return messages;
}
