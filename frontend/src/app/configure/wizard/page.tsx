import { cookies } from "next/headers";
import Wizard from "@/components/configurator/Wizard";
import type { Locale } from "@/lib/configurator/i18n";

export default function ConfigurePage() {
  const cookie = cookies().get("locale")?.value;
  const locale: Locale = cookie === "en" ? "en" : "sl";
  return <Wizard locale={locale} />;
}
