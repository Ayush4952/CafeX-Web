import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "CafeX — Crafted coffee, made personal", template: "%s · CafeX" },
  description: "A modern café ordering and management experience powered by CafeX.",
  icons: { icon: "/cafex-logo.png", shortcut: "/cafex-logo.png" },
  openGraph: {
    title: "CafeX — Slow mornings. Remarkable coffee.",
    description: "Order handcrafted coffee, fresh bakes, and local café favorites from CafeX.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CafeX coffee in Kathmandu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CafeX — Slow mornings. Remarkable coffee.",
    description: "A modern café ordering experience from Kathmandu.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
