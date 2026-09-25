"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { useRouteTransition } from "@/components/route-transition-provider";

type AnimatedRouteLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  cover?: "menu" | "paper" | "brown";
};

export function AnimatedRouteLink({
  href,
  children,
  className,
  cover = "paper",
}: AnimatedRouteLinkProps) {
  const { navigate } = useRouteTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(href, cover);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
