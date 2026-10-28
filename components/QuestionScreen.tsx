"use client";

import { useEffect, useRef, useState } from "react";
import { fillTemplate, quiz } from "@/lib/quiz";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionScreen({
  index,
  chosen,
  onAnswer,
  onBack,
}: {
  index: number;
  chosen: string | null;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
}) {
  const question = quiz.questions[index];
  const total = quiz.questions.length;
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new question means the previous selection flash is void.
  useEffect(() => {
    setPicked(null);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index]);

  function choose(optionId: string) {
    if (picked) return;
    setPicked(optionId);
    timer.current = setTimeout(() => onAnswer(optionId), 170);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          {fillTemplate(quiz.meta.progressTemplate, { current: index + 1, total })}
        </p>
        {index > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="-mr-2 rounded-lg px-2 py-1 text-xs text-muted transition hover:text-text"
          >
            {quiz.meta.backLabel}
          </button>
        )}
      </div>

      <div aria-hidden className="mt-3 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < index ? "bg-amber/45" : i === index ? "bg-amber" : "bg-line"
            }`}
          />
        ))}
      </div>

      <h2
        key={question.id}
        className="rise mt-9 text-[1.5rem] leading-[1.25] font-semibold tracking-[-0.02em] text-balance"
      >
        {question.text}
      </h2>

      <ul key={`${question.id}-options`} className="rise mt-7 flex flex-col gap-2.5">
        {question.options.map((option, i) => {
          const isPicked = picked === option.id;
          const wasChosen = !picked && chosen === option.id;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => choose(option.id)}
                aria-pressed={wasChosen}
                className={`flex w-full items-start gap-3.5 rounded-2xl border px-4 py-4 text-left transition duration-150 active:scale-[0.99] ${
                  isPicked
                    ? "border-amber bg-amber/12"
                    : wasChosen
                      ? "border-line bg-raise"
                      : "border-line bg-panel hover:border-muted/50 hover:bg-raise"
                }`}
              >
                <span
                  className={`mt-px grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold transition-colors ${
                    isPicked ? "bg-amber text-ink" : "bg-raise text-muted"
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-[0.9375rem] leading-snug text-pretty">{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
