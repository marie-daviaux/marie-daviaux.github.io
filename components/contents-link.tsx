"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouteTransition } from "@/components/route-transition-provider";
import { MENU_RETURN_TRANSITION } from "@/lib/navigation-transitions";

export function ContentsLink({
  children,
  className,
  cover = "paper",
}: {
  children: ReactNode;
  className: string;
  cover?: "paper" | "brown";
}) {
  const { navigate } = useRouteTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    sessionStorage.setItem(MENU_RETURN_TRANSITION, "true");
    navigate("/?menu=open", cover);
  };

  return (
    <Link href="/?menu=open" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
