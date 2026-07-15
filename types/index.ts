export interface HeroButton {
  text: string;
  url: string;
  style: "primary" | "outline";
}

export interface HomeData {
  pre: string;
  name: string;
  role: string;
  subtitle: string;
  status: string;
  portrait: string;
  bg: string;
  resumeUrl: string;
  cta1: HeroButton;
  cta2: HeroButton;
  socials: {
    linkedin: string;
    behance: string;
    github: string;
    instagram: string;
    x: string;
  };
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutData {
  image: string;
  experience: string;
  label: string;
  title: string;
  description: string;
  skills: string[];
  tools: string[];
  stats: AboutStat[];
}

export interface Project {
  id: string;
  title: string;
  img: string;
  tags: string;
  desc: string;
  role: string;
  year: string;
  stack: string;
  live: string;
  overlayTag?: string;
  overlayName?: string;
  galleryImages: string[];
  featured: boolean;
  githubUrl: string;
  slug: string;
  category: string;
  client: string;
  published: boolean;
  galleryMediaIds: string[];
  coverMediaId: string;
  videoMediaId: string;
  seoTitle: string;
  seoDescription: string;
  technologies: string;
  servicesText: string;
  publishStatus: string;
}

export interface StatCard {
  number: number;
  label: string;
}

export interface SkillBar {
  name: string;
  pct: number;
}

export interface StatsData {
  label: string;
  title: string;
  cards: StatCard[];
  bars: SkillBar[];
}

export interface ServiceCard {
  id?: string;
  icon: string;
  name: string;
  desc: string;
  category: string;
  active: boolean;
}

export interface ServicesData {
  label: string;
  title: string;
  cards: ServiceCard[];
}

export interface Social {
  icon: string;
  url: string;
  title: string;
}

export interface ContactData {
  label: string;
  title: string;
  subtitle: string;
  email: string;
  socials: Social[];
}

export interface TopbarData {
  logo: string;
  status: string;
}

export interface SiteData {
  home: HomeData;
  about: AboutData;
  projects: Project[];
  stats: StatsData;
  services: ServicesData;
  contact: ContactData;
  topbar: TopbarData;
}
