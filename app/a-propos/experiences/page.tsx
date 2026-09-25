import type { Metadata } from "next";
import Link from "next/link";
import { CircleArrow } from "@/components/circle-arrow";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();
const experiences = messages.about.experiences;

export const metadata: Metadata = {
  title: `${experiences.title} — ${messages.brand.name}`,
  description: experiences.items.map((item) => item.role.replaceAll("\n", " ")).join(", "),
};

export default function ExperiencesPage() {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-portfolio-paper text-portfolio-copy">
      <header className="absolute inset-x-0 top-4 z-10 flex items-center justify-between px-6 md:px-7">
        <Link
          href="/?menu=open"
          className="group flex items-center gap-5 text-base text-portfolio-deep md:gap-6 md:text-lg"
        >
          <CircleArrow reverse />
          <span>{messages.navigation.backToContents}</span>
        </Link>

        <Link
          href="/a-propos/experiences/competences"
          className="group flex items-center gap-5 text-sm text-portfolio-deep md:gap-6 md:text-base"
        >
          <span className="hidden sm:inline">{messages.navigation.continue}</span>
          <CircleArrow />
        </Link>
      </header>

      <section className="min-h-svh pt-36 pb-24 lg:pt-56">
        <h1 className="px-6 font-display text-5xl leading-none font-normal tracking-tight not-italic text-portfolio-title md:px-10 md:text-6xl lg:px-20 lg:text-7xl">
          {experiences.title}
        </h1>

        <div className="relative mx-6 mt-20 grid grid-cols-1 md:mx-10 lg:mx-0 lg:mt-32 lg:grid-cols-4 lg:before:absolute lg:before:inset-x-0 lg:before:top-32 lg:before:border-t lg:before:border-portfolio-deep/80">
          {experiences.items.map((experience) => (
            <article
              key={`${experience.role}-${experience.meta}`}
              className="relative ml-2 border-l border-portfolio-deep/80 pb-12 pl-8 last:after:absolute last:after:top-2 last:after:bottom-0 last:after:-left-px last:after:w-px last:after:bg-portfolio-paper lg:ml-0 lg:border-l-0 lg:pb-0 lg:pl-0 lg:last:after:hidden"
            >
              <span className="absolute top-2 -left-1.5 z-10 size-3 rounded-full bg-portfolio-deep lg:hidden" />

              <div className="flex items-start pb-4 lg:h-32 lg:items-end lg:px-8 lg:pb-5 xl:px-20">
                <h2 className="text-xl leading-snug whitespace-pre-line lg:text-2xl">
                  {experience.role}
                </h2>
              </div>

              <div className="relative hidden lg:block">
                <span className="absolute top-0 left-8 z-10 size-3 -translate-y-1/2 rounded-full bg-portfolio-deep xl:left-20" />
              </div>

              <div className="pt-4 lg:px-8 lg:pt-9 lg:pb-12 xl:px-20">
                <p className="text-base leading-relaxed lg:text-lg">{experience.meta}</p>
                <p className="mt-6 text-base leading-relaxed lg:text-lg">{experience.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="px-6 pb-6 text-right text-xs tracking-wide text-portfolio-muted md:px-10 md:text-sm lg:absolute lg:right-12 lg:bottom-8 lg:px-0 lg:pb-0 lg:text-base">
        {messages.about.signature}
      </p>
    </main>
  );
}
