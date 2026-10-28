export type Polarity = "positive" | "negative";

export interface Personality {
  id: string;
  name: string;
  shortName: string;
  polarity: Polarity;
  blurb: string;
  strength: string;
  watchOut: string;
  feedback: string[];
}

export interface QuizOption {
  id: string;
  text: string;
  weights: Record<string, number>;
}

export interface Question {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface Band {
  minScore: number;
  label: string;
  line: string;
}

export interface Scoring {
  baseScore: number;
  averageScore: number;
  positivePointValue: number;
  negativePointValue: number;
  minScore: number;
  maxScore: number;
  tieBreakOrder: string[];
  bands: Band[];
}

export interface QuizMeta {
  quizName: string;
  tagline: string;
  startLabel: string;
  startFootnote: string;
  disclaimer: string;
  badge: string;
  footer: string;
  progressTemplate: string;
  backLabel: string;
  ksnnLinkLabel: string;
  ksnnLinkUrl: string;
}

export interface ResultCopy {
  scoreLabel: string;
  scoreCaption: string;
  averageLabel: string;
  typeIntro: string;
  secondaryTemplate: string;
  strengthLabel: string;
  watchOutLabel: string;
  shareHeading: string;
  shareButtonLabel: string;
  shareSavingLabel: string;
  shareErrorLabel: string;
  restartLabel: string;
  howItWorksLabel: string;
  howItWorksBody: string;
  howItWorksCloseLabel: string;
}

export interface CardCopy {
  eyebrow: string;
  scoreCaption: string;
  footer: string;
}

export interface Quiz {
  version: string;
  meta: QuizMeta;
  personalities: Personality[];
  questions: Question[];
  scoring: Scoring;
  result: ResultCopy;
  card: CardCopy;
}

export interface Outcome {
  score: number;
  band: Band;
  primary: Personality;
  secondary: Personality | null;
  totals: Record<string, number>;
  positiveWeight: number;
  negativeWeight: number;
}
