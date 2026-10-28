"use client";

import { quiz } from "@/lib/quiz";

export default function Landing({ onStart }: { onStart: () => void }) {
  const { meta } = quiz;
  const [first, ...rest] = meta.quizName.split(" ");

  return (
    <div className="rise flex flex-1 flex-col justify-center py-10">
      <span className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-[9px] font-medium tracking-[0.09em] text-muted uppercase">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-amber" />
        {meta.disclaimer.split(".")[0]}
      </span>

      <h1 className="text-[2.75rem] leading-[0.95] font-semibold tracking-[-0.03em] text-balance">
        {first}{" "}
        <span className="block text-muted">
          {rest.slice(0, -1).join(" ")}{" "}
          <span className="text-amber">{rest.at(-1)}</span>
        </span>
      </h1>

      <p className="mt-6 max-w-[26rem] text-[1.0625rem] leading-relaxed text-muted text-pretty">
        {meta.tagline}
      </p>

      <div aria-hidden className="mt-10 flex gap-1.5">
        {Array.from({ length: quiz.questions.length }, (_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full bg-line"
            style={{ opacity: 1 - i * 0.14 }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-5 w-full rounded-2xl bg-amber px-6 py-4 text-[1.0625rem] font-semibold text-ink transition hover:brightness-110 active:scale-[0.985]"
      >
        {meta.startLabel}
      </button>

      <p className="mt-3 text-center text-xs text-muted">{meta.startFootnote}</p>
    </div>
  );
}
