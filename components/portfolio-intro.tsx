"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

const sections = [
  { label: messages.menu.items.about, href: "/a-propos" },
  { label: messages.menu.items.graphicDesign, href: "#design-graphique" },
  { label: messages.menu.items.communication, href: "#communication" },
  { label: messages.menu.items.contact, href: "#contact" },
] as const;

function ArrowButton({
  open,
  onClick,
  continueLabel,
  openLabel,
  goToAboutLabel,
}: {
  open: boolean;
  onClick: () => void;
  continueLabel: string;
  openLabel: string;
  goToAboutLabel: string;
}) {
  const className =
    "group flex cursor-pointer items-center gap-5 text-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white md:gap-7";

  const content = (
    <>
      <span className="hidden text-xs tracking-wide whitespace-nowrap sm:block lg:text-sm xl:text-base">
        {continueLabel}
      </span>
      <span className="grid size-11 place-items-center rounded-full border border-white transition-transform duration-500 group-hover:scale-110 md:size-13">
        <Image
          src="/arrow-right.svg"
          alt=""
          width={29}
          height={20}
          className="h-auto w-5 transition-transform duration-500 group-hover:translate-x-0.5 md:w-7"
        />
      </span>
    </>
  );

  if (open) {
    return (
      <Link href="/a-propos" aria-label={goToAboutLabel} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded="false"
      aria-controls="portfolio-menu"
      aria-label={openLabel}
      className={className}
    >
      {content}
    </button>
  );
}

function syncMenuQuery(open: boolean) {
  const url = new URL(window.location.href);

  if (open) {
    url.searchParams.set("menu", "open");
  } else {
    url.searchParams.delete("menu");
  }

  window.history.replaceState(window.history.state, "", url);
}

export function PortfolioIntro({ initialMenuOpen = false }: { initialMenuOpen?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(initialMenuOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        syncMenuQuery(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[#221514] text-white">
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-out ${menuOpen ? "scale-105 opacity-0" : "scale-100 opacity-100"}`}
      >
        <Image
          src="/landing-texture.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#221514]/5" />
      </div>

      <div
        className={`absolute inset-0 transition-all duration-1000 ease-out ${menuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"}`}
        aria-hidden={!menuOpen}
      >
        <Image
          src="/menu-background.png"
          alt={messages.images.menuBackgroundAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#221514]/75 via-[#221514]/30 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <section
        aria-labelledby="landing-title"
        className={`absolute inset-0 transition-all duration-700 ${menuOpen ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 id="landing-title" className="text-2xl tracking-wide whitespace-nowrap sm:text-3xl lg:text-4xl">
            {messages.brand.name}
          </h1>
          <p className="mt-1 text-xl tracking-wide sm:text-2xl lg:text-3xl">
            {messages.brand.portfolio}
          </p>
        </div>
      </section>

      <aside
        id="portfolio-menu"
        aria-label={messages.menu.title}
        aria-hidden={!menuOpen}
        className={`absolute inset-y-0 left-0 w-11/12 max-w-xl overflow-hidden bg-[#5c4b48]/80 backdrop-blur-xs transition-transform duration-700 ease-in-out md:w-3/10 md:min-w-md md:max-w-none ${menuOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"}`}
      >
        <div className="pointer-events-none absolute top-16 -left-16 size-96 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 left-12 h-36 w-64 rounded-full border-8 border-white/10 blur-lg" />

        <div className="relative flex h-full flex-col px-8 py-10 sm:px-12 md:px-14 md:py-14 lg:px-16 lg:py-16 xl:px-20 xl:py-20">
          <h2 className="font-display text-4xl leading-none tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            {messages.menu.title}
          </h2>

          <nav className="mt-16 md:mt-20 lg:mt-24 xl:mt-28" aria-label={messages.menu.ariaLabel}>
            <ol className="relative flex flex-col gap-10 border-l border-white/75 py-10 sm:gap-12 md:gap-14 lg:gap-16 xl:gap-20">
              {sections.map((section, index) => (
                <li key={section.href} className="relative pl-8 md:pl-10 lg:pl-12">
                  <span className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-white" />
                  <a
                    href={section.href}
                    tabIndex={menuOpen ? 0 : -1}
                    className="relative block w-fit pb-2 text-base leading-snug whitespace-pre-line after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-white focus-visible:after:scale-x-100 sm:text-lg lg:text-xl xl:text-2xl"
                  >
                    <span className="sr-only">
                      {messages.menu.sectionPrefix} {index + 1} :{" "}
                    </span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </aside>

      <div className="absolute top-1/2 right-6 z-20 -translate-y-1/2 sm:right-8 md:right-12 lg:right-16 xl:right-20">
        <ArrowButton
          open={menuOpen}
          onClick={() => {
            setMenuOpen(true);
            syncMenuQuery(true);
          }}
          continueLabel={messages.navigation.continue}
          openLabel={messages.navigation.openMenu}
          goToAboutLabel={messages.navigation.goToAbout}
        />
      </div>

      <p
        className={`absolute right-6 bottom-6 text-sm tracking-wide transition-opacity delay-300 duration-700 sm:right-8 md:right-12 md:bottom-8 md:text-lg lg:right-16 lg:bottom-12 lg:text-xl ${menuOpen ? "opacity-100" : "opacity-0"}`}
      >
        {messages.brand.signature}
      </p>
    </main>
  );
}
