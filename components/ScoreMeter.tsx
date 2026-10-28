import { quiz } from "@/lib/quiz";

/** The 0 to max scale, drawn like a scoreboard track. */
export default function ScoreMeter({ score, compact = false }: { score: number; compact?: boolean }) {
  const { minScore, maxScore } = quiz.scoring;
  const pct = Math.min(100, Math.max(0, ((score - minScore) / (maxScore - minScore)) * 100));

  return (
    <div className={compact ? "" : "w-full"}>
      <div className="relative h-1 w-full rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber"
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.08em] text-muted">
        <span>{minScore}</span>
        <span>{maxScore}</span>
      </div>
    </div>
  );
}
