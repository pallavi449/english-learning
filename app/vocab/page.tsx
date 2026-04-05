"use client";

import { useState, useEffect } from "react";

type VocabWord = {
  _id: string;
  word: string;
  meaning: string;
  hindiMeaning: string;
  example: string;
  hindiExample: string;
  pronunciation: string;
  level: string;
  category: string;
};

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

export default function VocabPage() {
  const [vocab, setVocab] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams();
    if (level !== "all") params.set("level", level);
    if (category !== "all") params.set("category", category);
    fetch(`/api/vocab?${params}`)
      .then((r) => r.json())
      .then((data) => { setVocab(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [level, category]);

  const categories = ["all", ...Array.from(new Set(vocab.map((v) => v.category)))];

  const filtered = vocab.filter(
    (v) =>
      v.word.toLowerCase().includes(search.toLowerCase()) ||
      v.meaning.toLowerCase().includes(search.toLowerCase()) ||
      v.hindiMeaning.includes(search)
  );

  function speak(word: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US"; u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  }

  function toggleFlip(id: string) {
    const next = new Set(flipped);
    next.has(id) ? next.delete(id) : next.add(id);
    setFlipped(next);
  }

  return (
    <main className="bg-[#1a1f2e] min-h-screen px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl font-semibold mb-1">📖 Vocabulary</h1>
        <p className="text-[#8b9cb8] text-sm mb-6">Tap a card to see the Hindi meaning</p>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] bg-[#252d3d] border border-[#2d3748] text-white placeholder-[#4a5568] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-[#252d3d] border border-[#2d3748] text-white rounded-xl px-3 py-2.5 text-sm"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l === "all" ? "All Levels" : l}</option>)}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#252d3d] border border-[#2d3748] text-white rounded-xl px-3 py-2.5 text-sm"
          >
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All Topics" : c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#252d3d] rounded-xl h-36 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#252d3d] border border-[#2d3748] rounded-xl p-10 text-center">
            <p className="text-[#8b9cb8]">No vocabulary found.</p>
          </div>
        ) : (
          <>
            <p className="text-[#8b9cb8] text-xs mb-3">{filtered.length} words</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((v) => (
                <div
                  key={v._id}
                  onClick={() => toggleFlip(v._id)}
                  className="bg-[#252d3d] border border-[#2d3748] rounded-xl p-4 cursor-pointer hover:border-[#4a5568] transition-all select-none"
                >
                  {!flipped.has(v._id) ? (
                    /* Front — English */
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="text-white font-semibold text-base">{v.word}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); speak(v.word); }}
                          className="text-[#8b9cb8] hover:text-white text-sm shrink-0"
                        >🔊</button>
                      </div>
                      {v.pronunciation && (
                        <p className="text-[#4a5568] text-xs mb-1">/{v.pronunciation}/</p>
                      )}
                      <p className="text-[#8b9cb8] text-xs mb-2 line-clamp-2">{v.meaning}</p>
                      <p className="text-blue-300 text-xs italic line-clamp-2">"{v.example}"</p>
                      <div className="flex gap-1 mt-3 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          v.level === "beginner" ? "bg-green-900/50 text-green-400" :
                          v.level === "intermediate" ? "bg-yellow-900/50 text-yellow-400" :
                          "bg-red-900/50 text-red-400"
                        }`}>{v.level}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400">{v.category}</span>
                      </div>
                    </div>
                  ) : (
                    /* Back — Hindi */
                    <div className="h-full flex flex-col justify-center">
                      <p className="text-white text-lg font-semibold mb-1">{v.hindiMeaning}</p>
                      <p className="text-[#8b9cb8] text-sm mb-2">= {v.word}</p>
                      <p className="text-yellow-300 text-xs italic">"{v.hindiExample}"</p>
                      <p className="text-[#4a5568] text-xs mt-3">Tap to flip back</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}