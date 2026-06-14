import type { Metadata } from "next";
import { Marcellus, Mulish } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { getDesign } from "@/lib/locale";
import { THEME_OF } from "@/lib/design";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mazzidesign — atelje za pohištvo po meri",
  description:
    "Kuhinje, omare in pohištvo po meri iz masivnega lesa. Custom woodworking atelier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Palette applies to every page (landing, configurator, admin), set from the
  // cookie so there's no flash; the switcher updates it live on the client.
  const theme = THEME_OF[getDesign()];
  return (
    <html lang="sl" data-theme={theme}>
      <body
        className={`${marcellus.variable} ${mulish.variable} bg-white font-sans text-ink antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
