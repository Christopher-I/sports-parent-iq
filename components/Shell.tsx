import type { ReactNode } from "react";
import { quiz } from "@/lib/quiz";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <main className="mx-auto flex w-full max-w-[32rem] flex-1 flex-col px-4 pt-6 pb-8">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[32rem] px-4 pb-8">
        <p className="border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
          {quiz.meta.footer}
        </p>
      </footer>
    </div>
  );
}
