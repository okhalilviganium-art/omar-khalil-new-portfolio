"use client";
import { useEffect } from "react";

export function useCustomCursor() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    if (!cursor || !ring) return;

    const onMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      setTimeout(() => {
        ring.style.left = e.clientX + "px";
        ring.style.top = e.clientY + "px";
      }, 60);
    };

    const interactiveSelector = "a, button, .nav-dot, .project-card, .service-card, .social-btn, .btn-glow, .btn-outline-glow";
    let cleanupFns: (() => void)[] = [];

    const refreshInteractive = () => {
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        const enter = () => {
          cursor.style.transform = "translate(-50%,-50%) scale(2.5)";
          cursor.style.background = "var(--accent2)";
          ring.style.width = "60px";
          ring.style.height = "60px";
          ring.style.opacity = "0.3";
        };
        const leave = () => {
          cursor.style.transform = "translate(-50%,-50%) scale(1)";
          cursor.style.background = "var(--accent)";
          ring.style.width = "38px";
          ring.style.height = "38px";
          ring.style.opacity = "0.7";
        };
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        cleanupFns.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      });
    };

    window.addEventListener("mousemove", onMove);
    refreshInteractive();
    const interval = setInterval(refreshInteractive, 1000);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cleanupFns.forEach((fn) => fn());
      clearInterval(interval);
    };
  }, []);
}
