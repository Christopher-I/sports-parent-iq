import type { Quiz } from "./quiz-types";

/**
 * data/quiz.json is meant to be edited by hand, by someone who is not a developer.
 * So it gets checked on load and fails with a sentence a human can act on, rather
 * than rendering a half-broken quiz.
 */
export class QuizDataError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`data/quiz.json has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    this.name = "QuizDataError";
    this.problems = problems;
  }
}

type Bag = Record<string, unknown>;

const isBag = (v: unknown): v is Bag => typeof v === "object" && v !== null && !Array.isArray(v);

export function validateQuiz(raw: unknown): Quiz {
  const problems: string[] = [];

  const text = (bag: Bag, path: string, key: string) => {
    const value = bag[key];
    if (typeof value !== "string" || value.trim() === "") {
      problems.push(`${path}.${key} must be a non-empty string`);
    }
  };

  const num = (bag: Bag, path: string, key: string) => {
    if (typeof bag[key] !== "number" || Number.isNaN(bag[key])) {
      problems.push(`${path}.${key} must be a number`);
    }
  };

  if (!isBag(raw)) {
    throw new QuizDataError(["the file must contain a JSON object"]);
  }

  // --- meta, result and card copy -------------------------------------------
  const copyBlocks: Array<[string, string[]]> = [
    [
      "meta",
      [
        "quizName",
        "tagline",
        "startLabel",
        "startFootnote",
        "disclaimer",
        "badge",
        "footer",
        "progressTemplate",
        "backLabel",
        "ksnnLinkLabel",
      ],
    ],
    [
      "result",
      [
        "scoreLabel",
        "scoreCaption",
        "averageLabel",
        "typeIntro",
        "secondaryTemplate",
        "strengthLabel",
        "watchOutLabel",
        "shareHeading",
        "shareButtonLabel",
        "shareSavingLabel",
        "shareErrorLabel",
        "restartLabel",
        "howItWorksLabel",
        "howItWorksBody",
        "howItWorksCloseLabel",
      ],
    ],
    ["card", ["eyebrow", "scoreCaption", "footer"]],
  ];

  for (const [block, keys] of copyBlocks) {
    const bag = raw[block];
    if (!isBag(bag)) {
      problems.push(`"${block}" is missing or is not an object`);
      continue;
    }
    for (const key of keys) text(bag, block, key);
  }

  // --- personalities --------------------------------------------------------
  const ids = new Set<string>();
  const personalities = raw.personalities;

  if (!Array.isArray(personalities) || personalities.length === 0) {
    problems.push(`"personalities" must be a non-empty array`);
  } else {
    personalities.forEach((entry, i) => {
      const path = `personalities[${i}]`;
      if (!isBag(entry)) {
        problems.push(`${path} must be an object`);
        return;
      }
      for (const key of ["id", "name", "shortName", "blurb", "strength", "watchOut"]) {
        text(entry, path, key);
      }
      if (entry.polarity !== "positive" && entry.polarity !== "negative") {
        problems.push(`${path}.polarity must be "positive" or "negative"`);
      }
      if (
        !Array.isArray(entry.feedback) ||
        entry.feedback.length === 0 ||
        entry.feedback.some((line) => typeof line !== "string" || line.trim() === "")
      ) {
        problems.push(`${path}.feedback must be an array of one or more non-empty strings`);
      }
      if (typeof entry.id === "string") {
        if (ids.has(entry.id)) problems.push(`${path}.id "${entry.id}" is used more than once`);
        ids.add(entry.id);
      }
    });
  }

  // --- questions ------------------------------------------------------------
  const questions = raw.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    problems.push(`"questions" must be a non-empty array`);
  } else {
    questions.forEach((question, qi) => {
      const path = `questions[${qi}]`;
      if (!isBag(question)) {
        problems.push(`${path} must be an object`);
        return;
      }
      text(question, path, "id");
      text(question, path, "text");

      if (!Array.isArray(question.options) || question.options.length < 2) {
        problems.push(`${path}.options must be an array of at least two options`);
        return;
      }

      question.options.forEach((option, oi) => {
        const optionPath = `${path}.options[${oi}]`;
        if (!isBag(option)) {
          problems.push(`${optionPath} must be an object`);
          return;
        }
        text(option, optionPath, "id");
        text(option, optionPath, "text");

        if (!isBag(option.weights) || Object.keys(option.weights).length === 0) {
          problems.push(`${optionPath}.weights must be an object of personality id to number`);
          return;
        }
        for (const [key, value] of Object.entries(option.weights)) {
          if (!ids.has(key)) {
            problems.push(`${optionPath}.weights has "${key}", which is not a personality id`);
          }
          if (typeof value !== "number" || Number.isNaN(value)) {
            problems.push(`${optionPath}.weights.${key} must be a number`);
          }
        }
      });
    });
  }

  // --- scoring --------------------------------------------------------------
  const scoring = raw.scoring;

  if (!isBag(scoring)) {
    problems.push(`"scoring" is missing or is not an object`);
  } else {
    for (const key of [
      "baseScore",
      "averageScore",
      "positivePointValue",
      "negativePointValue",
      "minScore",
      "maxScore",
    ]) {
      num(scoring, "scoring", key);
    }
    if (
      typeof scoring.minScore === "number" &&
      typeof scoring.maxScore === "number" &&
      scoring.minScore >= scoring.maxScore
    ) {
      problems.push(`scoring.minScore must be lower than scoring.maxScore`);
    }

    if (!Array.isArray(scoring.tieBreakOrder)) {
      problems.push(`scoring.tieBreakOrder must be an array of personality ids`);
    } else {
      for (const id of scoring.tieBreakOrder) {
        if (typeof id !== "string" || !ids.has(id)) {
          problems.push(`scoring.tieBreakOrder has "${String(id)}", which is not a personality id`);
        }
      }
      for (const id of ids) {
        if (!scoring.tieBreakOrder.includes(id)) {
          problems.push(`scoring.tieBreakOrder is missing the personality "${id}"`);
        }
      }
    }

    if (!Array.isArray(scoring.bands) || scoring.bands.length === 0) {
      problems.push(`scoring.bands must be a non-empty array`);
    } else {
      let previous = Number.NEGATIVE_INFINITY;
      scoring.bands.forEach((band, i) => {
        const path = `scoring.bands[${i}]`;
        if (!isBag(band)) {
          problems.push(`${path} must be an object`);
          return;
        }
        num(band, path, "minScore");
        text(band, path, "label");
        text(band, path, "line");
        if (typeof band.minScore === "number") {
          if (band.minScore <= previous) {
            problems.push(`${path}.minScore must be higher than the band before it`);
          }
          previous = band.minScore;
        }
      });
      const first = scoring.bands[0];
      if (
        isBag(first) &&
        typeof first.minScore === "number" &&
        typeof scoring.minScore === "number" &&
        first.minScore > scoring.minScore
      ) {
        problems.push(
          `scoring.bands[0].minScore must be ${scoring.minScore} or lower, or some scores land in no band`,
        );
      }
    }
  }

  const meta = raw.meta;
  if (isBag(meta) && typeof meta.ksnnLinkUrl !== "string") {
    problems.push(`meta.ksnnLinkUrl must be a string (empty means "no link yet")`);
  }

  if (typeof raw.version !== "string") problems.push(`"version" must be a string`);

  if (problems.length > 0) throw new QuizDataError(problems);

  return raw as unknown as Quiz;
}
