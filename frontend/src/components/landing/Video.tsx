"use client";

// Film section. When the CMS provides `instagramPosts`, the section renders a
// grid of the latest Instagram posts (official embeds). Otherwise it falls back
// to the single-film behaviour: youtubeId → youtube-nocookie iframe, an
// Instagram URL in videoUrl → one embed, any other videoUrl → native <video>,
// nothing → a 4s "coming soon" note. Keeps the hrast frosted play-button look.

import { useEffect, useRef, useState } from "react";
import type { VideoSectionContent } from "@/lib/api/content";
import type { VideoDict } from "@/lib/locale";
import Reveal from "./Reveal";
import WoodGrain from "./WoodGrain";

type Mode = "cover" | "youtube" | "video" | "instagram";

/** Builds the Instagram embed URL for a reel/post/tv link, else null. */
function instagramEmbedUrl(url: string): string | null {
  const m = url.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const type = m[1] === "reels" ? "reel" : m[1];
  return `https://www.instagram.com/${type}/${m[2]}/embed`;
}

function SectionHead({ section }: { section: VideoSectionContent }) {
  return (
    <Reveal className="wrap mb-[56px] text-center">
      <span className="caps">{section.label}</span>
      <h2 className="mt-[22px] font-serif text-[clamp(34px,4.4vw,62px)] font-normal leading-[1.08]">
        {section.title}
      </h2>
    </Reveal>
  );
}

export default function Video({
  section,
  t,
}: {
  section: VideoSectionContent;
  t: VideoDict;
}) {
  const posts = (section.instagramPosts ?? [])
    .map(instagramEmbedUrl)
    .filter((u): u is string => u !== null)
    .slice(0, 5);

  // --- Instagram feed grid -------------------------------------------------
  if (posts.length > 0) {
    return (
      <section
        id="film"
        className="border-t border-line py-[clamp(100px,12vw,170px)]"
      >
        <SectionHead section={section} />
        <div className="wrap">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {posts.map((src, i) => (
              <Reveal
                key={src}
                className="relative aspect-[9/16] overflow-hidden rounded-[18px] border border-line bg-white"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <iframe
                  src={src}
                  title={`Instagram ${i + 1}`}
                  loading="lazy"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- Single-film fallback ------------------------------------------------
  return <SingleFilm section={section} t={t} />;
}

function SingleFilm({
  section,
  t,
}: {
  section: VideoSectionContent;
  t: VideoDict;
}) {
  const [mode, setMode] = useState<Mode>("cover");
  const [note, setNote] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    },
    [],
  );

  const igEmbed = section.videoUrl ? instagramEmbedUrl(section.videoUrl) : null;
  const portrait = !section.youtubeId && !!igEmbed;

  const play = () => {
    if (section.youtubeId) {
      setMode("youtube");
    } else if (igEmbed) {
      setMode("instagram");
    } else if (section.videoUrl) {
      setMode("video");
    } else {
      setNote(true);
      if (noteTimer.current) clearTimeout(noteTimer.current);
      noteTimer.current = setTimeout(() => setNote(false), 4000);
    }
  };

  return (
    <section
      id="film"
      className="border-t border-line py-[clamp(100px,12vw,170px)]"
    >
      <SectionHead section={section} />
      <div className="wrap">
        <Reveal
          className={`relative overflow-hidden rounded-[24px] bg-[#1A140E] ${
            portrait
              ? "mx-auto aspect-[9/16] w-full max-w-[420px]"
              : "aspect-video"
          }`}
        >
          {mode === "cover" && (
            <button
              type="button"
              onClick={play}
              aria-label={t.play}
              className="group absolute inset-0 block cursor-pointer text-left"
            >
              {section.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote CMS host, dimensions fluid
                <img
                  src={section.coverImage.url}
                  alt={section.coverImage.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover brightness-[.55]"
                />
              ) : (
                <WoodGrain
                  pattern="g2"
                  grain="w2"
                  viewBox="0 0 1400 800"
                  className="absolute inset-[-8%] h-[116%] w-[116%] brightness-[.55]"
                />
              )}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#1A140E99)]"
              />
              <span className="absolute left-1/2 top-1/2 z-[3] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F7F4EF66] bg-[#F7F4EF14] backdrop-blur-[6px] [transition:transform_.6s_var(--ease),background-color_.4s,border-color_.4s] group-hover:scale-[1.12] group-hover:border-sand group-hover:bg-sand">
                <span
                  aria-hidden="true"
                  className="ml-[5px] block border-y-[13px] border-l-[22px] border-r-0 border-solid border-y-transparent border-l-[#F7F4EF]"
                />
              </span>
              <span className="absolute inset-x-0 bottom-[34px] z-[3] text-center text-[#F7F4EF]">
                <span className="block font-serif text-[clamp(20px,2.2vw,28px)] leading-[1.08]">
                  {section.captionTitle}
                </span>
                <span className="caps mt-[6px] block text-[#D8CDBC]">
                  {section.captionMeta}
                </span>
              </span>
            </button>
          )}

          {mode === "youtube" && section.youtubeId && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${section.youtubeId}?autoplay=1&rel=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={section.title}
              className="absolute inset-0 h-full w-full border-0"
            />
          )}

          {mode === "instagram" && igEmbed && (
            <iframe
              src={igEmbed}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              scrolling="no"
              title={section.title}
              className="absolute inset-0 h-full w-full border-0 bg-white"
            />
          )}

          {mode === "video" && section.videoUrl && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={section.videoUrl}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full"
            />
          )}

          {note && (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center p-[30px] text-center text-[#D8CDBC]"
            >
              <span className="font-serif text-[clamp(18px,2vw,24px)] leading-[1.4]">
                {t.noFilm}
              </span>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
