import rawQuiz from "@/data/quiz.json";
import { validateQuiz } from "./quiz-schema";
import type { Band, Outcome, Personality, Quiz, QuizOption } from "./quiz-types";

export const quiz: Quiz = validateQuiz(rawQuiz);

const byId = new Map<string, Personality>(quiz.personalities.map((p) => [p.id, p]));

export function personality(id: string): Personality {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown personality id: ${id}`);
  return found;
}

export function optionById(questionIndex: number, optionId: string): QuizOption | undefined {
  return quiz.questions[questionIndex]?.options.find((o) => o.id === optionId);
}

function bandFor(score: number): Band {
  const bands = quiz.scoring.bands;
  let match = bands[0];
  for (const band of bands) {
    if (score >= band.minScore) match = band;
  }
  return match;
}

/**
 * answers[i] is the chosen option id for questions[i], or null if unanswered.
 *
 * Every number used here comes out of data/quiz.json. Changing a weight, a point
 * value or the base score changes the result without changing this function.
 */
export function scoreAnswers(answers: Array<string | null>): Outcome {
  const { baseScore, positivePointValue, negativePointValue, minScore, maxScore, tieBreakOrder } =
    quiz.scoring;

  const totals: Record<string, number> = {};
  for (const p of quiz.personalities) totals[p.id] = 0;

  let positiveWeight = 0;
  let negativeWeight = 0;

  answers.forEach((optionId, index) => {
    if (!optionId) return;
    const option = optionById(index, optionId);
    if (!option) return;

    for (const [id, weight] of Object.entries(option.weights)) {
      const target = byId.get(id);
      if (!target) continue;
      totals[id] += weight;
      if (target.polarity === "positive") positiveWeight += weight;
      else negativeWeight += weight;
    }
  });

  const rawScore =
    baseScore + positiveWeight * positivePointValue + negativeWeight * negativePointValue;
  const score = Math.min(maxScore, Math.max(minScore, Math.round(rawScore)));

  const tieRank = (id: string) => {
    const index = tieBreakOrder.indexOf(id);
    return index === -1 ? tieBreakOrder.length : index;
  };

  const ranked = [...quiz.personalities].sort((a, b) => {
    const diff = totals[b.id] - totals[a.id];
    return diff !== 0 ? diff : tieRank(a.id) - tieRank(b.id);
  });

  const primary = ranked[0];
  const runnerUp = ranked.find((p) => p.id !== primary.id && totals[p.id] > 0) ?? null;

  return { score, band: bandFor(score), primary, secondary: runnerUp, totals, positiveWeight, negativeWeight };
}

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{{${key}}}`,
  );
}
