"use client";
import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

interface UseSectionNavigationReturn {
  current: number;
  goTo: (idx: number) => void;
  total: number;
}

export function useSectionNavigation(total: number = 6): UseSectionNavigationReturn {
  const currentRef = useRef(0);
  const animatingRef = useRef(false);

  const goTo = useCallback((idx: number) => {
    if (animatingRef.current || idx === currentRef.current || idx < 0 || idx >= total) return;
    animatingRef.current = true;
    const dir = idx > currentRef.current ? 1 : -1;
    const cur = document.getElementById("sec-" + currentRef.current);
    const next = document.getElementById("sec-" + idx);
    if (!cur || !next) { animatingRef.current = false; return; }

    gsap.to(cur.querySelector(".section-content"), {
      y: dir * -50, opacity: 0, duration: 0.4, ease: "power2.in",
      onComplete() {
        cur.classList.remove("active");
        const sc = cur.querySelector(".section-content") as HTMLElement;
        if (sc) { sc.style.opacity = "0"; sc.style.transform = "translateY(30px)"; }
      },
    });

    next.classList.add("active");
    gsap.fromTo(
      next.querySelector(".section-content"),
      { y: dir * 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.25,
        onComplete() {
          animatingRef.current = false;
          if (idx === 3) {
            document.querySelectorAll(".counter").forEach((el) => {
              const target = parseInt((el as HTMLElement).dataset.target || "0", 10);
              gsap.fromTo(el, { innerText: 0 }, {
                innerText: target, duration: 1.6, ease: "power1.out", snap: { innerText: 1 },
                onUpdate(this: gsap.Context) {
                  el.textContent = String(Math.floor(Number(gsap.getProperty(el, "innerText"))));
                },
                onComplete() { el.textContent = String(target); },
              });
            });
            document.querySelectorAll(".skill-bar-fill").forEach((el) => {
              const w = (el as HTMLElement).dataset.width || "0";
              gsap.to(el, { width: w + "%", duration: 1.4, ease: "power3.out" });
            });
          }
        },
      }
    );

    document.querySelectorAll(".nav-dot").forEach((d) => d.classList.remove("active"));
    document.querySelector('.nav-dot[data-section="' + idx + '"]')?.classList.add("active");
    currentRef.current = idx;
  }, [total]);

  // Wheel, touch, keyboard listeners
  useEffect(() => {
    let lastWheel = 0;
    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheel < 600) return;
      lastWheel = now;
      if (e.deltaY > 0) goTo(currentRef.current + 1);
      else goTo(currentRef.current - 1);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goTo(currentRef.current + 1);
        else goTo(currentRef.current - 1);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(currentRef.current + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") goTo(currentRef.current - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goTo]);

  return { current: currentRef.current, goTo, total };
}
