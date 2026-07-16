import { createAdminClient } from "./admin";
import type { DbStatistic } from "@/types/supabase";
import type { StatCard, SkillBar } from "@/types";

export async function getStatCards(): Promise<StatCard[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("statistics")
    .select("*")
    .eq("stat_type", "card")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbStatistic[]).map((r) => ({
    number: r.number_val ?? 0,
    label: r.name,
  }));
}

export async function getSkillBars(): Promise<SkillBar[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("statistics")
    .select("*")
    .eq("stat_type", "bar")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbStatistic[]).map((r) => ({
    name: r.name,
    pct: r.pct ?? 0,
  }));
}

export async function getStatisticsRaw(): Promise<DbStatistic[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("statistics")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbStatistic[];
}

export async function syncStatistics(
  cards: StatCard[],
  bars: SkillBar[]
): Promise<void> {
  const s = createAdminClient();
  const rows: Partial<DbStatistic>[] = [
    ...cards.map((c, i) => ({
      stat_type: "card" as const,
      name: c.label,
      number_val: c.number,
      pct: null,
      sort_order: i,
    })),
    ...bars.map((b, i) => ({
      stat_type: "bar" as const,
      name: b.name,
      number_val: null,
      pct: b.pct,
      sort_order: cards.length + i,
    })),
  ];

  const { error: delErr } = await s.from("statistics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;

  const { error } = await s.from("statistics").insert(rows);
  if (error) throw error;
}
