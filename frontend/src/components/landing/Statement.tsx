// Quiet centered statement — hrast .statement (no marquees, per the brief).
import type { StatementSection } from "@/lib/api/content";
import EmText from "./EmText";
import Reveal from "./Reveal";

export default function Statement({
  statement,
}: {
  statement: StatementSection;
}) {
  return (
    <section className="py-[clamp(110px,13vw,190px)] text-center">
      <Reveal className="wrap">
        <span className="caps">{statement.label}</span>
        <p className="mx-auto mt-[26px] max-w-[26ch] font-serif text-[clamp(26px,3.4vw,46px)] leading-[1.3]">
          <EmText text={statement.text} em={statement.em} />
        </p>
      </Reveal>
    </section>
  );
}
