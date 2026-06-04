"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────
type StoryCard = {
  _id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  minWords: number;
};

type FeedbackResult = {
  score: number;
  grammarIssues: { original: string; corrected: string; explanation: string }[];
  sentenceIssues: { original: string; suggestion: string }[];
  overallFeedback: string;
  strengths: string[];
  corrections: number;
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Main Page ────────────────────────────────────────────────────
export default function StoryPage() {
  const [cards, setCards]       = useState<StoryCard[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<StoryCard | null>(null);
  const [story, setStory]       = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [error, setError]       = useState("");
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  const wordCount = countWords(story);
  const minWords  = selected?.minWords ?? 40;
  const canSubmit = wordCount >= minWords && !checking;

  // Fetch story cards from API
  useEffect(() => {
    fetch("/api/story-cards")
      .then((r) => r.json())
      .then((data) => { setCards(data); setLoading(false); })
      .catch(() => { setError("Failed to load story cards."); setLoading(false); });
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [story]);

  function selectCard(card: StoryCard) {
    setSelected(card);
    setStory("");
    setFeedback(null);
    setError("");
  }

  function back() {
    setSelected(null);
    setStory("");
    setFeedback(null);
    setError("");
  }

  async function handleSubmit() {
    if (!selected || !canSubmit) return;
    setChecking(true);
    setError("");
    setFeedback(null);
           
    try {
      const response = await fetch("/api/check-story", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: selected.title,
    prompt: selected.prompt,
    story: story,
  }),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "Failed to analyze story");
}

const clean = data.result
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const parsed: FeedbackResult = JSON.parse(clean);

setFeedback(parsed);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setChecking(false);
  }

  // ── Loading ──
  if (loading) {
    return (
      <main className="bg-[#1a1f2e] min-h-screen flex items-center justify-center">
        <p className="text-[#8b9cb8] text-sm animate-pulse">Loading story cards...</p>
      </main>
    );
  }

  // ── Card Selection Screen ──
  if (!selected) {
    return (
      <main className="bg-[#1a1f2e] min-h-screen px-5 py-6 max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-white text-2xl font-bold tracking-tight">✍️ Story Cards</h1>
          <p className="text-[#8b9cb8] text-sm mt-1">
            Pick an image, write a story in English, and get instant AI feedback.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">🖼️</p>
            <p className="text-white font-medium mb-1">No story cards yet</p>
            <p className="text-[#8b9cb8] text-sm">Add cards from the Admin panel to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card) => (
              <button
                key={card._id}
                onClick={() => selectCard(card)}
                className="group relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200 text-left"
              >
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold leading-tight">{card.title}</p>
                  <p className="text-gray-300 text-xs mt-0.5 opacity-80">Min {card.minWords} words</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    );
  }

  // ── Writing + Feedback Screen ──
  return (
    <main className="bg-[#1a1f2e] min-h-screen px-5 py-6 max-w-3xl mx-auto">
      <button
        onClick={back}
        className="text-[#8b9cb8] text-sm mb-4 hover:text-white flex items-center gap-1 transition-colors"
      >
        ← Back to cards
      </button>

      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden mb-5">
        <img
          src={selected.imageUrl}
          alt={selected.title}
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-white text-lg font-bold">{selected.title}</h2>
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl px-4 py-3 mb-5">
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">✏️ Your Task</p>
        <p className="text-[#e2e8f0] text-sm">{selected.prompt}</p>
      </div>

      {/* Textarea */}
      {!feedback && (
        <div className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-4 mb-4">
          <textarea
            ref={textareaRef}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Start writing your story here in English..."
            disabled={checking}
            className="w-full bg-transparent text-[#e2e8f0] placeholder-[#4a5a7a] text-sm resize-none outline-none min-h-[140px] leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a4a7f]">
            <span className={`text-xs ${wordCount >= minWords ? "text-green-400" : "text-[#8b9cb8]"}`}>
              {wordCount} / {minWords} words {wordCount >= minWords ? "✓" : ""}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {checking ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </span>
              ) : "Check My Story →"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
          ⚠️ {error}
        </p>
      )}

      {/* ── Feedback Panel ── */}
      {feedback && (
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">Your Score</p>
              <span className={`text-2xl font-bold ${
                feedback.score >= 80 ? "text-green-400" :
                feedback.score >= 55 ? "text-yellow-400" : "text-red-400"
              }`}>
                {feedback.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  feedback.score >= 80 ? "bg-green-500" :
                  feedback.score >= 55 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${feedback.score}%` }}
              />
            </div>
            <p className="text-[#c0cce0] text-sm leading-relaxed">{feedback.overallFeedback}</p>
          </div>

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4">
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-2">✅ Strengths</p>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-green-300 text-sm flex gap-2">
                    <span className="opacity-50 shrink-0">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grammar Issues */}
          {feedback.grammarIssues?.length > 0 && (
            <div className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-4">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-3">
                🔴 Grammar Corrections ({feedback.grammarIssues.length})
              </p>
              <div className="space-y-3">
                {feedback.grammarIssues.map((issue, i) => (
                  <div key={i} className="bg-[#1e2d45] rounded-xl p-3">
                    <div className="flex flex-wrap gap-2 items-center mb-1.5">
                      <span className="bg-red-900/50 text-red-300 text-xs px-2 py-0.5 rounded line-through">{issue.original}</span>
                      <span className="text-gray-500 text-xs">→</span>
                      <span className="bg-green-900/50 text-green-300 text-xs px-2 py-0.5 rounded">{issue.corrected}</span>
                    </div>
                    <p className="text-[#8b9cb8] text-xs">{issue.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentence Issues */}
          {feedback.sentenceIssues?.length > 0 && (
            <div className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-4">
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-3">
                🟡 Sentence Improvements ({feedback.sentenceIssues.length})
              </p>
              <div className="space-y-3">
                {feedback.sentenceIssues.map((issue, i) => (
                  <div key={i} className="bg-[#1e2d45] rounded-xl p-3">
                    <p className="text-[#8b9cb8] text-xs mb-1">Original:</p>
                    <p className="text-red-300 text-sm mb-2 italic">"{issue.original}"</p>
                    <p className="text-[#8b9cb8] text-xs mb-1">Suggestion:</p>
                    <p className="text-green-300 text-sm italic">"{issue.suggestion}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfect */}
          {feedback.grammarIssues?.length === 0 && feedback.sentenceIssues?.length === 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-5 text-center">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-green-400 font-semibold">No mistakes found!</p>
              <p className="text-[#8b9cb8] text-sm mt-1">Your story is well-written. Keep it up!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-6">
            <button
              onClick={() => setFeedback(null)}
              className="flex-1 bg-[#1e2d45] border border-[#2a4a7f] text-[#8b9cb8] py-3 rounded-xl text-sm font-medium hover:text-white hover:border-blue-500 transition-colors"
            >
              ✏️ Edit Story
            </button>
            <button
              onClick={back}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              🖼 New Card
            </button>
          </div>
        </div>
      )}
    </main>
  );
}