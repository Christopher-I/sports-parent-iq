"use client";

import { useEffect, useReducer } from "react";
import Landing from "./Landing";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";
import Shell from "./Shell";
import { quiz, scoreAnswers } from "@/lib/quiz";

type Stage = "landing" | "quiz" | "result";

interface State {
  stage: Stage;
  index: number;
  answers: Array<string | null>;
}

type Action =
  | { type: "start" }
  | { type: "answer"; optionId: string }
  | { type: "back" }
  | { type: "restart" };

const blank = (): State => ({
  stage: "landing",
  index: 0,
  answers: quiz.questions.map(() => null),
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...blank(), stage: "quiz" };

    case "answer": {
      const answers = [...state.answers];
      answers[state.index] = action.optionId;
      const last = state.index === quiz.questions.length - 1;
      return {
        stage: last ? "result" : "quiz",
        index: last ? state.index : state.index + 1,
        answers,
      };
    }

    case "back":
      return { ...state, index: Math.max(0, state.index - 1) };

    case "restart":
      return blank();
  }
}

export default function QuizApp() {
  const [state, dispatch] = useReducer(reducer, undefined, blank);

  // Answering from halfway down a question would otherwise drop you halfway down
  // the next one, and finishing would drop you halfway down your own result.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.stage, state.index]);

  return (
    <Shell>
      {state.stage === "landing" && <Landing onStart={() => dispatch({ type: "start" })} />}

      {state.stage === "quiz" && (
        <QuestionScreen
          index={state.index}
          chosen={state.answers[state.index]}
          onAnswer={(optionId) => dispatch({ type: "answer", optionId })}
          onBack={() => dispatch({ type: "back" })}
        />
      )}

      {state.stage === "result" && (
        <ResultScreen
          outcome={scoreAnswers(state.answers)}
          lastQuestionIndex={quiz.questions.length - 1}
          onRestart={() => dispatch({ type: "restart" })}
        />
      )}
    </Shell>
  );
}
