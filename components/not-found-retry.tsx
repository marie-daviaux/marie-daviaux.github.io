"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const RETRY_DELAY_SECONDS = 8;
const RETRY_COOLDOWN_MS = 60_000;

export function NotFoundRetry() {
  const [seconds, setSeconds] = useState(RETRY_DELAY_SECONDS);
  const [willRetry, setWillRetry] = useState(false);

  useEffect(() => {
    const retryKey = `portfolio-404-retry:${window.location.pathname}`;
    const lastRetry = Number(window.sessionStorage.getItem(retryKey) ?? 0);

    if (Date.now() - lastRetry < RETRY_COOLDOWN_MS) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setWillRetry(true));
    const interval = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    const timeout = window.setTimeout(() => {
      window.sessionStorage.setItem(retryKey, String(Date.now()));
      window.location.reload();
    }, RETRY_DELAY_SECONDS * 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  function retryNow() {
    window.location.reload();
  }

  return (
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
        {willRetry ? `Nouvelle tentative dans ${seconds} s` : "La page reste indisponible."}
      </p>
    </div>
  );
}
