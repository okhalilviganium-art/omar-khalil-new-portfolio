"use client";
import { useEffect } from "react";
import gsap from "gsap";

export function useOrbParallax() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      gsap.to(".orb-1", { x: cx * 40, y: cy * 40, duration: 2, ease: "power1.out" });
      gsap.to(".orb-2", { x: cx * -30, y: cy * -30, duration: 2, ease: "power1.out" });
      gsap.to(".orb-3", { x: cx * 20, y: cy * 20, duration: 2, ease: "power1.out" });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}
