"use client";

import { useState } from "react";

type PracticeButtonProps = {
  content: string; // full markdown content passed from module page
  onQuizGenerated: (questions: any[]) => void; // callback to pass questions to parent/modal
};

export default function PracticeButtonStartQuiz({
  content,
  onQuizGenerated,
}: PracticeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ModuleAI/quizgeneration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
          numQuestions: 7,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Pass questions to parent (modal)
      onQuizGenerated(data.questions);

    } catch (err) {
      setError("Failed to generate quiz. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-10 w-full flex flex-col items-center">
      <button
        onClick={handleGenerateQuiz}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-40"
      >
        {loading ? "Generating…" : "Practice What You Learned"}
      </button>

      {error && (
        <p className="text-red-500 mt-3 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
