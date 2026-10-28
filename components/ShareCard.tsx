"use client";

import type { Ref } from "react";
import ScoreMeter from "./ScoreMeter";
import { fillTemplate, quiz } from "@/lib/quiz";
import type { Outcome } from "@/lib/quiz-types";

/**
 * This is the node that gets rasterised to a PNG, so it deliberately avoids the
 * things that break foreignObject rendering on iOS Safari: no backdrop-filter,
 * no CSS masks, no transforms on the exported node, no cross-origin images.
 */
export default function ShareCard({
  outcome,
  ref,
}: {
  outcome: Outcome;
  ref?: Ref<HTMLDivElement>;
}) {
  const { card, result } = quiz;
  const { primary, secondary, score, band } = outcome;

  return (
    <div
      ref={ref}
      className="relative mx-auto flex w-full max-w-[20rem] flex-col overflow-hidden rounded-[1.25rem] border border-line bg-panel px-6 py-7"
      style={{ aspectRatio: "9 / 16" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(58% 26% at 26% 30%, rgba(255,176,32,0.16), rgba(255,176,32,0) 70%)",
        }}
      />

      <div className="relative flex items-center gap-2">
        <span aria-hidden className="size-1.5 rounded-full bg-amber" />
        <span className="text-[9px] font-semibold tracking-[0.2em] text-muted uppercase">
          {card.eyebrow}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center">
        <p
          className="tnum font-mono text-[5rem] leading-[0.82] font-semibold tracking-[-0.05em] text-amber"
          style={{ textShadow: "0 0 36px rgba(255,176,32,0.35)" }}
        >
          {score}
        </p>
        <p className="mt-3 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
          {card.scoreCaption}
        </p>
        <p className="mt-1 text-[0.875rem] font-medium text-text">{band.label}</p>
        <div className="mt-5">
          <ScoreMeter score={score} />
        </div>
      </div>

      <div className="relative pt-5">
        <div
          aria-hidden
          className="mb-5 h-px w-full"
          style={{ backgroundImage: "linear-gradient(90deg, #2c3645, rgba(44,54,69,0))" }}
        />
        <p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted uppercase">
          {result.typeIntro}
        </p>
        <p className="mt-1.5 text-[1.5rem] leading-[1.1] font-semibold tracking-[-0.02em]">
          {primary.name}
        </p>
        <p className="mt-2.5 text-[0.8125rem] leading-snug text-muted text-pretty">
          {primary.blurb}
        </p>
        {secondary && (
          <p className="mt-3 text-[0.75rem] font-medium text-amber">
            {fillTemplate(result.secondaryTemplate, { secondary: secondary.shortName })}
          </p>
        )}
      </div>

      <p className="relative mt-6 text-[9px] tracking-[0.06em] text-muted/70">{card.footer}</p>
    </div>
  );
}
