import type { Metadata } from "next";
import { defaultLocale, getDictionary } from "@/i18n/dictionaries";
import { RouteTransitionProvider } from "@/components/route-transition-provider";
import "./globals.css";

const messages = getDictionary();

export const metadata: Metadata = {
  title: messages.metadata.title,
  description: messages.metadata.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body suppressHydrationWarning className="m-0 font-sans font-normal antialiased">
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
      </body>
    </html>
  );
}
