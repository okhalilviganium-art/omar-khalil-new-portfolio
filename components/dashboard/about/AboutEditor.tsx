"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { addRecentItem } from "@/components/dashboard/shared/RecentItems";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import ImageUpload from "@/components/dashboard/shared/ImageUpload";
import TagEditor from "@/components/dashboard/shared/TagEditor";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";
import About from "@/components/sections/About";

interface AboutEditorProps {
  siteSettings: Record<string, string>;
}

export default function AboutEditor({ siteSettings }: AboutEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [label, setLabel] = useState(siteSettings["about_label"] || "");
  const [title, setTitle] = useState(siteSettings["about_title"] || "");
  const [description, setDescription] = useState(siteSettings["about_description"] || "");
  const [image, setImage] = useState(siteSettings["about_image"] || "");
  const [imageMediaId, setImageMediaId] = useState(siteSettings["about_image_media_id"] || "");
  const [experience, setExperience] = useState(siteSettings["about_experience"] || "");
  const [skills, setSkills] = useState<string[]>(
    siteSettings["about_skills"] ? siteSettings["about_skills"].split(",") : []
  );
  const [tools, setTools] = useState<string[]>(
    siteSettings["about_tools"] ? siteSettings["about_tools"].split(",") : []
  );
  const [statYears, setStatYears] = useState(siteSettings["about_stat_years"] || "");
  const [statProjects, setStatProjects] = useState(siteSettings["about_stat_projects"] || "");
  const [statClients, setStatClients] = useState(siteSettings["about_stat_clients"] || "");
  const [statAwards, setStatAwards] = useState(siteSettings["about_stat_awards"] || "");

  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changedRef = useRef(false);
  const { showPrompt, confirmNavigation, handleConfirm, handleCancel } = useUnsavedChanges(changedRef.current);

  const doSave = useCallback(async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("about_label", label);
    fd.append("about_title", title);
    fd.append("about_description", description);
    fd.append("about_image", image);
    fd.append("about_image_media_id", imageMediaId);
    fd.append("about_experience", experience);
    fd.append("about_skills", skills.join(","));
    fd.append("about_tools", tools.join(","));
    fd.append("about_stat_years", statYears);
    fd.append("about_stat_projects", statProjects);
    fd.append("about_stat_clients", statClients);
    fd.append("about_stat_awards", statAwards);
    const res = await updateSiteSettings(fd);
    setSaving(false);
    if (res.success) {
      toast("Saved");
      addRecentItem("about", "about", "About Settings", "/dashboard/about");
      router.refresh();
    } else {
      toast(res.error || "Save failed", "error");
    }
  }, [label, title, description, image, imageMediaId, experience, skills, tools, statYears, statProjects, statClients, statAwards, toast, router]);

  useEffect(() => {
    changedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (changedRef.current) {
        changedRef.current = false;
        doSave();
      }
    }, 1500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [label, title, description, image, imageMediaId, experience, skills, tools, statYears, statProjects, statClients, statAwards, doSave]);

  const previewData = {
    image: image || "/images/placeholder.jpg",
    experience: experience || "9+ Years",
    label: label || "Who I Am",
    title: title || "About Title",
    description: description || "Description goes here.",
    skills,
    tools,
    stats: [
      { value: statYears || "0", label: "Years Experience" },
      { value: statProjects || "0", label: "Projects Done" },
      { value: statClients || "0", label: "Happy Clients" },
      { value: statAwards || "0", label: "Awards Won" },
    ],
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <UnsavedChangesPrompt show={showPrompt} onConfirm={handleConfirm} onCancel={handleCancel} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
          About Section
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: ".6rem", letterSpacing: ".1em",
          color: saving ? "var(--accent2)" : "var(--text-muted)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {saving ? (
            <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} /> Saving...</>
          ) : (
            <><i className="bi bi-check-lg" /> All changes saved</>
          )}
        </div>
      </div>

      {/* GENERAL */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">General</div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Section Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Who I Am" />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="HTML allowed — use &lt;span class=&quot;accent&quot;&gt; for accent" />
          <span className="hint">HTML allowed — use &lt;span class="accent"&gt;text&lt;/span&gt; for accent color, &lt;br&gt; for line break</span>
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Description</label>
          <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full bio text..." />
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
            value={image}
            folder="about"
            onUpload={(url, mediaId) => { setImage(url); setImageMediaId(mediaId); }}
          />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Years of Experience</label>
          <input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 9+ Years" />
        </div>
      </div>

      {/* SKILLS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Skills</div>
        <div style={{ marginTop: "1rem" }}>
          <TagEditor tags={skills} onChange={setSkills} placeholder="Add skill..." label="Skill Tags" />
        </div>
      </div>

      {/* TOOLS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Tools</div>
        <div style={{ marginTop: "1rem" }}>
          <TagEditor tags={tools} onChange={setTools} placeholder="Add tool..." label="Tool / Software" />
        </div>
      </div>

      {/* STATISTICS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Statistics</div>
        <div className="dash-grid dash-grid-4" style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <div className="dash-field">
            <label>Years</label>
            <input value={statYears} onChange={(e) => setStatYears(e.target.value)} placeholder="e.g. 9+" />
          </div>
          <div className="dash-field">
            <label>Projects</label>
            <input value={statProjects} onChange={(e) => setStatProjects(e.target.value)} placeholder="e.g. 87" />
          </div>
          <div className="dash-field">
            <label>Clients</label>
            <input value={statClients} onChange={(e) => setStatClients(e.target.value)} placeholder="e.g. 54" />
          </div>
          <div className="dash-field">
            <label>Awards</label>
            <input value={statAwards} onChange={(e) => setStatAwards(e.target.value)} placeholder="e.g. 12" />
          </div>
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

      <HistoryPanel entityType="settings" entityId="global" currentSnapshot={siteSettings} onRestore={() => router.refresh()} />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
