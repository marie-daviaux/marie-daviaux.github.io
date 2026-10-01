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
        <h1 className="mt-14 max-w-3xl font-display text-5xl leading-[0.98] text-portfolio-title sm:text-7xl">
          Mise à jour en cours.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-portfolio-muted sm:text-lg sm:leading-8">
          Le portfolio est peut-être en cours de mise à jour. La page va être vérifiée à nouveau automatiquement.
        </p>
        <NotFoundRetry />
      </section>
    </main>
  );
}
