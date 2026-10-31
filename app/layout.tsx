import type { Metadata } from "next";
import "@fontsource/alata/400.css";
import "@fontsource/cormorant/500.css";
import "@fontsource/cormorant/600.css";
import "@fontsource/cormorant/700.css";
import "@fontsource/cormorant/500-italic.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/reveal";

export const metadata: Metadata = {
  title: { default: "How We Stopped War", template: "%s · How We Stopped War" },
  description: "An atlas of peace: a record of how armed conflicts have been ended, reduced, and prevented.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enables reveal animations; without JS everything stays visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-ink text-paper px-3 py-2">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
