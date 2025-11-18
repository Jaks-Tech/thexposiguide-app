"use client";

import { useState } from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export default function PracticeQuizModal({
  questions,
  onClose,
}: {
  questions: QuizQuestion[];
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleSelect = (option: string) => {
    if (selected) return; // prevent changing answer

    setSelected(option);
    setShowExplanation(true);

    if (option === q.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowExplanation(false);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
  };

return (
  <div className="fixed inset-0 z-50">
    {/* Dark background */}
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

    {/* Modal */}
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div
        className="
          bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative
          animate-scaleIn
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
        >
          ×
        </button>

        {/* Progress Bar */}
        {!finished && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-4 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${((current + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Final Results Screen */}
        {finished ? (
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-blue-700">Quiz Completed!</h2>

            <p className="mt-2 text-gray-700 text-lg">
              You scored <b>{score}</b> out of <b>{questions.length}</b>
            </p>

            <button
              onClick={restart}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Retry Quiz
            </button>

            <button
              onClick={onClose}
              className="mt-4 ml-3 bg-gray-200 px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Question Number */}
            <div className="text-gray-600 text-sm mb-2">
              Question {current + 1} of {questions.length}
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold mb-4 leading-relaxed">
              {q.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt) => {
                const isCorrect = opt === q.correctAnswer;
                const isSelected = selected === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg border transition-all duration-300
                      ${
                        selected
                          ? isSelected
                            ? isCorrect
                              ? "bg-green-200 border-green-600"
                              : "bg-red-200 border-red-600"
                            : "bg-gray-100 border-gray-300 opacity-60"
                          : "hover:bg-gray-100 border-gray-300"
                      }
                    `}
                    disabled={!!selected}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div
                className="
                  mt-5 bg-blue-50 border border-blue-300 p-4 rounded-lg 
                  text-sm animate-fadeIn
                "
              >
                <p>
                  <b>Explanation:</b> {q.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {selected && (
              <button
                onClick={nextQuestion}
                className="
                  mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg 
                  shadow hover:bg-blue-700 transition
                "
              >
                {current + 1 === questions.length ? "Finish Quiz" : "Next Question"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

}
