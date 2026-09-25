"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CircleArrow } from "@/components/circle-arrow";
import { ContentsLink } from "@/components/contents-link";
import { useRouteTransition } from "@/components/route-transition-provider";
import { communicationProjects } from "@/lib/communication-projects";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

gsap.registerPlugin(useGSAP);

export function CommunicationProjectPage({ projectIndex }: { projectIndex: number }) {
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

  const content = messages.communication.projects[activeIndex];
  const nextProject = communicationProjects[activeIndex + 1];
  const nextHref = nextProject ? `/communication/${nextProject.slug}` : "/contact";

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
      const index = communicationProjects.findIndex((project) => project.slug === slug);

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
  }, []);

  const showProjectText = (index: number) => {
    gsap.killTweensOf(textRef.current);
    activeIndexRef.current = index;
    setActiveIndex(index);

    const nextContent = messages.communication.projects[index];
    window.history.pushState({}, "", `/communication/${communicationProjects[index].slug}`);
    document.title = `${nextContent.subtitle} — ${messages.brand.name}`;

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

    const destinationIndex = activeIndex + 1;

    if (destinationIndex >= communicationProjects.length) {
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

      <section
        ref={textRef}
        className="invisible relative z-10 flex min-h-svh items-center px-6 py-24 opacity-0 sm:px-10 md:px-16 lg:px-20 xl:px-32 2xl:px-60"
      >
        <div className="w-full max-w-[700px]">
          <h1 className="font-display text-5xl leading-none font-normal tracking-tight whitespace-pre-line text-white sm:text-6xl lg:text-7xl">
            {messages.communication.title}
          </h1>
          <h2 className="mt-10 text-xl leading-tight uppercase sm:text-2xl lg:mt-16 lg:text-3xl">
            {content.subtitle}
          </h2>

          <div className="mt-12 max-w-[660px] space-y-8 text-lg leading-relaxed sm:text-xl lg:mt-16 lg:text-2xl">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <nav
            aria-label={messages.communication.projectNavigation}
            className="mt-12 flex flex-wrap items-center justify-between gap-8 lg:mt-9"
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
        ref={galleryViewportRef}
        aria-label={`${messages.communication.galleryLabel} ${content.subtitle}`}
        className="invisible relative z-10 grid h-svh grid-cols-2 gap-4 overflow-hidden px-4 opacity-0 sm:gap-5 sm:px-6 lg:gap-5 lg:pr-7 lg:pl-0"
      >
        {[0, 1].map((columnIndex) => (
          <div
            key={columnIndex}
            ref={(node) => {
              columnRefs.current[columnIndex] = node;
            }}
            className={`flex flex-col ${columnIndex === 0 ? "-mt-8 lg:-mt-16" : "-mt-14 lg:-mt-28"}`}
          >
            {communicationProjects.map((galleryProject, galleryProjectIndex) => {
              const galleryContent = messages.communication.projects[galleryProjectIndex];
              const column = galleryProject.columns[columnIndex];

              return (
                <div
                  key={galleryProject.slug}
                  ref={(node) => {
                    groupRefs.current[columnIndex][galleryProjectIndex] = node;
                  }}
                  className="flex flex-col gap-4 pb-4 sm:gap-5 sm:pb-5"
                >
                  {column.map((filename, imageIndex) => (
                    <div
                      key={`${filename}-${imageIndex}`}
                      className="relative aspect-[332/431] shrink-0 overflow-hidden rounded-3xl"
                    >
                      <Image
                        src={`/communication/${galleryProject.slug}/${filename}`}
                        alt={`${galleryContent.subtitle} — ${galleryContent.imageAlts[columnIndex][imageIndex]}`}
                        fill
                        priority={galleryProjectIndex === projectIndex && imageIndex === 0}
                        sizes="(min-width: 1024px) 19vw, 46vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </main>
  );
}
