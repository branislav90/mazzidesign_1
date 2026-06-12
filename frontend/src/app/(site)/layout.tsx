// Public site chrome: fixed hrast nav (with SL/EN toggle) + footer.
// Locale comes from the "locale" cookie (sl default); footer social links are
// CMS-fed via getPageContent (same tagged fetch as the page — deduplicated).
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { getPageContent } from "@/lib/api/content";
import { getLocale, UI } from "@/lib/locale";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocale();
  const t = UI[locale];
  const content = await getPageContent(locale);

  return (
    <>
      <Nav locale={locale} t={t.nav} />
      {children}
      <Footer line={t.footer.line} socials={content.socialLinks} />
    </>
  );
}
