"use client";

// Full-screen guided enquiry wizard (no site nav): desktop left = choices,
// right = live 3D viewport; mobile = sticky 3D on top. Progress bar with
// jump-back to completed steps; every step writes straight into the store.

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getItem } from "@/lib/catalog";
import {
  isStepReachable,
  useConfigurator,
  visibleSteps,
  type StepId,
} from "@/lib/configurator/store";
import { CONFIGURATOR_DICT, type Locale } from "@/lib/configurator/i18n";
import { StepCategory } from "./steps/StepCategory";
import { StepItem } from "./steps/StepItem";
import { StepShape } from "./steps/StepShape";
import { StepDimensions } from "./steps/StepDimensions";
import { StepMaterial } from "./steps/StepMaterial";
import { StepReview } from "./steps/StepReview";

const ConfiguratorCanvas = dynamic(
  () => import("@/components/configurator/three/ConfiguratorCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#F1ECE3]">
        <span className="caps animate-pulse">···</span>
      </div>
    ),
  },
);

export default function Wizard({ locale }: { locale: Locale }) {
  const dict = CONFIGURATOR_DICT[locale];
  const step = useConfigurator((s) => s.step);
  const category = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const maxStepIndex = useConfigurator((s) => s.maxStepIndex);
  const goToStep = useConfigurator((s) => s.goToStep);
  const setLocale = useConfigurator((s) => s.setLocale);

  useEffect(() => setLocale(locale), [locale, setLocale]);

  const steps = visibleSteps({ category, itemType });
  const stepIndex = steps.indexOf(step);
  const current = stepIndex === -1 ? 0 : stepIndex;

  const canProceed =
    step === "category" ? category !== null : step === "item" ? itemType !== null : true;

  const next = () => {
    const target = steps[current + 1];
    if (target) goToStep(target);
  };
  const back = () => {
    const target = steps[current - 1];
    if (target) goToStep(target);
  };

  const reachable = (s: StepId) =>
    isStepReachable({ category, itemType, maxStepIndex }, s);

  const stepBody: Record<StepId, React.ReactNode> = {
    category: <StepCategory locale={locale} onAdvance={() => goToStep("item")} />,
    item: (
      <StepItem
        locale={locale}
        onAdvance={() => {
          // read fresh state — setItemType has just run inside the same click
          const s = useConfigurator.getState();
          goToStep(nextAfterItem(s.category, s.itemType));
        }}
      />
    ),
    shape: <StepShape locale={locale} />,
    dimensions: <StepDimensions locale={locale} />,
    material: <StepMaterial locale={locale} />,
    review: <StepReview locale={locale} />,
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-ink lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* 3D viewport — sticky on top (mobile), right column (desktop) */}
      <div className="sticky top-0 z-20 h-[38dvh] w-full shrink-0 border-b border-line bg-[#F1ECE3] lg:static lg:order-2 lg:h-full lg:flex-1 lg:border-b-0">
        <ConfiguratorCanvas />
      </div>

      {/* choices column */}
      <div className="flex flex-1 flex-col lg:order-1 lg:w-[540px] lg:flex-none lg:overflow-y-auto lg:border-r lg:border-line">
        <header className="flex items-center justify-between px-6 pb-2 pt-5 lg:px-10 lg:pt-8">
          <span className="font-serif text-[15px] uppercase tracking-brand">
            {dict.brand}
          </span>
          <Link
            href="/"
            aria-label={dict.closeAria}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg leading-none text-soft transition-colors hover:border-ink hover:text-ink"
          >
            ×
          </Link>
        </header>

        {/* progress */}
        <nav aria-label={dict.progressAria} className="px-6 pt-4 lg:px-10">
          <p className="caps">{dict.stepOf(current + 1, steps.length)}</p>
          <ol className="mt-3 flex gap-1.5">
            {steps.map((s, i) => {
              const isCurrent = i === current;
              const done = i < current;
              const canJump = reachable(s) && i !== current;
              return (
                <li key={s} className="flex-1">
                  <button
                    type="button"
                    disabled={!canJump}
                    onClick={() => canJump && goToStep(s)}
                    aria-label={dict.steps[s].title}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`block h-[3px] w-full rounded-full transition-colors duration-500 ease-hrast ${
                      isCurrent || done ? "bg-ink" : "bg-line"
                    } ${canJump ? "cursor-pointer hover:bg-sand" : "cursor-default"}`}
                  />
                </li>
              );
            })}
          </ol>
        </nav>

        {/* step title + why */}
        <div className="px-6 pt-7 lg:px-10">
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] leading-tight">
            {dict.steps[step].title}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-soft">
            {dict.steps[step].why}
          </p>
        </div>

        {/* step content */}
        <div className="flex-1 px-6 py-7 lg:px-10">{stepBody[step]}</div>

        {/* footer nav */}
        {step !== "review" && (
          <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-5 lg:px-10">
            {current > 0 ? (
              <button
                type="button"
                onClick={back}
                className="caps transition-colors hover:text-ink"
              >
                ← {dict.nav.back}
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canProceed}
              className="btn disabled:pointer-events-none disabled:opacity-30"
            >
              {dict.nav.next}
            </button>
          </div>
        )}
        {step === "review" && current > 0 && (
          <div className="border-t border-line px-6 py-5 lg:px-10">
            <button
              type="button"
              onClick={back}
              className="caps transition-colors hover:text-ink"
            >
              ← {dict.nav.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** After picking an item: go to shape if the item has shapes, else dimensions. */
function nextAfterItem(category: string | null, itemType: string | null): StepId {
  const item = getItem(category, itemType);
  return item && item.shapes.length > 0 ? "shape" : "dimensions";
}
