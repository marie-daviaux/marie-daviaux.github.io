"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CircleArrow } from "@/components/circle-arrow";
import { ContentsLink } from "@/components/contents-link";
import { useRouteTransition } from "@/components/route-transition-provider";
import type { PortfolioProject } from "@/lib/portfolio-data";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

const frameClasses = [
  ["aspect-[9/10]", "aspect-[4/5]", "aspect-[4/3]"],
  ["aspect-[4/3]", "aspect-[4/5]", "aspect-square"],
] as const;

gsap.registerPlugin(useGSAP);

export function GraphicDesignProjectPage({
  projectIndex,
  projects,
}: {
  projectIndex: number;
  projects: PortfolioProject[];
}) {
  const { navigate } = useRouteTransition();
  const pageRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const galleryViewportRef = useRef<HTMLElement>(null);
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);
  const groupRefs = useRef<Array<Array<HTMLDivElement | null>>>([[], []]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const activeIndexRef = useRef(projectIndex);
  const [activeIndex, setActiveIndex] = useState(projectIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const content = projects[activeIndex];
  const nextProject = projects[activeIndex + 1];
  const nextHref = nextProject
    ? `/design-graphique/${nextProject.slug}`
    : "/communication/vendanges-2025";

  const projectOffset = (columnIndex: number, index: number) =>
    groupRefs.current[columnIndex]?.[index]?.offsetTop ?? 0;

  useGSAP(
    () => {
      columnRefs.current.forEach((column, columnIndex) => {
        gsap.set(column, { y: -projectOffset(columnIndex, projectIndex) });
      });
      gsap.set([textRef.current, galleryViewportRef.current], { autoAlpha: 1, y: 0 });

      const resizeObserver = new ResizeObserver(() => {
        columnRefs.current.forEach((column, columnIndex) => {
          gsap.set(column, { y: -projectOffset(columnIndex, activeIndexRef.current) });
        });
      });

      if (galleryViewportRef.current) {
        resizeObserver.observe(galleryViewportRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        timelineRef.current?.kill();
      };
    },
    { scope: pageRef },
  );

  useEffect(() => {
    const onPopState = () => {
      const slug = window.location.pathname.split("/").filter(Boolean).at(-1);
      const index = projects.findIndex((project) => project.slug === slug);

      if (index === -1) {
        return;
      }

      activeIndexRef.current = index;
      setActiveIndex(index);
      columnRefs.current.forEach((column, columnIndex) => {
        gsap.set(column, { y: -projectOffset(columnIndex, index) });
      });
      gsap.set(textRef.current, { y: 0, autoAlpha: 1 });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [projects]);

  const showProjectText = (index: number) => {
    gsap.killTweensOf(textRef.current);
    activeIndexRef.current = index;
    setActiveIndex(index);

    const nextContent = projects[index];
    window.history.pushState({}, "", `/design-graphique/${nextContent.slug}`);
    document.title = `${nextContent.title} — ${messages.brand.name}`;

    gsap.set(textRef.current, { y: -window.innerHeight, autoAlpha: 1 });
    requestAnimationFrame(() => {
      gsap.to(textRef.current, {
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => setIsTransitioning(false),
      });
    });
  };

  const handleNext = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (isTransitioning) {
      return;
    }

    if (window.matchMedia("(max-width: 1023px)").matches) {
      navigate(nextHref, "brown");
      return;
    }

    const destinationIndex = activeIndex + 1;

    if (destinationIndex >= projects.length) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        navigate(nextHref, "brown");
        return;
      }

      setIsTransitioning(true);
      timelineRef.current = gsap.timeline({
        onComplete: () => navigate(nextHref, "brown"),
      });
      timelineRef.current.to(pageRef.current, {
        y: 36,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power3.inOut",
      });
      return;
    }

    setIsTransitioning(true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      columnRefs.current.forEach((column, columnIndex) => {
        gsap.set(column, { y: -projectOffset(columnIndex, destinationIndex) });
      });
      showProjectText(destinationIndex);
      return;
    }

    timelineRef.current = gsap
      .timeline({ defaults: { ease: "power3.inOut" } })
      .to(
        columnRefs.current[0],
        { y: -projectOffset(0, destinationIndex), duration: 1.25 },
        0,
      )
      .to(
        columnRefs.current[1],
        { y: -projectOffset(1, destinationIndex), duration: 1.25 },
        0,
      )
      .to(textRef.current, { y: window.innerHeight, duration: 0.58 }, 0)
      .call(() => showProjectText(destinationIndex), [], 0.6);
  };

  return (
    <main
      ref={pageRef}
      className="relative min-h-svh overflow-x-hidden bg-portfolio-deep text-white lg:grid lg:h-svh lg:grid-cols-[5fr_3fr] lg:overflow-hidden"
    >
      <Image
        src="/skills-texture.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="fixed object-cover"
      />
      <div className="absolute inset-0 bg-portfolio-deep/10" />

      <ContentsLink
        cover="brown"
        className="group absolute top-6 left-6 z-20 flex items-center gap-5 text-sm tracking-wide sm:top-8 sm:left-10 sm:text-base lg:hidden"
      >
        <CircleArrow reverse tone="light" />
        <span>{messages.navigation.backToContents}</span>
      </ContentsLink>

      <section
        ref={textRef}
        className="invisible relative z-10 flex min-h-svh items-center px-6 py-24 opacity-0 sm:px-10 md:px-16 lg:px-20 xl:px-32 2xl:px-60"
      >
        <div className="w-full max-w-[700px]">
          <h1 className="font-display text-5xl leading-none font-normal tracking-tight text-white sm:text-6xl lg:text-7xl">
            {messages.graphicDesign.title}
          </h1>
          <h2 className="mt-6 text-xl leading-tight uppercase sm:text-2xl lg:mt-8 lg:text-3xl">
            {content.title}
          </h2>

          <div className="mt-12 max-w-[660px] space-y-8 text-lg leading-relaxed sm:text-xl lg:mt-16 lg:text-2xl">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <nav
            aria-label={messages.graphicDesign.projectNavigation}
            className="mt-9 hidden items-center justify-between gap-8 lg:flex"
          >
            <ContentsLink
              cover="brown"
              className="group flex items-center gap-5 text-sm tracking-wide sm:text-base"
            >
              <CircleArrow reverse tone="light" />
              <span>{messages.navigation.backToContents}</span>
            </ContentsLink>

            <Link
              href={nextHref}
              onClick={handleNext}
              aria-disabled={isTransitioning}
              className="group flex items-center gap-5 text-sm tracking-wide sm:text-base"
            >
              <span>{messages.navigation.continue}</span>
              <CircleArrow tone="light" />
            </Link>
          </nav>
        </div>
      </section>

      <section
        aria-label={`${messages.graphicDesign.galleryLabel} ${content.title}`}
        className="relative z-10 grid grid-cols-2 items-start gap-4 px-4 pb-6 sm:gap-5 sm:px-6 lg:hidden"
      >
        {content.columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={`flex flex-col gap-4 sm:gap-5 ${columnIndex === 0 ? "-mt-8" : "-mt-14"}`}
          >
            {column.map((image, imageIndex) => {
              const isIllustrationCard =
                content.slug === "take-happiness" &&
                image.url.endsWith("/illustration-blanche.png");

              return (
                <div
                  key={image.id}
                  className={`relative shrink-0 overflow-hidden rounded-3xl ${frameClasses[columnIndex][imageIndex % frameClasses[columnIndex].length]} ${isIllustrationCard ? "bg-[#603633]" : ""}`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText}
                    fill
                    priority={imageIndex === 0}
                    sizes="46vw"
                    className={isIllustrationCard ? "object-contain p-6 sm:p-12" : "object-cover"}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <nav
        aria-label={messages.graphicDesign.projectNavigation}
        className="relative z-10 flex justify-end px-6 pt-4 pb-16 sm:px-10 lg:hidden"
      >
        <Link
          href={nextHref}
          onClick={handleNext}
          aria-disabled={isTransitioning}
          className="group flex items-center gap-5 text-sm tracking-wide sm:text-base"
        >
          <span>{messages.navigation.continue}</span>
          <CircleArrow tone="light" />
        </Link>
      </nav>

      <section
        ref={galleryViewportRef}
        aria-label={`${messages.graphicDesign.galleryLabel} ${content.title}`}
        className="invisible relative z-10 hidden h-svh grid-cols-2 gap-5 overflow-hidden pr-7 pl-0 opacity-0 lg:grid"
      >
        {[0, 1].map((columnIndex) => (
          <div
            key={columnIndex}
            ref={(node) => {
              columnRefs.current[columnIndex] = node;
            }}
            className={`flex flex-col ${columnIndex === 0 ? "-mt-8 lg:-mt-16" : "-mt-14 lg:-mt-28"}`}
          >
            {projects.map((galleryProject, galleryProjectIndex) => {
              const column = galleryProject.columns[columnIndex];

              return (
                <div
                  key={galleryProject.slug}
                  ref={(node) => {
                    groupRefs.current[columnIndex][galleryProjectIndex] = node;
                  }}
                  className="flex flex-col gap-4 pb-4 sm:gap-5 sm:pb-5"
                >
                  {column.map((image, imageIndex) => {
                    const isIllustrationCard =
                      galleryProject.slug === "take-happiness" &&
                      image.url.endsWith("/illustration-blanche.png");

                    return (
                      <div
                        key={image.id}
                        className={`relative shrink-0 overflow-hidden rounded-3xl ${frameClasses[columnIndex][imageIndex % frameClasses[columnIndex].length]} ${isIllustrationCard ? "bg-[#603633]" : ""}`}
                      >
                        <Image
                          src={image.url}
                          alt={image.altText}
                          fill
                          priority={galleryProjectIndex === projectIndex && imageIndex === 0}
                          sizes="(min-width: 1024px) 19vw, 46vw"
                          className={isIllustrationCard ? "object-contain p-12" : "object-cover"}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </main>
  );
}
