"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { updateSiteSettings } from "@/lib/actions/site-settings";

interface SettingsPanelProps {
  siteSettings: Record<string, string>;
}

export default function SettingsPanel({ siteSettings }: SettingsPanelProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSiteSave = async (fd: FormData) => {
    const res = await updateSiteSettings(fd);

    if (res.success) {
      toast("Settings saved");
      router.refresh();
    } else {
      toast(res.error || "Failed", "error");
    }
  };

  const group = (
    title: string,
    fields: {
      key: string;
      label: string;
      type?: "input" | "textarea";
    }[]
  ) => (
    <div
      className="dash-section"
      style={{ marginBottom: "1.5rem" }}
    >
      <div className="dash-section-title">{title}</div>

      {fields.map((f) => (
        <div
          key={f.key}
          className="dash-field"
          style={{ marginTop: "1rem" }}
        >
          <label htmlFor={f.key}>{f.label}</label>

          {f.type === "textarea" ? (
            <textarea
              id={f.key}
              name={f.key}
              rows={3}
              defaultValue={siteSettings[f.key] || ""}
            />
          ) : (
            <input
              id={f.key}
              name={f.key}
              defaultValue={siteSettings[f.key] || ""}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="dash-content"
      style={{ padding: "2rem" }}
    >
      <div
        className="dash-section-title"
        style={{
          margin: 0,
          border: 0,
          padding: 0,
          marginBottom: "1.5rem",
        }}
      >
        Site Settings
      </div>

      <form action={handleSiteSave}>
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
          {
            key: "contact_title",
            label: "Section Title",
          },
          {
            key: "contact_subtitle",
            label: "Subtitle",
            type: "textarea",
          },
          {
            key: "contact_email",
            label: "Email",
          },
        ])}

        <button
          className="dash-btn dash-btn-save"
          type="submit"
          style={{ marginTop: "1rem" }}
        >
          <i className="bi bi-check-lg" /> Save Settings
        </button>
      </form>
    </div>
  );
}