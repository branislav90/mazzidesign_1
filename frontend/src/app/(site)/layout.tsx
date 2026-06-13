// Public site chrome: fixed hrast nav (with SL/EN toggle) + footer, plus the
// on-page design switcher. Locale and design both come from cookies (sl /
// stack defaults) so the server renders the visitor's last choice without flash.
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { DesignProvider } from "@/components/landing/DesignContext";
import DesignSwitcher from "@/components/landing/DesignSwitcher";
import { getPageContent } from "@/lib/api/content";
import { getDesign, getLocale, UI } from "@/lib/locale";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocale();
  const design = getDesign();
  const t = UI[locale];
  const content = await getPageContent(locale);

  return (
    <DesignProvider initial={design}>
      <Nav locale={locale} t={t.nav} />
      {children}
      <Footer line={t.footer.line} socials={content.socialLinks} />
      <DesignSwitcher t={t.design} />
    </DesignProvider>
  );
}
