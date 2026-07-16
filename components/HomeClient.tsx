"use client";

import { useState } from "react";
import type { SiteData } from "@/types";

import Decorative from "@/components/ui/Decorative";
import Topbar from "@/components/ui/Topbar";
import Navigation from "@/components/ui/Navigation";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Portfolio from "@/components/sections/Portfolio";
import Stats from "@/components/sections/Stats";
import Services from "@/components/sections/Services";
import Contact from "@/components/sections/Contact";

import { useSectionNavigation } from "@/hooks/useSectionNavigation";
import { useOrbParallax } from "@/hooks/useOrbParallax";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";

export default function HomeClient({ initialData }: { initialData: SiteData }) {
  const [data] = useState<SiteData>(initialData);
  const { goTo } = useSectionNavigation(6);

  useOrbParallax();
  useEntranceAnimation();

  return (
    <div id="main-content">
      <Decorative />
      <Topbar logo={data.topbar.logo} status={data.topbar.status} />
      <Navigation goTo={goTo} />

      <Hero data={data.home} goTo={goTo} />
      <About data={data.about} />
      <Portfolio projects={data.projects} />
      <Stats data={data.stats} />
      <Services data={data.services} />
      <Contact data={data.contact} />
    </div>
  );
}
