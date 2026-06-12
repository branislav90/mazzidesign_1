// Social icon row — CMS-fed links, icons from design/hrast.html.
import type { SocialLinks } from "@/lib/api/content";

const ICONS: Record<keyof SocialLinks, { label: string; path: string }> = {
  instagram: {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 4.9a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-3.2a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z",
  },
  facebook: {
    label: "Facebook",
    path: "M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z",
  },
  youtube: {
    label: "YouTube",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z",
  },
  tiktok: {
    label: "TikTok",
    path: "M16.6 3c.3 1.6 1.3 3 2.8 3.8.6.3 1.3.5 2 .6v3.1c-1.7-.1-3.3-.6-4.7-1.6v6.8c0 3.4-2.8 6.2-6.2 6.2S4.3 19.1 4.3 15.7c0-3.4 2.8-6.2 6.2-6.2.3 0 .7 0 1 .1v3.2a3 3 0 0 0-1-.2 3.1 3.1 0 1 0 3.1 3.1V3h3Z",
  },
};

const ORDER: (keyof SocialLinks)[] = ["instagram", "facebook", "youtube", "tiktok"];

export default function SocialIcons({
  links,
  size = "lg",
  className,
}: {
  links: SocialLinks;
  size?: "lg" | "sm";
  className?: string;
}) {
  const entries = ORDER.filter((key) => links[key]);
  if (entries.length === 0) return null;

  const circle =
    size === "lg" ? "h-12 w-12" : "h-[38px] w-[38px]";
  const icon = size === "lg" ? "h-[18px] w-[18px]" : "h-[15px] w-[15px]";

  return (
    <div className={`flex gap-[14px] ${className ?? ""}`}>
      {entries.map((key) => (
        <a
          key={key}
          href={links[key]}
          aria-label={ICONS[key].label}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center rounded-full border border-line text-ink [transition:background-color_.4s,color_.4s,border-color_.4s,transform_.4s_var(--ease)] hover:-translate-y-[3px] hover:border-ink hover:bg-ink hover:text-white ${circle}`}
        >
          <svg viewBox="0 0 24 24" className={`fill-current ${icon}`} aria-hidden="true">
            <path d={ICONS[key].path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
