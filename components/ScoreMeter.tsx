import { quiz } from "@/lib/quiz";

/**
 * The scale, drawn like a dial rather than a total out of which you scored.
 * The tick at the average is what stops a score just over 100 reading as mediocre.
 */
export default function ScoreMeter({ score }: { score: number }) {
  const { minScore, maxScore, averageScore } = quiz.scoring;
  const place = (value: number) =>
    Math.min(100, Math.max(0, ((value - minScore) / (maxScore - minScore)) * 100));

  const pct = place(score);
  const averagePct = place(averageScore);

  return (
    <div className="w-full">
      <div className="relative h-1 w-full rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber"
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden
          className="absolute -top-1 h-3 w-px bg-muted/60"
          style={{ left: `${averagePct}%` }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="relative mt-2 h-3">
        <span
          className="absolute -translate-x-1/2 font-mono text-[9px] tracking-[0.08em] text-muted"
          style={{ left: `${averagePct}%` }}
        >
          {quiz.result.averageLabel}
        </span>
      </div>
    </div>
  );
}
