"use client";

import { useEffect, useRef, useState } from "react";
import HowItWorks from "./HowItWorks";
import ScoreMeter from "./ScoreMeter";
import ShareCard from "./ShareCard";
import { fillTemplate, quiz } from "@/lib/quiz";
import type { Outcome } from "@/lib/quiz-types";

type SaveState = "idle" | "saving" | "error";

function useCountUp(target: number) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 750;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export default function ResultScreen({
  outcome,
  lastQuestionIndex,
  onRestart,
}: {
  outcome: Outcome;
  lastQuestionIndex: number;
  onRestart: () => void;
}) {
  const { result, meta } = quiz;
  const { primary, secondary, band } = outcome;
  const shown = useCountUp(outcome.score);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [panelOpen, setPanelOpen] = useState(false);

  async function saveCard() {
    const node = cardRef.current;
    if (!node || saveState === "saving") return;
    setSaveState("saving");

    try {
      const { toPng } = await import("html-to-image");
      if (document.fonts?.ready) await document.fonts.ready;

      const width = node.offsetWidth || 320;
      const options = {
        pixelRatio: Math.min(4, Math.max(2, 1080 / width)),
        backgroundColor: "#07090c",
        cacheBust: true,
      };

      // Safari can miss the embedded fonts on the first pass, so the first
      // render is a warm-up and the second one is the file.
      await toPng(node, options);
      const dataUrl = await toPng(node, options);
      const filename = `sports-parent-iq-${outcome.score}.png`;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (error) {
          // Cancelling the share sheet is not a failure.
          if ((error as Error)?.name !== "AbortError") throw error;
        }
      } else {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }

      setSaveState("idle");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="rise flex flex-1 flex-col">
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-amber" />
        {band.label}
      </p>

      <div className="mt-6 flex items-end gap-4">
        <p
          className="tnum font-mono text-[5.5rem] leading-[0.8] font-semibold tracking-[-0.055em] text-amber"
          style={{ textShadow: "0 0 44px rgba(255,176,32,0.3)" }}
        >
          {shown}
        </p>
        <p className="pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          {result.scoreCaption}
          <span className="mt-1 block font-sans text-[11px] tracking-normal normal-case">
            {fillTemplate(result.scoreOutOfTemplate, { max: quiz.scoring.maxScore })}
          </span>
        </p>
      </div>

      <div className="mt-6">
        <ScoreMeter score={outcome.score} />
      </div>

      <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted text-pretty">{band.line}</p>

      <div aria-hidden className="mt-8 h-px w-full bg-line" />

      <p className="mt-8 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        {result.typeIntro}
      </p>
      <h1 className="mt-2 text-[2rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
        {primary.name}
      </h1>
      <p className="mt-3 text-[1rem] leading-relaxed text-pretty">{primary.blurb}</p>
      {secondary && (
        <p className="mt-3 text-[0.875rem] font-medium text-amber">
          {fillTemplate(result.secondaryTemplate, { secondary: secondary.shortName })}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {primary.feedback.map((line) => (
          <p key={line} className="text-[0.9375rem] leading-relaxed text-muted text-pretty">
            {line}
          </p>
        ))}
      </div>

      <dl className="mt-7 flex flex-col gap-2.5">
        <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
          <dt className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-good uppercase">
            <span aria-hidden className="grid size-4 place-items-center rounded-full bg-good/15 text-[10px] leading-none">
              +
            </span>
            {result.strengthLabel}
          </dt>
          <dd className="mt-2 text-[0.9375rem] leading-snug text-pretty">{primary.strength}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
          <dt className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-bad uppercase">
            <span aria-hidden className="grid size-4 place-items-center rounded-full bg-bad/15 text-[10px] leading-none">
              !
            </span>
            {result.watchOutLabel}
          </dt>
          <dd className="mt-2 text-[0.9375rem] leading-snug text-pretty">{primary.watchOut}</dd>
        </div>
      </dl>

      <p className="mt-10 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        {result.shareHeading}
      </p>
      <div className="mt-4">
        <ShareCard ref={cardRef} outcome={outcome} />
      </div>

      <button
        type="button"
        onClick={saveCard}
        disabled={saveState === "saving"}
        className="mt-5 w-full rounded-2xl bg-amber px-6 py-4 text-[1.0625rem] font-semibold text-ink transition hover:brightness-110 active:scale-[0.985] disabled:opacity-60 disabled:hover:brightness-100"
      >
        {saveState === "saving" ? result.shareSavingLabel : result.shareButtonLabel}
      </button>
      <p aria-live="polite" className="min-h-4 pt-2 text-center text-xs text-bad">
        {saveState === "error" ? result.shareErrorLabel : ""}
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-2xl border border-line bg-panel px-6 py-3.5 text-[0.9375rem] font-medium transition hover:bg-raise active:scale-[0.985]"
        >
          {result.restartLabel}
        </button>
        <a
          href={meta.ksnnLinkUrl}
          className="w-full rounded-2xl border border-line bg-panel px-6 py-3.5 text-center text-[0.9375rem] font-medium text-muted transition hover:bg-raise"
        >
          {meta.ksnnLinkLabel}
        </a>
      </div>

      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="mx-auto mt-7 text-[0.8125rem] text-muted underline decoration-line underline-offset-4 transition hover:text-text"
      >
        {result.howItWorksLabel}
      </button>

      {panelOpen && (
        <HowItWorks questionIndex={lastQuestionIndex} onClose={() => setPanelOpen(false)} />
      )}
    </div>
  );
}
