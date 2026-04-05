"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

type Sentence = { hindi: string; english: string };
type Lesson = {
  _id: string;
  title: string;
  youtubeUrl?: string;
  sentences: Sentence[];
};

export default function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/lessons/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data || data.error) setError(data?.error || "Unknown error");
        else setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const { quizSentence, options } = useMemo(() => {
    if (!lesson?.sentences?.length)
      return { quizSentence: null, options: [] as string[] };
    const first = lesson.sentences[0];
    const wrong = lesson.sentences.slice(1, 4).map((s) => s.english);
    const opts = [...wrong, first.english].sort(() => Math.random() - 0.5);
    return { quizSentence: first, options: opts };
  }, [lesson]);

  function speak(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#252d3d] rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] px-4 py-6">
        <div className="max-w-2xl mx-auto bg-[#252d3d] border border-red-800 rounded-xl p-6">
          <p className="text-red-400 font-medium mb-2">❌ Could not load lesson</p>
          <p className="text-[#8b9cb8] text-sm">{error || "Lesson not found"}</p>
          <a href="/lessons" className="text-blue-400 text-sm mt-4 inline-block hover:underline">
            ← Back to Lessons
          </a>
        </div>
      </div>
    );
  }

  const sentences: Sentence[] = lesson.sentences ?? [];

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back */}
        <a href="/lessons" className="text-[#8b9cb8] text-sm hover:text-white mb-5 inline-block">
          ← All Lessons
        </a>

        {/* Title */}
        <h1 className="text-white text-xl font-semibold mb-6">{lesson.title}</h1>

        {/* Sentences */}
        <div className="space-y-3 mb-6">
          {sentences.map((s, i) => (
            <div
              key={i}
              className="bg-[#252d3d] border border-[#2d3748] rounded-xl px-4 py-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-[#e2e8f0] text-sm mb-1">Hindi: {s.hindi}</p>
                <p className="text-green-400 text-sm">English: {s.english}</p>
              </div>
              <button
                onClick={() => speak(s.english)}
                className="shrink-0 bg-[#1a1f2e] border border-[#4a5568] text-[#a0aec0] text-xs px-3 py-2 rounded-lg hover:border-blue-500 hover:text-white transition-colors flex items-center gap-1"
              >
                🔊 Listen
              </button>
            </div>
          ))}
        </div>

        {/* Quiz */}
        {quizSentence && (
          <div className="bg-[#1e2535] border border-[#2a4a7f] rounded-xl p-5 mb-4">
            <h2 className="text-blue-400 text-sm font-medium mb-2">Quick Quiz</h2>
            <p className="text-[#e2e8f0] text-base mb-4">{quizSentence.hindi} = ?</p>
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { if (answered === null) setAnswered(i); }}
                  className={`text-left px-4 py-3 rounded-xl text-sm border transition-colors ${
                    answered === null
                      ? "bg-[#252d3d] border-[#2d3748] text-[#e2e8f0] hover:border-blue-500 hover:bg-[#1e2d45]"
                      : opt === quizSentence.english
                      ? "bg-green-900/40 border-green-500 text-green-300"
                      : answered === i
                      ? "bg-red-900/40 border-red-500 text-red-300"
                      : "bg-[#252d3d] border-[#2d3748] text-[#e2e8f0]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {answered !== null && (
              <p className={`mt-4 text-sm font-medium ${
                options[answered] === quizSentence.english ? "text-green-400" : "text-red-400"
              }`}>
                {options[answered] === quizSentence.english
                  ? "✅ Correct! Well done!"
                  : `❌ Correct answer: ${quizSentence.english}`}
              </p>
            )}
          </div>
        )}

        {/* YouTube */}
        {lesson.youtubeUrl && (
          <div className="bg-[#1e1515] border border-red-900/40 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">Watch on YouTube</h3>
              <a
                href={lesson.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:underline"
              >
                Watch now →
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}