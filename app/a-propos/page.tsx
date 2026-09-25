import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export const metadata: Metadata = {
  title: `${messages.about.title} — ${messages.brand.name}`,
  description: messages.about.text,
};

function ArrowIcon({ reverse = false }: { reverse?: boolean }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#221514] transition-transform duration-300 group-hover:scale-110 md:size-14">
      <Image
        src="/arrow-right.svg"
        alt=""
        width={29}
        height={20}
        className={`h-auto w-6 brightness-0 transition-transform duration-300 group-hover:translate-x-0.5 md:w-7 ${reverse ? "rotate-180 group-hover:-translate-x-0.5" : ""}`}
      />
    </span>
  );
}

export default function AboutPage() {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-[#fdfcfb] text-[#513a2f]">
      <Link
        href="/?menu=open"
        className="group absolute top-6 left-5 z-10 flex items-center gap-5 text-base text-[#221514] md:top-7 md:left-7 md:gap-6 md:text-lg"
      >
        <ArrowIcon reverse />
        <span>{messages.navigation.backToContents}</span>
      </Link>

      <section className="mx-auto grid min-h-svh w-full max-w-7xl items-center gap-12 px-6 pt-28 pb-28 md:px-10 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pt-48 xl:px-0">
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-tr-[14rem] sm:max-w-xl lg:col-span-5 lg:max-w-none">
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
          <h1 className="font-display text-5xl leading-none tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
            {messages.about.title}
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[#403a37] md:text-xl lg:text-2xl">
            {messages.about.text}
          </p>

          <Link
            href="/design-graphique"
            className="group mt-10 ml-auto flex w-fit items-center gap-5 text-sm text-[#221514] md:gap-6 md:text-base 2xl:fixed 2xl:top-1/2 2xl:right-16 2xl:mt-0 2xl:-translate-y-1/2"
          >
            <span>{messages.navigation.continue}</span>
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <p className="absolute right-6 bottom-6 text-xs tracking-wide text-[#403a37] md:right-10 md:bottom-8 md:text-sm lg:right-12 lg:text-base">
        {messages.about.signature}
      </p>
    </main>
  );
}
