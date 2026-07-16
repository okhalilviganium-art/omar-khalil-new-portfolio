import { getSettings } from "./site-settings";
import { getFeaturedProjects } from "./portfolio";
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

  const projects = await getFeaturedProjects(6);

  let serviceCards: SiteData["services"]["cards"] = [];
  let statCards: SiteData["stats"]["cards"] = [];
  let skillBars: SiteData["stats"]["bars"] = [];
  let socials: SiteData["contact"]["socials"] = [];

  try {
    serviceCards = await getServices();
  } catch (e) {
    console.error("Services ERROR:", e);
  }

  try {
    statCards = await getStatCards();
    skillBars = await getSkillBars();
  } catch (e) {
    console.error("Statistics ERROR:", e);
  }

  console.log("Statistics statCards:", statCards.length, statCards);
  console.log("Statistics skillBars:", skillBars.length, skillBars);

  try {
    socials = await getSocials();
  } catch (e) {
    console.error("Socials ERROR:", e);
  }

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
    },
    projects: projects,
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