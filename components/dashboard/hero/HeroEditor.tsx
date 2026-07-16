"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { addRecentItem } from "@/components/dashboard/shared/RecentItems";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import ImageUpload from "@/components/dashboard/shared/ImageUpload";
import FileUpload from "@/components/dashboard/shared/FileUpload";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";
import { useDraft } from "@/hooks/useDraft";

interface HeroEditorProps {
  siteSettings: Record<string, string>;
}

export default function HeroEditor({ siteSettings }: HeroEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaults = {
    home_pre: siteSettings["home_pre"] || "",
    home_name: siteSettings["home_name"] || "",
    home_role: siteSettings["home_role"] || "",
    home_subtitle: siteSettings["home_subtitle"] || "",
    home_status: siteSettings["home_status"] || "",
    hero_cta1_text: siteSettings["hero_cta1_text"] || "",
    hero_cta1_url: siteSettings["hero_cta1_url"] || "",
    hero_cta1_style: siteSettings["hero_cta1_style"] || "primary",
    hero_cta2_text: siteSettings["hero_cta2_text"] || "",
    hero_cta2_url: siteSettings["hero_cta2_url"] || "",
    hero_cta2_style: siteSettings["hero_cta2_style"] || "outline",
    hero_social_linkedin: siteSettings["hero_social_linkedin"] || "",
    hero_social_behance: siteSettings["hero_social_behance"] || "",
    hero_social_github: siteSettings["hero_social_github"] || "",
    hero_social_instagram: siteSettings["hero_social_instagram"] || "",
    hero_social_x: siteSettings["hero_social_x"] || "",
    hero_image: siteSettings["hero_image"] || "",
    hero_bg: siteSettings["hero_bg"] || "",
    resume_url: siteSettings["resume_url"] || "",
  };

  const { values, setValue, clearDraft, hasDraft, isStale, restoreSnapshot } = useDraft("hero", defaults);
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
      toast("Hero section saved");
      addRecentItem("hero", "hero", "Hero Settings", "/dashboard/hero");
      router.refresh();
    } else {
      toast(res.error || "Failed to save", "error");
    }
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
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>Hero Section</div>
        <button className="dash-btn dash-btn-save" data-shortcut="save" onClick={doSave} disabled={saving} style={{
          fontFamily: "'Space Mono', monospace", fontSize: ".65rem", letterSpacing: ".08em",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {saving ? (
            <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} /> Saving...</>
          ) : (
            <><i className="bi bi-check-lg" /> Save Hero</>
          )}
        </button>
      </div>

      {/* GENERAL */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">General</div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Pre-title</label>
          <input value={values.home_pre} onChange={(e) => setValue("home_pre", e.target.value)} placeholder="e.g. MULTIMEDIA DESIGNER" />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Name</label>
          <input value={values.home_name} onChange={(e) => setValue("home_name", e.target.value)} placeholder="e.g. Omar Khalil" />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Headline (role)</label>
          <textarea rows={3} value={values.home_role} onChange={(e) => setValue("home_role", e.target.value)} placeholder="HTML allowed — use &lt;span&gt; for accent" />
          <span className="hint">HTML allowed — wrap text in &lt;span&gt; for accent color</span>
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Subtitle</label>
          <textarea rows={2} value={values.home_subtitle} onChange={(e) => setValue("home_subtitle", e.target.value)} placeholder="Short bio line beneath the headline" />
        </div>

        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Availability Status</label>
          <input value={values.home_status} onChange={(e) => setValue("home_status", e.target.value)} placeholder="e.g. Available for work" />
        </div>
      </div>

      {/* MEDIA */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Media</div>

        <div style={{ marginTop: "1rem" }}>
          <ImageUpload
            name="hero_image"
            label="Portrait Image"
            value={values.hero_image}
            folder="hero"
            onUpload={(url) => setValue("hero_image", url)}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <ImageUpload
            name="hero_bg"
            label="Background Image"
            value={values.hero_bg}
            folder="hero"
            onUpload={(url) => setValue("hero_bg", url)}
          />
        </div>
      </div>

      {/* CTA BUTTONS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Call to Action Buttons</div>

        <div className="dash-grid dash-grid-3" style={{ marginTop: "1rem" }}>
          <div className="dash-field">
            <label>Button 1 — Text</label>
            <input value={values.hero_cta1_text} onChange={(e) => setValue("hero_cta1_text", e.target.value)} placeholder="e.g. Explore My Work" />
          </div>
          <div className="dash-field">
            <label>Button 1 — URL</label>
            <input value={values.hero_cta1_url} onChange={(e) => setValue("hero_cta1_url", e.target.value)} placeholder="e.g. #portfolio or https://..." />
          </div>
          <div className="dash-field">
            <label>Button 1 — Style</label>
            <select value={values.hero_cta1_style} onChange={(e) => setValue("hero_cta1_style", e.target.value)}>
              <option value="primary">Primary (filled glow)</option>
              <option value="outline">Outline (ghost)</option>
            </select>
          </div>
        </div>

        <div className="dash-grid dash-grid-3" style={{ marginTop: "1rem" }}>
          <div className="dash-field">
            <label>Button 2 — Text</label>
            <input value={values.hero_cta2_text} onChange={(e) => setValue("hero_cta2_text", e.target.value)} placeholder="e.g. Get In Touch" />
          </div>
          <div className="dash-field">
            <label>Button 2 — URL</label>
            <input value={values.hero_cta2_url} onChange={(e) => setValue("hero_cta2_url", e.target.value)} placeholder="e.g. #contact or https://..." />
          </div>
          <div className="dash-field">
            <label>Button 2 — Style</label>
            <select value={values.hero_cta2_style} onChange={(e) => setValue("hero_cta2_style", e.target.value)}>
              <option value="primary">Primary (filled glow)</option>
              <option value="outline">Outline (ghost)</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESUME */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Resume</div>

        <div style={{ marginTop: "1rem" }}>
          <FileUpload
            name="resume_url"
            label="Resume File (PDF)"
            value={values.resume_url}
            folder="resume"
            accept=".pdf,.doc,.docx"
            onUpload={(url) => setValue("resume_url", url)}
          />
        </div>
      </div>

      {/* SOCIAL LINKS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Social Links</div>

        <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
          <div className="dash-field">
            <label><i className="bi bi-linkedin" /> LinkedIn</label>
            <input value={values.hero_social_linkedin} onChange={(e) => setValue("hero_social_linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="dash-field">
            <label><i className="bi bi-behance" /> Behance</label>
            <input value={values.hero_social_behance} onChange={(e) => setValue("hero_social_behance", e.target.value)} placeholder="https://behance.net/..." />
          </div>
          <div className="dash-field">
            <label><i className="bi bi-github" /> GitHub</label>
            <input value={values.hero_social_github} onChange={(e) => setValue("hero_social_github", e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div className="dash-field">
            <label><i className="bi bi-instagram" /> Instagram</label>
            <input value={values.hero_social_instagram} onChange={(e) => setValue("hero_social_instagram", e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="dash-field">
            <label><i className="bi bi-twitter-x" /> X (Twitter)</label>
            <input value={values.hero_social_x} onChange={(e) => setValue("hero_social_x", e.target.value)} placeholder="https://x.com/..." />
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Live Preview</div>

        <HeroPreview settings={{ ...siteSettings, ...values }} />
      </div>

      <HistoryPanel
        entityType="settings"
        entityId="global"
        currentSnapshot={values}
        localOnly
        onRestore={(snap) => restoreSnapshot(snap as typeof defaults)}
      />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}

function HeroPreview({ settings }: { settings: Record<string, string> }) {
  const pre = settings["home_pre"] || "MULTIMEDIA DESIGNER";
  const name = settings["home_name"] || "Omar Khalil";
  const role = settings["home_role"] || "";
  const subtitle = settings["home_subtitle"] || "";
  const status = settings["home_status"] || "";
  const portrait = settings["hero_image"] || "/img/me.jpg";
  const bg = settings["hero_bg"] || "";
  const cta1Text = settings["hero_cta1_text"] || "Explore My Work";
  const cta1Style = settings["hero_cta1_style"] || "primary";
  const cta2Text = settings["hero_cta2_text"] || "Get In Touch";
  const cta2Style = settings["hero_cta2_style"] || "outline";

  return (
    <div
      style={{
        background: "#020409",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "2.5rem 2rem",
        position: "relative",
        overflow: "hidden",
        minHeight: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {bg && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: "2.5rem",
          maxWidth: 700,
          width: "100%",
        }}
      >
        {portrait && (
          <img
            src={portrait}
            alt=""
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--border)",
              flexShrink: 0,
            }}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {status && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Space Mono', monospace",
                fontSize: ".6rem",
                letterSpacing: ".15em",
                color: "#2dffb3",
                textTransform: "uppercase",
                marginBottom: ".5rem",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#2dffb3",
                  animation: "pulse 2s infinite",
                }}
              />
              {status}
            </div>
          )}

          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: ".6rem",
              letterSpacing: ".3em",
              color: "var(--accent2)",
              textTransform: "uppercase",
              marginBottom: ".25rem",
            }}
          >
            {pre}
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: .92,
              background: "linear-gradient(135deg, #fff 0%, var(--accent) 50%, var(--accent2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 .3rem",
            }}
          >
            {name}
          </h2>

          <p
            style={{
              fontSize: ".8rem",
              color: "var(--text-muted)",
              fontWeight: 300,
              marginBottom: ".3rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            dangerouslySetInnerHTML={{ __html: role || "Headline goes here" }}
          />

          {subtitle && (
            <p style={{ fontSize: ".7rem", color: "var(--text-muted)", marginBottom: ".75rem", opacity: 0.7 }}>
              {subtitle}
            </p>
          )}

          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <span
              style={{
                padding: ".35rem 1rem",
                border: "1px solid var(--accent)",
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: ".55rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: cta1Style === "primary" ? "#fff" : "var(--accent)",
                background: cta1Style === "primary" ? "rgba(108,99,255,.2)" : "transparent",
              }}
            >
              {cta1Text}
            </span>
            <span
              style={{
                padding: ".35rem 1rem",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: ".55rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: cta2Style === "primary" ? "#fff" : "var(--text-muted)",
                background: cta2Style === "primary" ? "rgba(108,99,255,.12)" : "transparent",
              }}
            >
              {cta2Text}
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
