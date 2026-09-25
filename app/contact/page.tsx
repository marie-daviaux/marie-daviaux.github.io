import type { Metadata } from "next";
import { CircleArrow } from "@/components/circle-arrow";
import { ContentsLink } from "@/components/contents-link";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export const metadata: Metadata = {
  title: `${messages.contact.title} — ${messages.brand.name}`,
  description: `${messages.contact.thankYou} — ${messages.contact.email}`,
};

export default function ContactPage() {
  return (
    <main className="relative grid min-h-svh overflow-hidden bg-[url('/skills-texture.png')] bg-cover bg-center text-white">
      <ContentsLink
        cover="brown"
        className="group absolute top-4 left-6 z-10 flex items-center gap-5 text-base md:left-7 md:gap-6 md:text-lg"
      >
        <CircleArrow reverse tone="light" />
        <span>{messages.navigation.backToContents}</span>
      </ContentsLink>

      <section className="flex min-h-svh flex-col items-center justify-center px-6 pt-24 pb-28 text-center">
        <div className="relative flex flex-col items-center">
          <span
            aria-hidden="true"
            className="font-display text-[16rem] leading-[0.72] font-normal text-black/5 [-webkit-text-stroke:1px_rgba(255,255,255,0.07)] [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.05),2px_2px_3px_rgba(0,0,0,0.28)] sm:text-[20rem] lg:text-[27rem]"
          >
            M
          </span>
          <h1 className="mt-14 text-xl font-normal tracking-wide uppercase sm:text-2xl lg:mt-20 lg:text-3xl">
            {messages.contact.thankYou}
          </h1>
        </div>
      </section>

      <a
        href={`mailto:${messages.contact.email}`}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-sm tracking-wide text-white/90 transition-opacity duration-300 hover:opacity-65 sm:text-base lg:bottom-12 lg:text-lg"
      >
        {messages.contact.email}
      </a>
    </main>
  );
}
