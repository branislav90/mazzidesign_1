// Ceremonial centered hero — hrast: caps label fade (.2s delay), two-line
// serif headline with line-by-line translateY(108%)→0 reveal (.15s stagger,
// overflow-hidden lines), em substring italic sand, sub fade (.7s delay).

import type { HeroSection } from "@/lib/api/content";
import EmText from "./EmText";

export default function Hero({ hero }: { hero: HeroSection }) {
  return (
    <header id="top" className="pt-[170px] text-center">
      <div className="wrap">
        <span
          className="caps anim-fade mb-[30px] block"
          style={{ animationDelay: "0.2s" }}
        >
          {hero.label}
        </span>
        <h1 className="mx-auto max-w-[18ch] font-serif text-[clamp(44px,6.6vw,104px)] font-normal leading-[1.08] tracking-[.01em]">
          {hero.titleLines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span
                className="anim-up block"
                style={i > 0 ? { animationDelay: `${i * 0.15}s` } : undefined}
              >
                <EmText text={line.text} em={line.em} />
              </span>
            </span>
          ))}
        </h1>
        <p
          className="anim-fade mx-auto mt-[34px] max-w-[52ch] text-[17px] text-soft"
          style={{ animationDelay: "0.7s" }}
        >
          {hero.sub}
        </p>
      </div>
    </header>
  );
}
