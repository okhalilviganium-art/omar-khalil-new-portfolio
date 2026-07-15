"use client";
import { useEffect } from "react";
import gsap from "gsap";

export function useEntranceAnimation() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "#sec-0 .section-content",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.3 }
      );
      gsap.fromTo(
        "#topbar",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(
        "#main-nav",
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.7 }
      );
    });
    return () => ctx.revert();
  }, []);
}
