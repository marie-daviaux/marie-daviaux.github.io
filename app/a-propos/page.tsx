import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleArrow } from "@/components/circle-arrow";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export const metadata: Metadata = {
  title: `${messages.about.title} — ${messages.brand.name}`,
  description: messages.about.text,
};

export default function AboutPage() {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-portfolio-paper text-portfolio-title">
      <Link
        href="/?menu=open"
        className="group absolute top-4 left-6 z-10 flex items-center gap-5 text-base text-portfolio-deep md:left-7 md:gap-6 md:text-lg"
      >
        <CircleArrow reverse />
        <span>{messages.navigation.backToContents}</span>
      </Link>

      <section className="mx-auto grid min-h-svh w-full max-w-7xl items-center gap-12 px-6 pt-28 pb-28 md:px-10 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pt-48 xl:px-0">
        <div className="relative mx-auto aspect-4/5 w-full max-w-[450px] overflow-hidden rounded-tr-[9rem] md:rounded-tr-[12rem] lg:col-span-5 lg:mx-0 lg:max-w-none lg:rounded-tr-[14rem]">
          <Image
            src="/marie-portrait.png"
            alt={messages.images.aboutPortraitAlt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="lg:col-span-7">
          <div className="mx-auto w-full max-w-[580px] text-left lg:mx-0">
            <h1 className="font-display text-5xl leading-none font-normal tracking-tight not-italic md:text-6xl lg:text-7xl">
              {messages.about.title}
            </h1>
            <p className="mt-10 text-lg leading-relaxed text-portfolio-copy md:text-xl lg:text-2xl">
              {messages.about.text}
            </p>
          </div>

          <Link
            href="/a-propos/experiences"
            className="group mt-10 ml-auto flex w-fit items-center gap-5 text-sm text-portfolio-deep md:gap-6 md:text-base 2xl:fixed 2xl:top-1/2 2xl:right-16 2xl:mt-0 2xl:-translate-y-1/2"
          >
            <span>{messages.navigation.continue}</span>
            <CircleArrow />
          </Link>
        </div>
      </section>

      <p className="absolute right-6 bottom-6 text-xs tracking-wide text-portfolio-muted md:right-10 md:bottom-8 md:text-sm lg:right-12 lg:text-base">
        {messages.about.signature}
      </p>
    </main>
  );
}
