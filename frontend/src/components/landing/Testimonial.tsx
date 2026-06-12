// Testimonial quote — hrast .tquote: italic serif quote, caps attribution.
import type { TestimonialSection } from "@/lib/api/content";
import Reveal from "./Reveal";

export default function Testimonial({
  testimonial,
}: {
  testimonial: TestimonialSection;
}) {
  return (
    <section className="border-t border-line py-[clamp(100px,12vw,170px)] text-center">
      <Reveal className="wrap">
        <figure>
          <blockquote>
            <p className="mx-auto max-w-[30ch] font-serif text-[clamp(24px,3.2vw,42px)] font-normal italic leading-[1.4]">
              {testimonial.quote}
            </p>
          </blockquote>
          <figcaption className="mt-[30px]">
            <span className="caps">{testimonial.who}</span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
