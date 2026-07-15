import { getSettings } from "./site-settings";
import { getProjects } from "./projects";
import { getServices } from "./services";
import { getStatCards, getSkillBars } from "./statistics";
import { getSocials } from "./social-links";
import { getMediaByIdsAction } from "@/lib/actions/media";
import type { SiteData } from "@/types";

const HOME_KEYS = [
  "topbar_logo", "topbar_status",
  "home_pre", "home_name", "home_role", "home_subtitle", "home_status",
  "hero_image", "hero_bg", "resume_url",
  "hero_image_media_id", "hero_bg_media_id", "resume_url_media_id",
  "hero_cta1_text", "hero_cta1_url", "hero_cta1_style",
  "hero_cta2_text", "hero_cta2_url", "hero_cta2_style",
  "hero_social_linkedin", "hero_social_behance", "hero_social_github",
  "hero_social_instagram", "hero_social_x",
];

const ABOUT_KEYS = [
  "about_image", "about_image_media_id", "about_experience", "about_label",
  "about_title", "about_description", "about_skills", "about_tools",
  "about_stat_years", "about_stat_projects", "about_stat_clients", "about_stat_awards",
];

const STATS_KEYS = ["stats_label", "stats_title"];
const SERVICES_KEYS = ["services_label", "services_title"];

const CONTACT_KEYS = [
  "contact_label",
  "contact_title",
  "contact_subtitle",
  "contact_email",
];

export async function loadSiteData(): Promise<SiteData> {
  console.log("========== loadSiteData START ==========");

  const allKeys = [
    ...HOME_KEYS,
    ...ABOUT_KEYS,
    ...STATS_KEYS,
    ...SERVICES_KEYS,
    ...CONTACT_KEYS,
  ];

  let settings: Record<string, string> = {};

  try {
    console.log("Loading settings...");
    settings = await getSettings(allKeys);
    console.log("SITE SETTINGS:", settings);
  } catch (e) {
    console.error("getSettings ERROR:", e);
  }

  const mediaIds = [
    settings.hero_image_media_id,
    settings.hero_bg_media_id,
    settings.resume_url_media_id,
    settings.about_image_media_id,
  ].filter((id): id is string => Boolean(id));

  console.log("Media IDs:", mediaIds);

  let mediaMap: Record<string, string> = {};

  if (mediaIds.length > 0) {
    try {
      mediaMap = await getMediaByIdsAction(mediaIds);
      console.log("Media loaded:", mediaMap);
    } catch (e) {
      console.error("Media ERROR:", e);
    }
  }

  const resolve = (
    url: string,
    mediaId?: string,
    fallback?: string
  ): string => {
    if (mediaId && mediaMap[mediaId]) return mediaMap[mediaId];
    if (url) return url;
    return fallback || "";
  };

  let projects: SiteData["projects"] = [];
  let serviceCards: SiteData["services"]["cards"] = [];
  let statCards: SiteData["stats"]["cards"] = [];
  let skillBars: SiteData["stats"]["bars"] = [];
  let socials: SiteData["contact"]["socials"] = [];

  try {
    projects = await getProjects();
    console.log("Projects:", projects.length);
  } catch (e) {
    console.error("Projects ERROR:", e);
  }

  try {
    serviceCards = await getServices();
    console.log("Services:", serviceCards.length);
  } catch (e) {
    console.error("Services ERROR:", e);
  }

  try {
    statCards = await getStatCards();
    skillBars = await getSkillBars();
    console.log("Stats:", statCards.length, skillBars.length);
  } catch (e) {
    console.error("Statistics ERROR:", e);
  }

  try {
    socials = await getSocials();
    console.log("Socials:", socials.length);
  } catch (e) {
    console.error("Socials ERROR:", e);
  }

  const projectMediaIds = projects
    .flatMap((p) => [p.coverMediaId, ...p.galleryMediaIds, p.videoMediaId])
    .filter((id): id is string => Boolean(id));

  if (projectMediaIds.length > 0) {
    try {
      const projectMediaMap = await getMediaByIdsAction(projectMediaIds);
      Object.assign(mediaMap, projectMediaMap);
    } catch (e) {
      console.error("Project media ERROR:", e);
    }
  }

  const resolveProjectMedia = (p: typeof projects[0]) => ({
    ...p,
    img: resolve(p.img, p.coverMediaId),
    galleryImages: p.galleryMediaIds.map(
      (mid, i) => mediaMap[mid] || p.galleryImages[i] || ""
    ),
  });

  console.log("========== loadSiteData END ==========");

  return {
    topbar: {
      logo: settings.topbar_logo || "",
      status: settings.topbar_status || "",
    },
    home: {
      pre: settings.home_pre || "",
      name: settings.home_name || "",
      role: settings.home_role || "",
      subtitle: settings.home_subtitle || "",
      status: settings.home_status || "",
      portrait: resolve(settings.hero_image, settings.hero_image_media_id, ""),
      bg: resolve(settings.hero_bg, settings.hero_bg_media_id, ""),
      resumeUrl: resolve(settings.resume_url, settings.resume_url_media_id, ""),
      cta1: {
        text: settings.hero_cta1_text || "",
        url: settings.hero_cta1_url || "",
        style: (settings.hero_cta1_style as "primary" | "outline") || "primary",
      },
      cta2: {
        text: settings.hero_cta2_text || "",
        url: settings.hero_cta2_url || "",
        style: (settings.hero_cta2_style as "primary" | "outline") || "outline",
      },
      socials: {
        linkedin: settings.hero_social_linkedin || "",
        behance: settings.hero_social_behance || "",
        github: settings.hero_social_github || "",
        instagram: settings.hero_social_instagram || "",
        x: settings.hero_social_x || "",
      },
    },
    about: {
      image: resolve(settings.about_image, settings.about_image_media_id, ""),
      experience: settings.about_experience || "",
      label: settings.about_label || "",
      title: settings.about_title || "",
      description: settings.about_description || "",
      skills: settings.about_skills
        ? settings.about_skills.split(",")
        : [],
      tools: settings.about_tools
        ? settings.about_tools.split(",")
        : [],
      stats: [
        { value: settings.about_stat_years || "", label: "Years Experience" },
        { value: settings.about_stat_projects || "", label: "Projects Done" },
        { value: settings.about_stat_clients || "", label: "Happy Clients" },
        { value: settings.about_stat_awards || "", label: "Awards Won" },
      ],
    },
    projects: projects
      .filter((p) => p.published !== false)
      .map(resolveProjectMedia),
    stats: {
      label: settings.stats_label || "",
      title: settings.stats_title || "",
      cards: statCards,
      bars: skillBars,
    },
    services: {
      label: settings.services_label || "",
      title: settings.services_title || "",
      cards: serviceCards,
    },
    contact: {
      label: settings.contact_label || "",
      title: settings.contact_title || "",
      subtitle: settings.contact_subtitle || "",
      email: settings.contact_email || "",
      socials,
    },
  };
}