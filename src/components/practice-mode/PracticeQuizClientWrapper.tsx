"use client";

import { useState } from "react";
import PracticeButtonStartQuiz from "./PracticeButtonStartQuiz";
import PracticeQuizModal from "./PracticeQuizModal";

export default function PracticeQuizClientWrapper({ content }: { content: string }) {
  const [questions, setQuestions] = useState<any[] | null>(null);

  return (
    <div className="mt-12">
      <PracticeButtonStartQuiz
        content={content}
        onQuizGenerated={(q) => setQuestions(q)}
      />

      {/* Show modal only when questions exist */}
      {questions && (
        <PracticeQuizModal
          questions={questions}
          onClose={() => setQuestions(null)}
        />
      )}
    </div>
  );
}
