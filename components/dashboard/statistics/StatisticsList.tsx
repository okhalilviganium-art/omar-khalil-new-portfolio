"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import {
  createStatistic,
  updateStatistic,
  deleteStatistic,
} from "@/lib/actions/statistics";
import { useDraft } from "@/hooks/useDraft";
import type { DbStatistic } from "@/types/supabase";

export default function StatisticsList({
  statistics,
}: {
  statistics: DbStatistic[];
}) {
  const cards = statistics.filter((s) => s.stat_type === "card");
  const bars = statistics.filter((s) => s.stat_type === "bar");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateBar, setShowCreateBar] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const editDefaults = { name: "", number_val: "", pct: "" };
  const { values: editVals, setValue: setEditVal, clearDraft: clearEditDraft } = useDraft(
    editingId ? "stat:" + editingId : "stat:_none",
    editDefaults
  );

  const startEdit = useCallback((stat: DbStatistic) => {
    setEditingId(stat.id);
    setEditVal("name", stat.name);
    setEditVal("number_val", String(stat.number_val ?? ""));
    setEditVal("pct", String(stat.pct ?? ""));
  }, [setEditVal]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await deleteStatistic(id);
      if (res.success) {
        toast("Statistic deleted");
        router.refresh();
      } else {
        toast(res.error || "Failed", "error");
      }
    } catch { toast("Failed", "error"); }
  };

  const handleCreate = async (fd: FormData) => {
    try {
      const res = await createStatistic(fd);
      if (res.success) {
        toast("Statistic created");
        setShowCreateCard(false);
        setShowCreateBar(false);
        router.refresh();
      } else {
        toast(res.error || "Failed", "error");
      }
    } catch { toast("Failed", "error"); }
  };

  const applyUpdate = useCallback(async (id: string, statType: string) => {
    const fd = new FormData();
    fd.append("stat_type", statType);
    fd.append("name", String(editVals.name));
    if (statType === "card") fd.append("number_val", String(editVals.number_val));
    if (statType === "bar") fd.append("pct", String(editVals.pct));
    try {
      const res = await updateStatistic(id, fd);
      if (res.success) {
        toast("Statistic updated");
        clearEditDraft();
        setEditingId(null);
        router.refresh();
      } else {
        toast(res.error || "Failed", "error");
      }
    } catch { toast("Failed", "error"); }
  }, [editVals, clearEditDraft, toast, router]);

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div
        className="dash-section-title"
        style={{ margin: 0, border: 0, padding: 0, marginBottom: "1.5rem" }}
      >
        Statistics
      </div>

      {/* Stat Cards Section */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".5rem" }}>
          <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
            Stat Cards ({cards.length})
          </div>
          <button className="dash-btn dash-btn-add" onClick={() => { setShowCreateCard(!showCreateCard); setShowCreateBar(false); }}>
            <i className="bi bi-plus-lg" /> Add Card
          </button>
        </div>

        {showCreateCard && (
          <div className="dash-section" style={{ marginBottom: "1rem", border: "1px solid var(--accent)", borderRadius: "12px", padding: "1.5rem", background: "rgba(108,99,255,.05)" }}>
            <div className="dash-section-title">New Stat Card</div>
            <form action={handleCreate}>
              <input type="hidden" name="stat_type" value="card" />
              <div className="dash-grid dash-grid-2">
                <div className="dash-field">
                  <label>Name</label>
                  <input name="name" required placeholder="e.g. Projects Done" />
                </div>
                <div className="dash-field">
                  <label>Number</label>
                  <input name="number_val" type="number" required placeholder="0" />
                </div>
              </div>
              <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                <button className="dash-btn dash-btn-save" type="submit"><i className="bi bi-check-lg" /> Create</button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" type="button" onClick={() => setShowCreateCard(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {cards.map((stat) => (
          <div key={stat.id} className="dash-card" style={{ marginBottom: ".75rem" }}>
            {editingId === stat.id ? (
              <div style={{ padding: "1rem" }}>
                <div className="dash-section-title">Editing: {stat.name}</div>
                <div style={{ marginTop: ".75rem" }}>
                  <div className="dash-grid dash-grid-2">
                    <div className="dash-field">
                      <label>Name</label>
                      <input value={String(editVals.name)} onChange={(e) => setEditVal("name", e.target.value)} required />
                    </div>
                    <div className="dash-field">
                      <label>Number</label>
                      <input type="number" value={String(editVals.number_val)} onChange={(e) => setEditVal("number_val", e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                    <button className="dash-btn dash-btn-save" onClick={() => applyUpdate(stat.id, "card")} data-shortcut="save">
                      <i className="bi bi-check-lg" /> Apply
                    </button>
                    <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => { setEditingId(null); clearEditDraft(); }}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.5rem", color: "var(--accent)", lineHeight: 1 }}>
                    {stat.number_val}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: ".85rem", marginTop: ".25rem" }}>
                    {stat.name}
                  </div>
                </div>
                <div className="dash-card-actions">
                  <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => startEdit(stat)}>
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => handleDelete(stat.id, stat.name)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {cards.length === 0 && !showCreateCard && (
          <div style={{ color: "var(--text-muted)", padding: "1.5rem", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}>
            No stat cards yet
          </div>
        )}
      </div>

      {/* Skill Bars Section */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".5rem" }}>
          <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
            Skill Bars ({bars.length})
          </div>
          <button className="dash-btn dash-btn-add" onClick={() => { setShowCreateBar(!showCreateBar); setShowCreateCard(false); }}>
            <i className="bi bi-plus-lg" /> Add Bar
          </button>
        </div>

        {showCreateBar && (
          <div className="dash-section" style={{ marginBottom: "1rem", border: "1px solid var(--accent2)", borderRadius: "12px", padding: "1.5rem", background: "rgba(0,212,255,.05)" }}>
            <div className="dash-section-title">New Skill Bar</div>
            <form action={handleCreate}>
              <input type="hidden" name="stat_type" value="bar" />
              <div className="dash-grid dash-grid-2">
                <div className="dash-field">
                  <label>Name</label>
                  <input name="name" required placeholder="e.g. React" />
                </div>
                <div className="dash-field">
                  <label>Percentage (0-100)</label>
                  <input name="pct" type="number" min={0} max={100} required placeholder="0" />
                </div>
              </div>
              <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                <button className="dash-btn dash-btn-save" type="submit"><i className="bi bi-check-lg" /> Create</button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" type="button" onClick={() => setShowCreateBar(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {bars.map((stat) => (
          <div key={stat.id} className="dash-card" style={{ marginBottom: ".75rem" }}>
            {editingId === stat.id ? (
              <div style={{ padding: "1rem" }}>
                <div className="dash-section-title">Editing: {stat.name}</div>
                <div style={{ marginTop: ".75rem" }}>
                  <div className="dash-grid dash-grid-2">
                    <div className="dash-field">
                      <label>Name</label>
                      <input value={String(editVals.name)} onChange={(e) => setEditVal("name", e.target.value)} required />
                    </div>
                    <div className="dash-field">
                      <label>Percentage (0-100)</label>
                      <input type="number" min={0} max={100} value={String(editVals.pct)} onChange={(e) => setEditVal("pct", e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                    <button className="dash-btn dash-btn-save" onClick={() => applyUpdate(stat.id, "bar")} data-shortcut="save">
                      <i className="bi bi-check-lg" /> Apply
                    </button>
                    <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => { setEditingId(null); clearEditDraft(); }}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dash-skill-row">
                <span style={{ flex: 1, fontWeight: 500, fontSize: ".9rem" }}>
                  {stat.name}
                </span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".85rem", color: "var(--accent2)", minWidth: "40px", textAlign: "right" }}>
                  {stat.pct}%
                </span>
                <div style={{ width: "120px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden", flex: "none" }}>
                  <div style={{ width: `${stat.pct ?? 0}%`, height: "100%", borderRadius: "3px", background: "linear-gradient(90deg, var(--accent), var(--accent2))" }} />
                </div>
                <div className="dash-card-actions">
                  <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => startEdit(stat)}>
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => handleDelete(stat.id, stat.name)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {bars.length === 0 && !showCreateBar && (
          <div style={{ color: "var(--text-muted)", padding: "1.5rem", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}>
            No skill bars yet
          </div>
        )}
      </div>
    </div>
  );
}
