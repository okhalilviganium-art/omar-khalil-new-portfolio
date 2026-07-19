export interface ServiceCard {
  id: string;
  icon: string;
  name: string;
  desc: string;
  category: string;
  active: boolean;
}

export interface StatCard {
  number: number;
  label: string;
}

export interface SkillBar {
  name: string;
  pct: number;
}

export interface Social {
  icon: string;
  url: string;
  title: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  img: string;
  tags: string;
  desc: string;
  shortDescription: string;
  fullDescription: string;
  role: string;
  year: string;
  stack: string;
  live: string;
  overlayTag: string;
  overlayName: string;
  category: string;
  categories: ProjectCategory[];
  featured: boolean;
  published: boolean;
  status: string;
  client: string;
  thumbnailMediaId: string;
  coverImageMediaId: string;
  gallery: ProjectGalleryItem[];
  links: ProjectLink[];
  techStack: ProjectTechTag[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectTechTag {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectGalleryItem {
  id: string;
  projectId: string;
  mediaType: "image" | "video";
  mediaId: string;
  url: string;
  caption: string;
  thumbnailUrl: string;
  orderIndex: number;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  title: string;
  url: string;
  orderIndex: number;
}

export interface FeaturedProject {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  shortDescription: string;
  category: string;
  year: string;
  orderIndex: number;
}

export interface SiteData {
  topbar: {
    logo: string;
    status: string;
  };

  home: {
    pre: string;
    name: string;
    role: string;
    subtitle: string;
    status: string;
    portrait: string;
    bg: string;
    resumeUrl: string;

    cta1: {
      text: string;
      url: string;
      style: "primary" | "outline";
    };

    cta2: {
      text: string;
      url: string;
      style: "primary" | "outline";
    };

    socials: {
      linkedin: string;
      behance: string;
      github: string;
      instagram: string;
      x: string;
    };
  };

  about: {
    image: string;
    experience: string;
    label: string;
    title: string;
    description: string;
    skills: string[];
    tools: string[];
  };

  projects: Project[];

  stats: {
    label: string;
    title: string;
    cards: StatCard[];
    bars: SkillBar[];
  };

  services: {
    label: string;
    title: string;
    cards: ServiceCard[];
  };

  contact: {
    label: string;
    title: string;
    subtitle: string;
    email: string;
    socials: Social[];
  };
}

export type TopbarData = SiteData["topbar"];
export type HomeData = SiteData["home"];
export type AboutData = SiteData["about"];
export type StatsData = SiteData["stats"];
export type ServicesData = SiteData["services"];
export type ContactData = SiteData["contact"];