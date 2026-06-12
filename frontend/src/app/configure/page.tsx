// Enquiry entry: choose between the visual 3D configurator and a simple
// free-text enquiry with photos. Every "Enquire" CTA on the site lands here.
import Link from "next/link";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/configurator/i18n";

const DICT = {
  sl: {
    label: "Povpraševanje",
    title: "Kako želite začeti?",
    back: "← Nazaj na stran",
    wizard: {
      title: "3D konfigurator",
      text: "Sestavite svoj kos korak za korakom: kategorija, oblika, mere in les — s 3D predogledom v živo. Delavnica prejme natančne podatke za ponudbo.",
      cta: "Začni sestavljati",
    },
    plain: {
      title: "Preprosto povpraševanje",
      text: "Z nekaj stavki opišite, kaj potrebujete, in po želji priložite do tri fotografije prostora ali skice. Odgovorimo v enem delovnem dnevu.",
      cta: "Napiši povpraševanje",
    },
  },
  en: {
    label: "Enquiry",
    title: "How would you like to begin?",
    back: "← Back to the site",
    wizard: {
      title: "3D configurator",
      text: "Compose your piece step by step: category, shape, dimensions and timber — with a live 3D preview. The workshop receives precise data for a quote.",
      cta: "Start configuring",
    },
    plain: {
      title: "Simple enquiry",
      text: "Describe what you need in a few sentences and optionally attach up to three photos of your space or sketches. We reply within one working day.",
      cta: "Write an enquiry",
    },
  },
} as const;

export default function ConfigureChooserPage() {
  const cookie = cookies().get("locale")?.value;
  const locale: Locale = cookie === "en" ? "en" : "sl";
  const t = DICT[locale];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <p className="caps anim-fade">{t.label}</p>
      <h1 className="mt-6 text-center font-serif text-[clamp(34px,5vw,64px)] font-normal leading-[1.08]">
        {t.title}
      </h1>

      <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        {(
          [
            { href: "/configure/wizard", card: t.wizard },
            { href: "/configure/enquiry", card: t.plain },
          ] as const
        ).map(({ href, card }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-[20px] border border-line bg-white/40 p-8 transition-colors duration-500 ease-hrast hover:border-ink"
          >
            <span className="font-serif text-[26px] leading-[1.15]">
              {card.title}
            </span>
            <span className="mt-4 flex-1 text-[15px] leading-relaxed text-soft">
              {card.text}
            </span>
            <span className="mt-8 inline-block self-start border-b border-ink pb-1 text-[12px] uppercase tracking-label transition-colors duration-300 group-hover:border-sand group-hover:text-sand">
              {card.cta}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="caps mt-12 transition-colors duration-300 hover:text-ink"
      >
        {t.back}
      </Link>
    </main>
  );
}
