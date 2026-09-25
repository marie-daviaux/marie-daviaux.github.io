import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleArrow } from "@/components/circle-arrow";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();
const experiences = messages.about.experiences;

export const metadata: Metadata = {
  title: `${experiences.title} — ${messages.brand.name}`,
  description: experiences.olderItems.map((item) => item.role.replaceAll("\n", " ")).join(", "),
};

export default function ExperienceSkillsPage() {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-portfolio-paper text-portfolio-copy lg:grid lg:h-svh lg:grid-cols-2 lg:overflow-hidden">
      <header className="absolute inset-x-0 top-4 z-20 flex items-center justify-between px-6 md:px-7">
        <Link
          href="/?menu=open"
          className="group flex items-center gap-5 text-base text-portfolio-deep md:gap-6 md:text-lg"
        >
          <CircleArrow reverse />
          <span>{messages.navigation.backToContents}</span>
        </Link>

        <Link
          href="/design-graphique"
          className="group flex items-center gap-5 text-sm text-portfolio-deep md:gap-6 md:text-base lg:text-white"
        >
          <span className="hidden sm:inline">{messages.navigation.continue}</span>
          <CircleArrow tone="responsive" />
        </Link>
      </header>

      <section className="min-h-svh pt-36 pb-20 lg:pt-56">
        <h1 className="px-6 font-display text-5xl leading-none font-normal tracking-tight not-italic text-portfolio-title md:px-10 md:text-6xl lg:px-20 lg:text-7xl">
          {experiences.title}
        </h1>

        <div className="relative mx-6 mt-20 grid grid-cols-1 md:mx-10 lg:mx-0 lg:mt-40 lg:grid-cols-2 lg:before:absolute lg:before:inset-x-0 lg:before:top-24 lg:before:border-t lg:before:border-portfolio-deep/80">
          {experiences.olderItems.map((experience) => (
            <article
              key={`${experience.role}-${experience.meta}`}
              className="relative ml-2 border-l border-portfolio-deep/80 pb-12 pl-8 last:after:absolute last:after:top-2 last:after:bottom-0 last:after:-left-px last:after:w-px last:after:bg-portfolio-paper lg:ml-0 lg:border-l-0 lg:pb-0 lg:pl-0 lg:last:after:hidden"
            >
              <span className="absolute top-2 -left-1.5 z-10 size-3 rounded-full bg-portfolio-deep lg:hidden" />

              <div className="flex items-start pb-4 lg:h-24 lg:items-end lg:px-8 lg:pb-5 xl:px-20">
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
          ))}
        </div>
      </section>

      <section className="relative min-h-svh overflow-hidden text-white lg:h-svh lg:min-h-0 lg:self-start">
        <Image
          src="/skills-texture.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />

        <div className="relative grid min-h-svh grid-cols-1 border-t border-white/70 pt-20 pb-20 sm:grid-cols-2 lg:absolute lg:inset-x-0 lg:top-20 lg:bottom-20 lg:min-h-0 lg:pt-0 lg:pb-0">
          {experiences.skills.map((skill) => (
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
          {messages.about.signature}
        </p>
      </section>
    </main>
  );
}
