import type { Metadata } from "next";
import { Marcellus, Mulish } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
  return (
    <html lang="sl">
      <body
        className={`${marcellus.variable} ${mulish.variable} bg-white font-sans text-ink antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
