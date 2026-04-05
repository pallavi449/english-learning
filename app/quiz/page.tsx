"use client";

import { useState, useMemo } from "react";
import { lessons } from "@/data/lessons";

export default function QuizPage() {
  const allSentences = lessons.flatMap((l) => l.sentences);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = allSentences[index];

  const options = useMemo(() => {
    const wrong = allSentences
      .filter((_, i) => i !== index)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((s) => s.english);
    return [...wrong, current.english].sort(() => Math.random() - 0.5);
  }, [index]);

  function handle(i: number) {
    if (answered !== null) return;
    setAnswered(i);
    if (options[i] === current.english) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= allSentences.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(null);
    }
  }

  function restart() {
    setIndex(0);
    setAnswered(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <main className="bg-[#1a1f2e] min-h-screen px-6 py-6 max-w-3xl mx-auto">
        <h1 className="text-white text-xl font-medium mb-5">Quiz Complete!</h1>
        <div className="bg-[#172033] border border-[#2a4a7f] rounded-xl p-10 text-center">
          <p className="text-5xl mb-5">🎉</p>
          <p className="text-green-400 text-2xl font-medium mb-2">
            Score: {score} / {allSentences.length}
          </p>
          <p className="text-[#8b9cb8] text-sm mb-8">
            {score >= allSentences.length * 0.8 ? "Excellent work!" : "Keep practicing!"}
          </p>
          <button
            onClick={restart}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#1a1f2e] min-h-screen px-6 py-6 max-w-3xl mx-auto">
      <h1 className="text-white text-xl font-medium mb-1">Quiz</h1>
      <p className="text-[#8b9cb8] text-sm mb-5">
        Question {index + 1} of {allSentences.length} · Score: {score}
      </p>

      <div className="bg-[#172033] border border-[#2a4a7f] rounded-xl p-5">
        <p className="text-blue-400 text-sm font-medium mb-2">What is the English translation?</p>
        <p className="text-[#e2e8f0] text-xl mb-5">{current.hindi}</p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handle(i)}
              className={`text-left px-4 py-3 rounded-lg text-sm border transition-colors ${
                answered === null
                  ? "bg-[#1e2d45] border-[#2a4a7f] text-[#e2e8f0] hover:bg-[#243454] hover:border-[#3b6fd4]"
                  : opt === current.english
                  ? "bg-green-900/50 border-green-500 text-green-300"
                  : answered === i
                  ? "bg-red-900/50 border-red-500 text-red-300"
                  : "bg-[#1e2d45] border-[#2a4a7f] text-[#e2e8f0]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {answered !== null && (
          <div className="mt-4 flex items-center justify-between">
            <p className={`text-sm font-medium ${options[answered] === current.english ? "text-green-400" : "text-red-400"}`}>
              {options[answered] === current.english ? "✅ Correct!" : `❌ Answer: ${current.english}`}
            </p>
            <button
              onClick={next}
              className="text-blue-400 text-sm border border-[#2a4a7f] px-4 py-2 rounded-lg hover:border-blue-500 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}