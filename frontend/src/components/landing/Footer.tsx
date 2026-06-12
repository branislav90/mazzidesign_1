import type { SocialLinks } from "@/lib/api/content";
import SocialIcons from "./SocialIcons";

export default function Footer({
  line,
  socials,
}: {
  line: string;
  socials: SocialLinks;
}) {
  return (
    <footer className="border-t border-line py-9 text-[13px] text-soft">
      <div className="wrap flex flex-wrap items-center justify-between gap-[14px]">
        <span className="font-serif text-[15px] uppercase leading-[1.08] tracking-brand text-ink">
          Hrast
        </span>
        <span>{line}</span>
        <SocialIcons links={socials} size="sm" className="justify-end" />
      </div>
    </footer>
  );
}
