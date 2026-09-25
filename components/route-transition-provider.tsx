"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type TransitionCover = "menu" | "paper" | "brown";

type RouteTransitionContextValue = {
  navigate: (href: string, cover: TransitionCover) => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

const coverClasses: Record<TransitionCover, string> = {
  menu: "bg-[url('/menu-background.png')] bg-cover bg-center",
  paper: "bg-portfolio-paper",
  brown: "bg-[url('/skills-texture.png')] bg-cover bg-center",
};

gsap.registerPlugin(useGSAP);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pendingNavigationRef = useRef(false);
  const previousPathnameRef = useRef(pathname);
  const [cover, setCover] = useState<TransitionCover>("menu");

  useGSAP(() => () => timelineRef.current?.kill());

  useEffect(() => {
    if (!pendingNavigationRef.current || previousPathnameRef.current === pathname) {
      previousPathnameRef.current = pathname;
      return;
    }

    previousPathnameRef.current = pathname;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pendingNavigationRef.current = false;
      gsap.set(overlayRef.current, { autoAlpha: 0, visibility: "hidden" });
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timelineRef.current?.kill();
        timelineRef.current = gsap.timeline({
          onComplete: () => {
            pendingNavigationRef.current = false;
            gsap.set(overlayRef.current, { visibility: "hidden" });
          },
        });
        timelineRef.current.to(overlayRef.current, {
          autoAlpha: 0,
          duration: 1.15,
          ease: "power2.inOut",
        });
      });
    });
  }, [pathname]);

  const navigate = useCallback(
    (href: string, nextCover: TransitionCover) => {
      if (pendingNavigationRef.current) {
        return;
      }

      pendingNavigationRef.current = true;
      setCover(nextCover);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      requestAnimationFrame(() => {
        timelineRef.current?.kill();
        gsap.set(overlayRef.current, { visibility: "visible" });
        timelineRef.current = gsap.timeline({
          onComplete: () => router.push(href),
        });
        timelineRef.current.fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.42, ease: "power2.inOut" },
        );
      });
    },
    [router],
  );

  return (
    <RouteTransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className={`invisible pointer-events-none fixed inset-0 z-100 opacity-0 ${coverClasses[cover]}`}
      >
        {cover === "menu" ? <div className="absolute inset-0 bg-portfolio-deep/20" /> : null}
      </div>
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);

  if (!context) {
    throw new Error("useRouteTransition must be used within RouteTransitionProvider");
  }

  return context;
}
