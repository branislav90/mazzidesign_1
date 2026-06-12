import Link from "next/link";
import { cookies } from "next/headers";
import { CONFIGURATOR_DICT, type Locale } from "@/lib/configurator/i18n";
import { NewEnquiryLink } from "@/components/configurator/NewEnquiryLink";

export default function ConfigureSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const cookie = cookies().get("locale")?.value;
  const locale: Locale = cookie === "en" ? "en" : "sl";
  const dict = CONFIGURATOR_DICT[locale].success;
  const reference = searchParams.ref ?? "";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-6 text-ink">
      <div className="w-full max-w-md text-center">
        <p className="caps">{dict.reference}</p>
        <p className="mt-3 font-serif text-[clamp(30px,6vw,44px)] tracking-wide">
          {reference || "—"}
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-line" aria-hidden="true" />
        <h1 className="mt-8 font-serif text-2xl leading-snug">{dict.title}</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-soft">{dict.line}</p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link href="/" className="btn">
            {dict.backHome}
          </Link>
          <NewEnquiryLink label={dict.newEnquiry} />
        </div>
      </div>
    </main>
  );
}
