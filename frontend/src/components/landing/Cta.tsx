// "Begin with a conversation" CTA — hrast .cta-sec. The pill .btn (fill-from-
// below hover) leads to /configure per the brief (never mailto); the alt line
// keeps phone + address, followed by the large social icon row.
import Link from "next/link";
import type { ContactSection, SocialLinks } from "@/lib/api/content";
import EmText from "./EmText";
import Reveal from "./Reveal";
import SocialIcons from "./SocialIcons";

export default function Cta({
  contact,
  socials,
}: {
  contact: ContactSection;
  socials: SocialLinks;
}) {
  return (
    <section
      id="contact"
      className="border-t border-line py-[clamp(110px,14vw,200px)] text-center"
    >
      <Reveal className="wrap">
        <span className="caps">{contact.label}</span>
        <h2 className="mx-auto mt-[26px] max-w-[16ch] font-serif text-[clamp(38px,5.6vw,84px)] font-normal leading-[1.08]">
          <EmText text={contact.title} em={contact.em} />
        </h2>
        <p className="mx-auto mb-[44px] mt-[28px] max-w-[48ch] text-soft">
          {contact.text}
        </p>
        <Link href="/configure" className="btn">
          {contact.ctaText}
        </Link>
        <span className="mt-[26px] block text-[14.5px] text-soft">
          {contact.altText}{" "}
          <a
            href={`tel:${contact.phone}`}
            className="border-b border-line [transition:color_.4s,border-color_.4s] hover:border-sand hover:text-sand"
          >
            {contact.phoneDisplay}
          </a>
          {" · "}
          {contact.address}
        </span>
        <SocialIcons links={socials} size="lg" className="mt-[34px] justify-center" />
      </Reveal>
    </section>
  );
}
