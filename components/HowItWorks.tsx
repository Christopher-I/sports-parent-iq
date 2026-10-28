"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { quiz } from "@/lib/quiz";

export default function HowItWorks({
  questionIndex,
  onClose,
}: {
  questionIndex: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const question = quiz.questions[questionIndex];
  const { result } = quiz;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Rendered into <body> so no transformed ancestor can capture the fixed overlay.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={result.howItWorksCloseLabel}
        onClick={onClose}
        className="absolute inset-0 bg-ink/80"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={result.howItWorksLabel}
        className="rise relative flex max-h-[86dvh] w-full max-w-[32rem] flex-col rounded-t-3xl border border-line bg-panel sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <h2 className="text-base font-semibold">{result.howItWorksLabel}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-lg px-2 py-1 text-xs text-muted transition hover:text-text"
          >
            {result.howItWorksCloseLabel}
          </button>
        </div>

        <p className="px-5 pt-3 text-[0.8125rem] leading-relaxed text-muted text-pretty">
          {result.howItWorksBody}
        </p>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <p className="mb-2 font-mono text-[10px] tracking-[0.06em] text-muted">
            data/quiz.json → questions[{questionIndex}]
          </p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-ink p-3.5 font-mono text-[10.5px] leading-relaxed break-words whitespace-pre-wrap text-muted">
            {JSON.stringify(question, null, 2)}
          </pre>

          <p className="mt-5 mb-2 font-mono text-[10px] tracking-[0.06em] text-muted">
            data/quiz.json → scoring
          </p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-ink p-3.5 font-mono text-[10.5px] leading-relaxed break-words whitespace-pre-wrap text-muted">
            {JSON.stringify(
              {
                baseScore: quiz.scoring.baseScore,
                positivePointValue: quiz.scoring.positivePointValue,
                negativePointValue: quiz.scoring.negativePointValue,
                minScore: quiz.scoring.minScore,
                maxScore: quiz.scoring.maxScore,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>,
    document.body,
  );
}
