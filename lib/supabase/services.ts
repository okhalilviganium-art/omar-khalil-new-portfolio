import { createClient } from "./client";
import type { DbService } from "@/types/supabase";
import type { ServiceCard } from "@/types";

export async function getServices(): Promise<ServiceCard[]> {
  const s = createClient();
  const { data, error } = await s
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbService[]).map((r) => ({
    id: r.id,
    icon: r.icon,
    name: r.name,
    desc: r.description,
    category: r.category || "",
    active: r.active !== false,
  }));
}

export async function getServicesRaw(): Promise<DbService[]> {
  const s = createClient();
  const { data, error } = await s
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbService[];
}

export async function syncServices(cards: ServiceCard[]): Promise<void> {
  const s = createClient();
  const rows = cards.map((c, i) => ({
    icon: c.icon,
    name: c.name,
    description: c.desc,
    category: c.category || "",
    active: c.active !== false,
    sort_order: i,
  }));

  const { error: delErr } = await s.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;

  const { error } = await s.from("services").insert(rows);
  if (error) throw error;
}
