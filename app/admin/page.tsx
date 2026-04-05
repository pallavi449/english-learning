"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────
type Sentence = { hindi: string; english: string };
type Lesson   = { _id: string; title: string; sentences: Sentence[] };
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

const LEVELS = ["beginner", "intermediate", "advanced"];

// ─── Main Page ───────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<"lessons" | "vocab">("lessons");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-center mb-6">🚀 Admin Panel</h1>

        {/* Main Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-1 gap-1 mb-7">
          <button
            onClick={() => setTab("lessons")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === "lessons" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            📚 Lessons
          </button>
          <button
            onClick={() => setTab("vocab")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === "vocab" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            📖 Vocabulary
          </button>
        </div>

        {tab === "lessons" && <LessonsTab />}
        {tab === "vocab"   && <VocabTab />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LESSONS TAB
// ════════════════════════════════════════════════════════════════
function LessonsTab() {
  const [title, setTitle]           = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [sentences, setSentences]   = useState<Sentence[]>([{ hindi: "", english: "" }]);
  const [bulkText, setBulkText]     = useState("");
  const [lessons, setLessons]       = useState<Lesson[]>([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { fetchLessons(); }, []);

  async function fetchLessons() {
    const res = await fetch("/api/lessons");
    setLessons(await res.json());
  }

  const addSentence = () =>
    setSentences([...sentences, { hindi: "", english: "" }]);

  const deleteSentence = (i: number) =>
    setSentences(sentences.filter((_, idx) => idx !== i));

  const handleChange = (i: number, field: "hindi" | "english", val: string) => {
    const u = [...sentences];
    u[i][field] = val;
    setSentences(u);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return alert("Paste something first!");
    const parsed = bulkText.split("\n")
      .map((line) => {
        const [hindi, english] = line.split("|");
        if (!hindi || !english) return null;
        return { hindi: hindi.trim(), english: english.trim() };
      })
      .filter(Boolean) as Sentence[];
    setSentences([...sentences, ...parsed]);
    setBulkText("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Title required!");
    const valid = sentences.filter((s) => s.hindi.trim() && s.english.trim());
    if (!valid.length) return alert("Add at least one sentence!");
    setLoading(true);
    try {
      const res  = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sentences: valid, youtubeUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Lesson saved with ${valid.length} sentences!`);
        setTitle(""); setYoutubeUrl("");
        setSentences([{ hindi: "", english: "" }]);
        setBulkText("");
        fetchLessons();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch { alert("❌ Network error"); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    fetchLessons();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">➕ Add New Lesson</h2>

        <input type="text" placeholder="Lesson Title" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-3 rounded-lg text-black text-sm" />

        <input type="text" placeholder="YouTube URL (optional)" value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg text-black text-sm" />

        <textarea
          placeholder={"Bulk paste (Hindi | English):\nमैं स्कूल जाता हूँ | I go to school"}
          value={bulkText} onChange={(e) => setBulkText(e.target.value)}
          className="w-full p-3 mb-2 rounded-lg text-black h-28 font-mono text-sm" />
        <button onClick={handleBulkAdd}
          className="bg-purple-600 px-4 py-2 rounded-lg mb-5 w-full hover:bg-purple-700 text-sm">
          ⚡ Bulk Add Sentences
        </button>

        <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
          {sentences.map((s, i) => (
            <div key={i} className="bg-gray-700 p-3 rounded-xl relative">
              <input type="text" placeholder="Hindi" value={s.hindi}
                onChange={(e) => handleChange(i, "hindi", e.target.value)}
                className="w-full p-2 mb-2 rounded text-black text-sm" />
              <input type="text" placeholder="English" value={s.english}
                onChange={(e) => handleChange(i, "english", e.target.value)}
                className="w-full p-2 rounded text-black text-sm" />
              <button onClick={() => deleteSentence(i)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-500">✕</button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={addSentence}
            className="bg-blue-500 px-4 py-2.5 rounded-lg w-1/2 hover:bg-blue-600 text-sm">
            ➕ Add Sentence
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="bg-green-500 px-4 py-2.5 rounded-lg w-1/2 hover:bg-green-600 disabled:opacity-50 text-sm">
            {loading ? "Saving..." : "💾 Save Lesson"}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">📚 Saved Lessons ({lessons.length})</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-400 text-sm">No lessons yet.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="bg-gray-700 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{lesson.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{lesson.sentences.length} sentences</p>
                </div>
                <button onClick={() => handleDelete(lesson._id)}
                  className="text-red-400 text-xs border border-red-400/40 px-3 py-1.5 rounded-lg hover:text-red-500">
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// VOCAB TAB
// ════════════════════════════════════════════════════════════════
function VocabTab() {
  const [view, setView]             = useState<"add" | "saved">("add");
  const [category, setCategory]     = useState("");
  const [level, setLevel]           = useState("beginner");
  const [bulkText, setBulkText]     = useState("");
  const [words, setWords]           = useState<VocabWord[]>([
    { word: "", meaning: "", hindiMeaning: "", example: "", hindiExample: "", pronunciation: "", level: "beginner", category: "" },
  ]);
  const [savedVocab, setSavedVocab] = useState<VocabWord[]>([]);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchSaved(); }, []);

  async function fetchSaved() {
    const res = await fetch("/api/vocab");
    setSavedVocab(await res.json());
  }

  // Bulk paste format: word | meaning | hindiMeaning | example | hindiExample | pronunciation
  const handleBulkAdd = () => {
    if (!bulkText.trim()) return alert("Paste something first!");
    const parsed = bulkText.split("\n")
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length < 2) return null;
        return {
          word: parts[0] || "",
          meaning: parts[1] || "",
          hindiMeaning: parts[2] || "",
          example: parts[3] || "",
          hindiExample: parts[4] || "",
          pronunciation: parts[5] || "",
          level,
          category,
        };
      })
      .filter(Boolean) as VocabWord[];
    if (!parsed.length) return alert("No valid lines found. Use: word | meaning | hindiMeaning");
    setWords([...words, ...parsed]);
    setBulkText("");
  };

  const addWord = () =>
    setWords([...words, { word: "", meaning: "", hindiMeaning: "", example: "", hindiExample: "", pronunciation: "", level, category }]);

  const deleteWord = (i: number) =>
    setWords(words.filter((_, idx) => idx !== i));

  const handleChange = (i: number, field: keyof VocabWord, val: string) => {
    const u = [...words];
    (u[i] as Record<string, string>)[field] = val;
    setWords(u);
  };

  const handleSave = async () => {
    const valid = words.filter((w) => w.word.trim() && w.meaning.trim());
    if (!valid.length) return alert("Add at least one word with meaning!");
    // Apply category + level to all words that don't have them
    const toSave = valid.map((w) => ({
      ...w,
      category: w.category || category || "general",
      level: w.level || level,
    }));
    setSaving(true);
    try {
      const res  = await fetch("/api/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Saved ${data.count} words!`);
        setWords([{ word: "", meaning: "", hindiMeaning: "", example: "", hindiExample: "", pronunciation: "", level: "beginner", category: "" }]);
        setCategory(""); setBulkText("");
        setView("saved");
        fetchSaved();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch { alert("❌ Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this word?")) return;
    await fetch(`/api/vocab/${id}`, { method: "DELETE" });
    fetchSaved();
  };

  return (
    <div className="space-y-5">

      {/* Sub tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-3">
        <button onClick={() => setView("add")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "add" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
          }`}>
          ➕ Add Words
        </button>
        <button onClick={() => { setView("saved"); fetchSaved(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "saved" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
          }`}>
          📖 Saved ({savedVocab.length})
        </button>
      </div>

      {/* ── ADD VIEW ── */}
      {view === "add" && (
        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold">➕ Add Vocabulary</h2>

          {/* Category + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Category / Topic</label>
              <input type="text" placeholder='e.g. "emotions", "food"'
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm">
                {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Bulk paste */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">
              Bulk Paste
            </label>
            <p className="text-gray-500 text-xs mb-2">
              Format: <span className="text-blue-400 font-mono">word | meaning | hindiMeaning | example | hindiExample | pronunciation</span><br />
              Only first 2 columns required. Example:<br />
              <span className="text-green-400 font-mono">happy | feeling good | खुश | I am happy today. | मैं आज खुश हूँ। | hap-ee</span>
            </p>
            <textarea
              placeholder={"happy | feeling good | खुश | I am happy today. | मैं आज खुश हूँ। | hap-ee\nsad | feeling unhappy | दुखी | She looks sad. | वह दुखी लग रही है। | sad"}
              value={bulkText} onChange={(e) => setBulkText(e.target.value)}
              className="w-full p-3 rounded-lg text-black h-28 font-mono text-xs" />
            <button onClick={handleBulkAdd}
              className="bg-purple-600 px-4 py-2 rounded-lg mt-2 w-full hover:bg-purple-700 text-sm">
              ⚡ Bulk Add Words
            </button>
          </div>

          {/* Word list */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {words.map((w, i) => (
              <div key={i} className="bg-gray-700 p-4 rounded-xl relative">
                <button onClick={() => deleteWord(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-500">✕</button>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Word *</p>
                    <input value={w.word} onChange={(e) => handleChange(i, "word", e.target.value)}
                      placeholder="happy"
                      className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Pronunciation</p>
                    <input value={w.pronunciation} onChange={(e) => handleChange(i, "pronunciation", e.target.value)}
                      placeholder="hap-ee"
                      className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">English Meaning *</p>
                    <input value={w.meaning} onChange={(e) => handleChange(i, "meaning", e.target.value)}
                      placeholder="feeling good and pleased"
                      className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Hindi Meaning</p>
                    <input value={w.hindiMeaning} onChange={(e) => handleChange(i, "hindiMeaning", e.target.value)}
                      placeholder="खुश, प्रसन्न"
                      className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">English Example</p>
                    <input value={w.example} onChange={(e) => handleChange(i, "example", e.target.value)}
                      placeholder="I am happy today."
                      className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-blue-300 text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Hindi Example</p>
                    <input value={w.hindiExample} onChange={(e) => handleChange(i, "hindiExample", e.target.value)}
                      placeholder="मैं आज खुश हूँ।"
                      className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-gray-300 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={addWord}
              className="bg-blue-500 px-4 py-2.5 rounded-lg w-1/2 hover:bg-blue-600 text-sm">
              ➕ Add Word
            </button>
            <button onClick={handleSave} disabled={saving}
              className="bg-green-500 px-4 py-2.5 rounded-lg w-1/2 hover:bg-green-600 disabled:opacity-50 text-sm">
              {saving ? "Saving..." : "💾 Save All Words"}
            </button>
          </div>
        </div>
      )}

      {/* ── SAVED VIEW ── */}
      {view === "saved" && (
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">📖 Saved Vocabulary ({savedVocab.length})</h2>
          {savedVocab.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-4xl mb-3">📭</p>
              <p className="text-gray-400 text-sm">No vocab yet.</p>
              <button onClick={() => setView("add")} className="text-blue-400 text-sm mt-2 hover:underline">
                Add some →
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {savedVocab.map((v) => (
                <div key={v._id} className="bg-gray-700 border border-gray-600 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">{v.word}</span>
                      {v.pronunciation && <span className="text-gray-500 text-xs">/{v.pronunciation}/</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        v.level === "beginner" ? "bg-green-900/60 text-green-400" :
                        v.level === "intermediate" ? "bg-yellow-900/60 text-yellow-400" :
                        "bg-red-900/60 text-red-400"
                      }`}>{v.level}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-400">{v.category}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{v.meaning}
                      {v.hindiMeaning && <span className="text-gray-400"> — {v.hindiMeaning}</span>}
                    </p>
                    {v.example && <p className="text-blue-300 text-xs mt-1 italic">"{v.example}"</p>}
                    {v.hindiExample && <p className="text-gray-500 text-xs">"{v.hindiExample}"</p>}
                  </div>
                  <button onClick={() => handleDelete(v._id!)}
                    className="text-red-400 hover:text-red-500 text-xs border border-red-400/30 px-2 py-1.5 rounded-lg shrink-0">
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}