"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { addRecentItem } from "@/components/dashboard/shared/RecentItems";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import ImageUpload from "@/components/dashboard/shared/ImageUpload";
import TagEditor from "@/components/dashboard/shared/TagEditor";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";
import About from "@/components/sections/About";
import { useDraft } from "@/hooks/useDraft";

interface AboutEditorProps {
  siteSettings: Record<string, string>;
}

export default function AboutEditor({ siteSettings }: AboutEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaults = {
    about_label: siteSettings["about_label"] || "",
    about_title: siteSettings["about_title"] || "",
    about_description: siteSettings["about_description"] || "",
    about_image: siteSettings["about_image"] || "",
    about_image_media_id: siteSettings["about_image_media_id"] || "",
    about_experience: siteSettings["about_experience"] || "",
    about_skills: (siteSettings["about_skills"] ? siteSettings["about_skills"].split(",") : []) as string[],
    about_tools: (siteSettings["about_tools"] ? siteSettings["about_tools"].split(",") : []) as string[],
  };

  const { values, setValue, clearDraft, hasDraft, isStale, restoreSnapshot } = useDraft("about", defaults);
  const [saving, setSaving] = useState(false);
  const { showPrompt, handleConfirm, handleCancel } = useUnsavedChanges(hasDraft);

  const v = values;

  const doSave = useCallback(async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("about_label", String(v.about_label));
    fd.append("about_title", String(v.about_title));
    fd.append("about_description", String(v.about_description));
    fd.append("about_image", String(v.about_image));
    fd.append("about_image_media_id", String(v.about_image_media_id));
    fd.append("about_experience", String(v.about_experience));
    fd.append("about_skills", (v.about_skills as string[]).join(","));
    fd.append("about_tools", (v.about_tools as string[]).join(","));
    const res = await updateSiteSettings(fd);
    setSaving(false);
    if (res.success) {
      clearDraft();
      toast("Saved");
      addRecentItem("about", "about", "About Settings", "/dashboard/about");
      router.refresh();
    } else {
      toast(res.error || "Save failed", "error");
    }
  }, [v, clearDraft, toast, router]);

  const previewData = {
    image: String(v.about_image) || "/images/placeholder.jpg",
    experience: String(v.about_experience) || "9+ Years",
    label: String(v.about_label) || "Who I Am",
    title: String(v.about_title) || "About Title",
    description: String(v.about_description) || "Description goes here.",
    skills: v.about_skills as string[],
    tools: v.about_tools as string[],
  };

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
          About Section
        </div>
        <button className="dash-btn dash-btn-save" data-shortcut="save" onClick={doSave} disabled={saving} style={{
          fontFamily: "'Space Mono', monospace", fontSize: ".65rem", letterSpacing: ".08em",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {saving ? (
            <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} /> Saving...</>
          ) : (
            <><i className="bi bi-check-lg" /> Save</>
          )}
        </button>
      </div>

      {/* GENERAL */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">General</div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Section Label</label>
          <input value={String(v.about_label)} onChange={(e) => setValue("about_label", e.target.value)} placeholder="e.g. Who I Am" />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Title</label>
          <input value={String(v.about_title)} onChange={(e) => setValue("about_title", e.target.value)} placeholder="HTML allowed — use &lt;span class=&quot;accent&quot;&gt; for accent" />
          <span className="hint">HTML allowed — use &lt;span class=&quot;accent&quot;&gt;text&lt;/span&gt; for accent color, &lt;br&gt; for line break</span>
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Description</label>
          <textarea rows={6} value={String(v.about_description)} onChange={(e) => setValue("about_description", e.target.value)} placeholder="Full bio text..." />
          <span className="hint">Use blank lines for paragraph breaks</span>
        </div>
      </div>

      {/* PROFILE */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Profile</div>

        <div style={{ marginTop: "1rem" }}>
          <ImageUpload
            name="about_image"
            label="Profile Image"
            value={String(v.about_image)}
            folder="about"
            onUpload={(url, mediaId) => { setValue("about_image", url); setValue("about_image_media_id", mediaId); }}
          />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Years of Experience</label>
          <input value={String(v.about_experience)} onChange={(e) => setValue("about_experience", e.target.value)} placeholder="e.g. 9+ Years" />
        </div>
      </div>

      {/* SKILLS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Skills</div>
        <div style={{ marginTop: "1rem" }}>
          <TagEditor tags={v.about_skills as string[]} onChange={(skills) => setValue("about_skills", skills)} placeholder="Add skill..." label="Skill Tags" />
        </div>
      </div>

      {/* TOOLS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Tools</div>
        <div style={{ marginTop: "1rem" }}>
          <TagEditor tags={v.about_tools as string[]} onChange={(tools) => setValue("about_tools", tools)} placeholder="Add tool..." label="Tool / Software" />
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Live Preview</div>
        <div style={{
          transform: "scale(0.55)", transformOrigin: "top left",
          width: "182%", marginBottom: "-40%",
          pointerEvents: "none", opacity: 0.95,
        }}>
          <About data={previewData} />
        </div>
      </div>

      <HistoryPanel
        entityType="settings"
        entityId="global"
        currentSnapshot={values}
        localOnly
        onRestore={(snap) => restoreSnapshot(snap as typeof defaults)}
      />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
