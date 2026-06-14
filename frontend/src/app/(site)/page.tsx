// Landing page — pixel-faithful port of design/hrast.html, CMS-driven.
// Server component: fetches all published sections + projects per locale with
// tag-based ISR ('content' / 'projects'); falls back to the built-in mirror of
// the seed copy when the API is unreachable, so the page always renders fully.
import type { Metadata } from "next";
import Cta from "@/components/landing/Cta";
import ExpandingHero from "@/components/landing/ExpandingHero";
import Gallery from "@/components/landing/Gallery";
import Hero from "@/components/landing/Hero";
import Rooms from "@/components/landing/Rooms";
import Statement from "@/components/landing/Statement";
import Stats from "@/components/landing/Stats";
import { getPageContent, getProjects } from "@/lib/api/content";
import { getLocale, UI } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const { seo } = await getPageContent(locale);
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default async function LandingPage() {
  const locale = getLocale();
  const t = UI[locale];
  const [content, projects] = await Promise.all([
    getPageContent(locale),
    getProjects(locale),
  ]);

  return (
    <main>
      <Hero hero={content.hero} />
      <ExpandingHero caption={content.hero.imageCaption} image={content.hero.image} />
      <Statement statement={content.statement} />
      <Rooms
        section={content.rooms}
        heading={{
          label: content.rooms.label ?? t.rooms.label,
          title: content.rooms.title ?? t.rooms.title,
        }}
      />
      <Gallery heading={content.gallery} projects={projects} t={t.gallery} />
      <Stats items={content.stats.items} />
      <Cta contact={content.contact} socials={content.socialLinks} />
    </main>
  );
}
