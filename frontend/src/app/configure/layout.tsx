import type { Metadata } from "next";

// Own full-screen layout — the configurator deliberately carries no site nav.
export const metadata: Metadata = {
  title: "Povpraševanje — Mizarstvo",
  description:
    "Sestavite svoje pohištvo po meri: kategorija, oblika, mere, les — s 3D predogledom v živo.",
  robots: { index: false },
};

export default function ConfigureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
