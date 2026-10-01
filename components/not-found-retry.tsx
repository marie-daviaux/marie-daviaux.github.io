"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const RETRY_DELAY_SECONDS = 8;
const RETRY_COOLDOWN_MS = 60_000;

export function NotFoundRetry() {
  const [seconds, setSeconds] = useState(RETRY_DELAY_SECONDS);
  const [status, setStatus] = useState<"checking" | "missing">("checking");

  useEffect(() => {
    const retryKey = `portfolio-404-retry:${window.location.pathname}`;
    const lastRetry = Number(window.sessionStorage.getItem(retryKey) ?? 0);

    if (Date.now() - lastRetry < RETRY_COOLDOWN_MS) {
      const frame = window.requestAnimationFrame(() => setStatus("missing"));
      return () => window.cancelAnimationFrame(frame);
    }

    const interval = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    const timeout = window.setTimeout(() => {
      window.sessionStorage.setItem(retryKey, String(Date.now()));
      window.location.reload();
    }, RETRY_DELAY_SECONDS * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  function retryNow() {
    const retryKey = `portfolio-404-retry:${window.location.pathname}`;
    window.sessionStorage.setItem(retryKey, String(Date.now()));
    window.location.reload();
  }

  return (
    <div className="mt-14">
      <h1 className="max-w-3xl font-display text-5xl leading-[0.98] text-portfolio-title sm:text-7xl">
        {status === "checking" ? "Mise à jour en cours." : "Page introuvable."}
      </h1>
      <p className="mt-7 max-w-xl text-base leading-7 text-portfolio-muted sm:text-lg sm:leading-8">
        {status === "checking"
          ? "Le portfolio est peut-être en cours de mise à jour. La page va être vérifiée à nouveau automatiquement."
          : "Cette adresse ne correspond à aucune page du portfolio. Elle a peut-être été déplacée ou supprimée."}
      </p>
      <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={retryNow}
          className="rounded-full border border-portfolio-title bg-portfolio-title px-6 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-portfolio-title"
        >
          Réessayer maintenant
        </button>
        <Link
          href="/"
          className="text-sm text-portfolio-muted underline decoration-portfolio-muted/35 underline-offset-4 transition hover:decoration-portfolio-muted"
        >
          Retour à l’accueil
        </Link>
        <p aria-live="polite" className="text-xs text-portfolio-muted/65">
          {status === "checking" ? `Nouvelle tentative dans ${seconds} s` : "Aucune nouvelle tentative automatique."}
        </p>
      </div>
    </div>
  );
}
