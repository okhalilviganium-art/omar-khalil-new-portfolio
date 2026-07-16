"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import { useDraft } from "@/hooks/useDraft";

interface SettingsPanelProps {
  siteSettings: Record<string, string>;
}

export default function SettingsPanel({ siteSettings }: SettingsPanelProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaults: Record<string, string> = {
    topbar_logo: siteSettings["topbar_logo"] || "",
    topbar_status: siteSettings["topbar_status"] || "",
    stats_label: siteSettings["stats_label"] || "",
    stats_title: siteSettings["stats_title"] || "",
    services_label: siteSettings["services_label"] || "",
    services_title: siteSettings["services_title"] || "",
    contact_label: siteSettings["contact_label"] || "",
    contact_title: siteSettings["contact_title"] || "",
    contact_subtitle: siteSettings["contact_subtitle"] || "",
    contact_email: siteSettings["contact_email"] || "",
  };

  const { values, setValue, clearDraft, hasDraft, isStale } = useDraft("settings", defaults);
  const [saving, setSaving] = useState(false);
  const { showPrompt, handleConfirm, handleCancel } = useUnsavedChanges(hasDraft);

  const doSave = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));
    const res = await updateSiteSettings(fd);
    setSaving(false);
    if (res.success) {
      clearDraft();
      toast("Settings saved");
      router.refresh();
    } else {
      toast(res.error || "Failed", "error");
    }
  };

  const group = (
    title: string,
    fields: { key: string; label: string; type?: "input" | "textarea" }[]
  ) => (
    <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
      <div className="dash-section-title">{title}</div>
      {fields.map((f) => (
        <div key={f.key} className="dash-field" style={{ marginTop: "1rem" }}>
          <label htmlFor={f.key}>{f.label}</label>
          {f.type === "textarea" ? (
            <textarea id={f.key} rows={3} value={values[f.key] || ""} onChange={(e) => setValue(f.key, e.target.value)} />
          ) : (
            <input id={f.key} value={values[f.key] || ""} onChange={(e) => setValue(f.key, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <UnsavedChangesPrompt show={showPrompt} onConfirm={handleConfirm} onCancel={handleCancel} />

      {hasDraft && isStale && (
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".6rem 1rem", marginBottom: "1.5rem", borderRadius: 8, background: "rgba(255,183,77,.08)", border: "1px solid rgba(255,183,77,.25)", fontFamily: "'Space Mono',monospace", fontSize: ".65rem", letterSpacing: ".04em", color: "#ffb74d" }}>
          <i className="bi bi-info-circle" />
          The published version has changed since your last edit. Your draft is preserved.
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
          Site Settings
        </div>
        <button className="dash-btn dash-btn-save" data-shortcut="save" onClick={doSave} disabled={saving} style={{
          fontFamily: "'Space Mono', monospace", fontSize: ".65rem", letterSpacing: ".08em",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {saving ? (
            <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} /> Saving...</>
          ) : (
            <><i className="bi bi-check-lg" /> Save Settings</>
          )}
        </button>
      </div>

      {group("Top Bar", [
        { key: "topbar_logo", label: "Logo Text" },
        { key: "topbar_status", label: "Status Badge" },
      ])}

      {group("Section Headers", [
        { key: "stats_label", label: "Stats Section Label" },
        { key: "stats_title", label: "Stats Section Title" },
        { key: "services_label", label: "Services Section Label" },
        { key: "services_title", label: "Services Section Title" },
      ])}

      {group("Contact", [
        { key: "contact_label", label: "Section Label" },
        { key: "contact_title", label: "Section Title" },
        { key: "contact_subtitle", label: "Subtitle", type: "textarea" },
        { key: "contact_email", label: "Email" },
      ])}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
