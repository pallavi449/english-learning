"use client";

import { useState, useMemo, useEffect } from "react";
import { lessons } from "@/data/lessons";

// ─── Types ───────────────────────────────────────────────────────
type Sentence = { hindi: string; english: string };
type VocabWord = {
  _id?: string;
  word: string;
  meaning: string;
  hindiMeaning: string;
  example: string;
  hindiExample: string;
  pronunciation: string;
  level: string;
  category: string;
};

type QuizQuestion =
  | { type: "sentence"; hindi: string; answer: string; options: string[] }
  | { type: "vocab-meaning"; word: string; pronunciation?: string; answer: string; options: string[] }
  | { type: "vocab-word"; meaning: string; hindiMeaning?: string; answer: string; options: string[] };

type QuizMode = "sentences" | "vocab" | "mixed";
type VocabQuizType = "meaning" | "word" | "both";

// ─── Helpers ────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildSentenceQuestions(allSentences: Sentence[]): QuizQuestion[] {
  return shuffle(allSentences).map((s, _, arr) => {
    const wrong = shuffle(arr.filter((x) => x.english !== s.english))
      .slice(0, 3)
      .map((x) => x.english);
    return {
      type: "sentence",
      hindi: s.hindi,
      answer: s.english,
      options: shuffle([...wrong, s.english]),
    };
  });
}

function buildVocabQuestions(vocab: VocabWord[], quizType: VocabQuizType): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const shuffled = shuffle(vocab);

  for (const v of shuffled) {
    if (quizType === "meaning" || quizType === "both") {
      const wrong = shuffle(vocab.filter((x) => x.word !== v.word))
        .slice(0, 3)
        .map((x) => x.meaning);
      questions.push({
        type: "vocab-meaning",
        word: v.word,
        pronunciation: v.pronunciation,
        answer: v.meaning,
        options: shuffle([...wrong, v.meaning]),
      });
    }
    if (quizType === "word" || quizType === "both") {
      const wrong = shuffle(vocab.filter((x) => x.word !== v.word))
        .slice(0, 3)
        .map((x) => x.word);
      questions.push({
        type: "vocab-word",
        meaning: v.meaning,
        hindiMeaning: v.hindiMeaning,
        answer: v.word,
        options: shuffle([...wrong, v.word]),
      });
    }
  }
  return questions;
}

