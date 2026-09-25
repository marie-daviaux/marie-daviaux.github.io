"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CircleArrow } from "@/components/circle-arrow";
import { ContentsLink } from "@/components/contents-link";
import { useRouteTransition } from "@/components/route-transition-provider";

type Experience = {
  role: string;
  meta: string;
  description: string;
};

type Skill = {
  title: string;
  description: string;
};

type ExperiencesSliderProps = {
  title: string;
  signature: string;
  backLabel: string;
  continueLabel: string;
  items: Experience[];
  olderItems: Experience[];
  skills: Skill[];
};

gsap.registerPlugin(useGSAP);

export function ExperiencesSlider({
  title,
  signature,
  backLabel,
  continueLabel,
  items,
  olderItems,
  skills,
}: ExperiencesSliderProps) {
  const { navigate } = useRouteTransition();
  const trackRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const [slide, setSlide] = useState<0 | 1>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useGSAP(
    () => {
      gsap.set(skillsRef.current, { xPercent: 100 });
      return () => animationRef.current?.kill();
    },
    { scope: trackRef },
  );

  const showNextSlide = () => {
    if (isAnimating) {
      return;
    }

    if (slide === 1) {
      navigate("/design-graphique/huret-colas", "brown");
      return;
    }

    const track = trackRef.current;
    const skillsPanel = skillsRef.current;

    if (!track || !skillsPanel) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSlide(1);
      gsap.set(track, { x: window.innerWidth >= 1024 ? -window.innerWidth : 0, autoAlpha: 1 });
      gsap.set(skillsPanel, { xPercent: 0 });
      return;
    }

    setIsAnimating(true);

    if (window.innerWidth >= 1024) {
      animationRef.current = gsap.timeline({
        defaults: { duration: 1.2, ease: "power3.inOut" },
        onComplete: () => {
          setSlide(1);
          setIsAnimating(false);
        },
      });
      animationRef.current.to(track, { x: -window.innerWidth }, 0).to(
        skillsPanel,
        { xPercent: 0 },
        0,
      );
      return;
    }

    animationRef.current = gsap.to(track, {
      x: -window.innerWidth * 0.8,
      autoAlpha: 0,
      duration: 0.55,
      ease: "power3.in",
      onComplete: () => {
        setSlide(1);
        requestAnimationFrame(() => {
          gsap.set(skillsPanel, { xPercent: 0 });
          animationRef.current = gsap.fromTo(
            track,
            { x: window.innerWidth * 0.8, autoAlpha: 0 },
            {
              x: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
              onComplete: () => setIsAnimating(false),
            },
          );
        });
      },
    });
  };

  const experienceArticle = (experience: Experience, isLast: boolean, preview: boolean) => (
    <article
      key={`${preview ? "preview" : "current"}-${experience.role}-${experience.meta}`}
      className={`relative ml-2 border-l border-portfolio-deep/80 pb-12 pl-8 lg:ml-0 lg:block lg:border-l-0 lg:pb-0 lg:pl-0 ${
        preview ? (slide === 0 ? "hidden" : "block") : slide === 1 ? "hidden" : "block"
      } ${
        isLast
          ? "after:absolute after:top-2 after:bottom-0 after:-left-px after:w-px after:bg-portfolio-paper lg:after:hidden"
          : ""
      }`}
    >
      <span className="absolute top-2 -left-1.5 z-10 size-3 rounded-full bg-portfolio-deep lg:hidden" />

      <div className="flex items-start pb-4 lg:h-32 lg:items-end lg:px-8 lg:pb-5 xl:px-20">
        <h2 className="text-xl leading-snug whitespace-pre-line lg:text-2xl">{experience.role}</h2>
      </div>

      <div className="relative hidden lg:block">
        <span className="absolute top-0 left-8 z-10 size-3 -translate-y-1/2 rounded-full bg-portfolio-deep xl:left-20" />
      </div>

      <div className="pt-4 lg:px-8 lg:pt-9 lg:pb-12 xl:px-20">
        <p className="text-base leading-relaxed lg:text-lg">{experience.meta}</p>
        <p className="mt-6 text-base leading-relaxed lg:text-lg">{experience.description}</p>
      </div>
    </article>
  );

  return (
    <main className="relative min-h-svh overflow-x-hidden bg-portfolio-paper text-portfolio-copy lg:h-svh lg:overflow-hidden">
      <header className="absolute inset-x-0 top-4 z-30 flex items-center justify-between px-6 md:px-7">
        <ContentsLink className="group flex items-center gap-5 text-base text-portfolio-deep md:gap-6 md:text-lg">
          <CircleArrow reverse />
          <span>{backLabel}</span>
        </ContentsLink>

        <button
          type="button"
          disabled={isAnimating}
          onClick={showNextSlide}
          className={`group flex cursor-pointer items-center gap-5 text-sm transition-colors duration-500 disabled:cursor-wait md:gap-6 md:text-base ${
            slide === 1 ? "text-portfolio-deep lg:text-white" : "text-portfolio-deep"
          }`}
        >
          <span className="hidden sm:inline">{continueLabel}</span>
          <CircleArrow tone={slide === 1 ? "responsive" : "dark"} />
        </button>
      </header>

      <section className="min-h-svh pt-36 pb-24 lg:pt-56">
        <h1 className="px-6 font-display text-5xl leading-none font-normal tracking-tight not-italic text-portfolio-title md:px-10 md:text-6xl lg:px-20 lg:text-7xl">
          {title}
        </h1>

        <div
          ref={trackRef}
          className="relative z-0 mx-6 mt-20 grid grid-cols-1 will-change-transform md:mx-10 lg:mx-0 lg:mt-32 lg:w-[150vw] lg:grid-cols-[repeat(6,minmax(0,25vw))] lg:before:absolute lg:before:inset-x-0 lg:before:top-32 lg:before:border-t lg:before:border-portfolio-deep/80"
        >
          {items.map((experience, index) =>
            experienceArticle(experience, index === items.length - 1, false),
          )}
          {olderItems.map((experience, index) =>
            experienceArticle(experience, index === olderItems.length - 1, true),
          )}
        </div>
      </section>

      <section
        ref={skillsRef}
        className={`relative min-h-svh overflow-hidden text-white will-change-transform lg:absolute lg:inset-y-0 lg:right-0 lg:z-10 lg:block lg:h-svh lg:w-1/2 ${
          slide === 0 ? "hidden" : "block"
        }`}
      >
        <Image
          src="/skills-texture.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />

        <div className="relative grid min-h-svh grid-cols-1 border-t border-white/70 pt-20 pb-20 sm:grid-cols-2 lg:absolute lg:inset-x-0 lg:top-20 lg:bottom-20 lg:min-h-0 lg:pt-0 lg:pb-0">
          {skills.map((skill) => (
            <article
              key={skill.title}
              className="flex min-h-64 flex-col items-center justify-center border-b border-white/70 px-6 py-6 text-center sm:odd:border-r lg:min-h-0 xl:px-8"
            >
              <h2 className="font-display text-xl font-normal italic 2xl:text-2xl">{skill.title}</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed whitespace-pre-line xl:text-base 2xl:text-lg">
                {skill.description}
              </p>
            </article>
          ))}
        </div>

        <p className="absolute right-6 bottom-6 text-xs tracking-wide md:right-10 md:text-sm lg:right-12 lg:bottom-7 lg:text-base">
          {signature}
        </p>
      </section>

      {slide === 0 ? (
        <p className="px-6 pb-6 text-right text-xs tracking-wide text-portfolio-muted md:px-10 md:text-sm lg:absolute lg:right-12 lg:bottom-8 lg:px-0 lg:pb-0 lg:text-base">
          {signature}
        </p>
      ) : null}
    </main>
  );
}
