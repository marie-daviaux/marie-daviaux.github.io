import { NotFoundRetry } from "@/components/not-found-retry";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-portfolio-paper px-6 py-16 text-portfolio-copy sm:px-12 lg:px-20">
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-portfolio-title/10 sm:size-[30rem]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-72 rounded-full bg-portfolio-panel/8 blur-3xl sm:size-[28rem]" />

      <section className="relative mx-auto w-full max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-portfolio-muted/70">
          Portfolio · Marie Daviaux
        </p>
        <NotFoundRetry />
      </section>
    </main>
  );
}
