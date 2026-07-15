"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { addRecentItem } from "@/components/dashboard/shared/RecentItems";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import ImageUpload from "@/components/dashboard/shared/ImageUpload";
import FileUpload from "@/components/dashboard/shared/FileUpload";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";

interface HeroEditorProps {
  siteSettings: Record<string, string>;
}

export default function HeroEditor({ siteSettings }: HeroEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const { showPrompt, confirmNavigation, handleConfirm, handleCancel } = useUnsavedChanges(hasChanges);

  const handleSave = async (fd: FormData) => {
    const res = await updateSiteSettings(fd);
    if (res.success) {
      toast("Hero section saved");
      setHasChanges(false);
      addRecentItem("hero", "hero", "Hero Settings", "/dashboard/hero");
      router.refresh();
    } else {
      toast(res.error || "Failed to save", "error");
    }
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <UnsavedChangesPrompt show={showPrompt} onConfirm={handleConfirm} onCancel={handleCancel} />
      <div
        className="dash-section-title"
        style={{ margin: 0, border: 0, padding: 0, marginBottom: "1.5rem" }}
      >
        Hero Section
      </div>

      <form action={handleSave} onChange={() => setHasChanges(true)}>
        {/* GENERAL */}
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">General</div>

          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Pre-title</label>
            <input name="home_pre" defaultValue={siteSettings["home_pre"] || ""} placeholder="e.g. MULTIMEDIA DESIGNER" />
          </div>

          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Name</label>
            <input name="home_name" defaultValue={siteSettings["home_name"] || ""} placeholder="e.g. Omar Khalil" />
          </div>

          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Headline (role)</label>
            <textarea name="home_role" rows={3} defaultValue={siteSettings["home_role"] || ""} placeholder="HTML allowed — use &lt;span&gt; for accent" />
            <span className="hint">HTML allowed — wrap text in &lt;span&gt; for accent color</span>
          </div>

          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Subtitle</label>
            <textarea name="home_subtitle" rows={2} defaultValue={siteSettings["home_subtitle"] || ""} placeholder="Short bio line beneath the headline" />
          </div>

          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Availability Status</label>
            <input name="home_status" defaultValue={siteSettings["home_status"] || ""} placeholder="e.g. Available for work" />
          </div>
        </div>

        {/* MEDIA */}
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Media</div>

          <div style={{ marginTop: "1rem" }}>
            <ImageUpload
              name="hero_image"
              label="Portrait Image"
              value={siteSettings["hero_image"] || ""}
              folder="hero"
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <ImageUpload
              name="hero_bg"
              label="Background Image"
              value={siteSettings["hero_bg"] || ""}
              folder="hero"
            />
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Call to Action Buttons</div>

          <div className="dash-grid dash-grid-3" style={{ marginTop: "1rem" }}>
            <div className="dash-field">
              <label>Button 1 — Text</label>
              <input name="hero_cta1_text" defaultValue={siteSettings["hero_cta1_text"] || ""} placeholder="e.g. Explore My Work" />
            </div>
            <div className="dash-field">
              <label>Button 1 — URL</label>
              <input name="hero_cta1_url" defaultValue={siteSettings["hero_cta1_url"] || ""} placeholder="e.g. #portfolio or https://..." />
            </div>
            <div className="dash-field">
              <label>Button 1 — Style</label>
              <select name="hero_cta1_style" defaultValue={siteSettings["hero_cta1_style"] || "primary"}>
                <option value="primary">Primary (filled glow)</option>
                <option value="outline">Outline (ghost)</option>
              </select>
            </div>
          </div>

          <div className="dash-grid dash-grid-3" style={{ marginTop: "1rem" }}>
            <div className="dash-field">
              <label>Button 2 — Text</label>
              <input name="hero_cta2_text" defaultValue={siteSettings["hero_cta2_text"] || ""} placeholder="e.g. Get In Touch" />
            </div>
            <div className="dash-field">
              <label>Button 2 — URL</label>
              <input name="hero_cta2_url" defaultValue={siteSettings["hero_cta2_url"] || ""} placeholder="e.g. #contact or https://..." />
            </div>
            <div className="dash-field">
              <label>Button 2 — Style</label>
              <select name="hero_cta2_style" defaultValue={siteSettings["hero_cta2_style"] || "outline"}>
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
              value={siteSettings["resume_url"] || ""}
              folder="resume"
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Social Links</div>

          <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
            <div className="dash-field">
              <label><i className="bi bi-linkedin" /> LinkedIn</label>
              <input name="hero_social_linkedin" defaultValue={siteSettings["hero_social_linkedin"] || ""} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="dash-field">
              <label><i className="bi bi-behance" /> Behance</label>
              <input name="hero_social_behance" defaultValue={siteSettings["hero_social_behance"] || ""} placeholder="https://behance.net/..." />
            </div>
            <div className="dash-field">
              <label><i className="bi bi-github" /> GitHub</label>
              <input name="hero_social_github" defaultValue={siteSettings["hero_social_github"] || ""} placeholder="https://github.com/..." />
            </div>
            <div className="dash-field">
              <label><i className="bi bi-instagram" /> Instagram</label>
              <input name="hero_social_instagram" defaultValue={siteSettings["hero_social_instagram"] || ""} placeholder="https://instagram.com/..." />
            </div>
            <div className="dash-field">
              <label><i className="bi bi-twitter-x" /> X (Twitter)</label>
              <input name="hero_social_x" defaultValue={siteSettings["hero_social_x"] || ""} placeholder="https://x.com/..." />
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Live Preview</div>

          <HeroPreview settings={siteSettings} />
        </div>

        <button className="dash-btn dash-btn-save" type="submit" data-shortcut="save">
          <i className="bi bi-check-lg" /> Save Hero
        </button>
      </form>

      <HistoryPanel entityType="settings" entityId="global" currentSnapshot={siteSettings} onRestore={() => router.refresh()} />
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