// ─── Main Page ──────────────────────────────────────────────────
export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [vocabQuizType, setVocabQuizType] = useState<VocabQuizType>("meaning");
  const [vocabLevel, setVocabLevel] = useState<string>("all");
  const [vocabData, setVocabData] = useState<VocabWord[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const allSentences = lessons.flatMap((l) => l.sentences);

  useEffect(() => {
    if (mode === "vocab" || mode === "mixed") {
      setLoadingVocab(true);
      fetch("/api/vocab")
        .then((r) => r.json())
        .then((data) => { setVocabData(data); setLoadingVocab(false); })
        .catch(() => setLoadingVocab(false));
    }
  }, [mode]);

  function startQuiz() {
    let qs: QuizQuestion[] = [];
    const filteredVocab =
      vocabLevel === "all" ? vocabData : vocabData.filter((v) => v.level === vocabLevel);

    if (mode === "sentences") {
      qs = buildSentenceQuestions(allSentences);
    } else if (mode === "vocab") {
      if (filteredVocab.length < 4) return alert("Need at least 4 vocab words to start!");
      qs = buildVocabQuestions(filteredVocab, vocabQuizType);
    } else if (mode === "mixed") {
      if (filteredVocab.length < 4) return alert("Need at least 4 vocab words for mixed quiz!");
      const sq = buildSentenceQuestions(allSentences);
      const vq = buildVocabQuestions(filteredVocab, "meaning");
      qs = shuffle([...sq, ...vq]);
    }

    setQuestions(qs);
    setIndex(0);
    setAnswered(null);
    setScore(0);
    setDone(false);
    setQuizStarted(true);
  }

  function handle(i: number) {
    if (answered !== null) return;
    setAnswered(i);
    if (questions[index].options[i] === questions[index].answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(null);
    }
  }

  function restart() {
    setQuizStarted(false);
    setMode(null);
    setDone(false);
  }

  // ── Done Screen ──
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <main className="bg-[#1a1f2e] min-h-screen px-6 py-6 max-w-3xl mx-auto">
        <h1 className="text-white text-xl font-medium mb-5">Quiz Complete!</h1>
        <div className="bg-[#172033] border border-[#2a4a7f] rounded-xl p-10 text-center">
          <p className="text-5xl mb-5">{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚"}</p>
          <p className="text-green-400 text-2xl font-medium mb-2">
            {score} / {questions.length}
          </p>
          <p className="text-[#8b9cb8] text-sm mb-1">
            {pct}% correct
          </p>
          <p className="text-[#8b9cb8] text-sm mb-8">
            {pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good effort, keep going!" : "Keep practicing!"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={startQuiz}
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              🔄 Retry Same Mode
            </button>
            <button
              onClick={restart}
              className="bg-gray-700 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-600 transition-colors text-sm"
            >
              🏠 Change Mode
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Active Quiz ──
  if (quizStarted && questions.length > 0) {
    const q = questions[index];
    const isCorrect = answered !== null && q.options[answered] === q.answer;

    return (
      <main className="bg-[#1a1f2e] min-h-screen px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white text-xl font-medium">
            {mode === "sentences" ? "📚 Sentence Quiz" : mode === "vocab" ? "📖 Vocab Quiz" : "🎲 Mixed Quiz"}
          </h1>
          <button onClick={restart} className="text-[#8b9cb8] text-xs hover:text-white">✕ Exit</button>
        </div>
        <p className="text-[#8b9cb8] text-sm mb-4">
          Question {index + 1} of {questions.length} · Score: {score}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-[#172033] border border-[#2a4a7f] rounded-xl p-5">

          {/* Question type badge */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-400 mb-3 inline-block">
            {q.type === "sentence" ? "🌐 Translate to English" : q.type === "vocab-meaning" ? "📖 What does this mean?" : "🔤 Which word matches?"}
          </span>

          {/* Question prompt */}
          {q.type === "sentence" && (
            <p className="text-[#e2e8f0] text-xl mb-5">{q.hindi}</p>
          )}
          {q.type === "vocab-meaning" && (
            <div className="mb-5">
              <p className="text-[#e2e8f0] text-2xl font-semibold">{q.word}</p>
              {q.pronunciation && (
                <p className="text-gray-500 text-sm mt-1">/{q.pronunciation}/</p>
              )}
            </div>
          )}
          {q.type === "vocab-word" && (
            <div className="mb-5">
              <p className="text-[#e2e8f0] text-lg">{q.meaning}</p>
              {q.hindiMeaning && (
                <p className="text-gray-400 text-sm mt-1">{q.hindiMeaning}</p>
              )}
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handle(i)}
                className={`text-left px-4 py-3 rounded-lg text-sm border transition-colors ${
                  answered === null
                    ? "bg-[#1e2d45] border-[#2a4a7f] text-[#e2e8f0] hover:bg-[#243454] hover:border-[#3b6fd4]"
                    : opt === q.answer
                    ? "bg-green-900/50 border-green-500 text-green-300"
                    : answered === i
                    ? "bg-red-900/50 border-red-500 text-red-300"
                    : "bg-[#1e2d45] border-[#2a4a7f] text-[#e2e8f0] opacity-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {answered !== null && (
            <div className="mt-4 flex items-center justify-between">
              <p className={`text-sm font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? "✅ Correct!" : `❌ Answer: ${q.answer}`}
              </p>
              <button
                onClick={next}
                className="text-blue-400 text-sm border border-[#2a4a7f] px-4 py-2 rounded-lg hover:border-blue-500 transition-colors"
              >
                {index + 1 >= questions.length ? "Finish 🎯" : "Next →"}
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Mode Selection / Setup ──
  return (
    <main className="bg-[#1a1f2e] min-h-screen px-6 py-6 max-w-3xl mx-auto">
      <h1 className="text-white text-xl font-medium mb-1">Quiz</h1>
      <p className="text-[#8b9cb8] text-sm mb-6">Choose your quiz mode to get started</p>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {[
          {
            id: "sentences" as QuizMode,
            icon: "📚",
            title: "Sentence Translation",
            desc: "Translate Hindi sentences to English",
            count: `${allSentences.length} questions`,
            color: "border-blue-500/40 hover:border-blue-500",
            badge: "bg-blue-900/60 text-blue-400",
          },
          {
            id: "vocab" as QuizMode,
            icon: "📖",
            title: "Vocabulary",
            desc: "Test your knowledge of words and meanings",
            count: `${vocabData.length} words loaded`,
            color: "border-purple-500/40 hover:border-purple-500",
            badge: "bg-purple-900/60 text-purple-400",
          },
          {
            id: "mixed" as QuizMode,
            icon: "🎲",
            title: "Mixed Quiz",
            desc: "Sentences + vocab combined for a challenge",
            count: "All questions",
            color: "border-green-500/40 hover:border-green-500",
            badge: "bg-green-900/60 text-green-400",
          },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`bg-[#172033] border-2 rounded-xl p-5 text-left transition-colors ${m.color} ${
              mode === m.id ? m.color.split(" ")[1].replace("hover:", "") : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="text-white font-medium">{m.title}</p>
                  <p className="text-[#8b9cb8] text-sm">{m.desc}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.badge} shrink-0`}>
                {m.count}
              </span>
            </div>
            {mode === m.id && (
              <span className="inline-block mt-2 text-xs text-blue-400">✓ Selected</span>
            )}
          </button>
        ))}
      </div>

      {/* Config panel */}
      {mode && (
        <div className="bg-[#172033] border border-[#2a4a7f] rounded-xl p-5 mb-5 space-y-4">
          <p className="text-white text-sm font-medium">⚙️ Quiz Settings</p>

          {(mode === "vocab" || mode === "mixed") && (
            <>
              {loadingVocab ? (
                <p className="text-[#8b9cb8] text-sm">Loading vocabulary...</p>
              ) : vocabData.length === 0 ? (
                <p className="text-red-400 text-sm">⚠️ No vocabulary found. Add words in the Admin panel first.</p>
              ) : (
                <>
                  {/* Level filter */}
                  <div>
                    <label className="text-[#8b9cb8] text-xs uppercase tracking-wide mb-2 block">Level Filter</label>
                    <div className="flex gap-2 flex-wrap">
                      {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setVocabLevel(lvl)}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                            vocabLevel === lvl
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-[#1e2d45] border-[#2a4a7f] text-[#8b9cb8] hover:text-white"
                          }`}
                        >
                          {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                          {lvl !== "all" && (
                            <span className="ml-1 opacity-60">
                              ({vocabData.filter((v) => v.level === lvl).length})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quiz type (vocab only) */}
                  {mode === "vocab" && (
                    <div>
                      <label className="text-[#8b9cb8] text-xs uppercase tracking-wide mb-2 block">Quiz Type</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { id: "meaning" as VocabQuizType, label: "Word → Meaning" },
                          { id: "word" as VocabQuizType, label: "Meaning → Word" },
                          { id: "both" as VocabQuizType, label: "Both" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setVocabQuizType(t.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                              vocabQuizType === t.id
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "bg-[#1e2d45] border-[#2a4a7f] text-[#8b9cb8] hover:text-white"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {mode === "sentences" && (
            <p className="text-[#8b9cb8] text-sm">
              {allSentences.length} sentences from {lessons.length} lessons.
            </p>
          )}
        </div>
      )}

      {mode && (
        <button
          onClick={startQuiz}
          disabled={loadingVocab || ((mode === "vocab" || mode === "mixed") && vocabData.length < 4)}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          🚀 Start Quiz
        </button>
      )}
    </main>
  );
}