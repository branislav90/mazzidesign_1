import { cookies } from "next/headers";
import PlainEnquiryForm from "@/components/configurator/PlainEnquiryForm";
import type { Locale } from "@/lib/configurator/i18n";

export default function PlainEnquiryPage() {
  const cookie = cookies().get("locale")?.value;
  const locale: Locale = cookie === "en" ? "en" : "sl";
  return <PlainEnquiryForm locale={locale} />;
}
