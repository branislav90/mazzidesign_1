import Link from "next/link";

// Landing page — pixel-faithful port of design/hrast.html, CMS-driven.
// Built out in Milestone 3; this stub verifies tokens, fonts and routing.
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="text-xs uppercase tracking-label text-soft">
        Atelje za pohištvo po meri
      </p>
      <h1 className="font-serif text-5xl leading-tight md:text-7xl">
        Les, ki pripoveduje
        <br />
        vašo zgodbo
      </h1>
      <Link
        href="/configure"
        className="border border-ink px-8 py-3 text-xs uppercase tracking-label transition-colors duration-700 ease-hrast hover:bg-ink hover:text-white"
      >
        Začnite s pogovorom
      </Link>
    </main>
  );
}
