"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────
type Sentence   = { hindi: string; english: string };
type Lesson     = { _id: string; title: string; sentences: Sentence[] };
type VocabWord  = {
  _id?: string;
  word: string; meaning: string; hindiMeaning: string;
  example: string; hindiExample: string; pronunciation: string;
  level: string; category: string;
};
type StoryCard  = {
  _id: string; title: string; imageUrl: string; prompt: string; minWords: number;
};
type GrammarExample = { english: string; hindi: string };
type GrammarRule    = { rule: string; hindi: string; examples: GrammarExample[] };
type GrammarTopic   = {
  _id: string; title: string; hindiTitle: string; icon: string; color: string; rules: GrammarRule[];
};

const LEVELS  = ["beginner", "intermediate", "advanced"];
const COLORS  = ["blue", "green", "purple", "orange", "red", "yellow"];

// ─── Main Page ───────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<"lessons" | "vocab" | "story" | "grammar">("lessons");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-6">🚀 Admin Panel</h1>

        {/* Main Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-1 gap-1 mb-7 flex-wrap">
          {(["lessons", "vocab", "story", "grammar"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "lessons" ? "📚 Lessons" : t === "vocab" ? "📖 Vocab" : t === "story" ? "🖼️ Story" : "📝 Grammar"}
            </button>
          ))}
        </div>

        {tab === "lessons" && <LessonsTab />}
        {tab === "vocab"   && <VocabTab />}
        {tab === "story"   && <StoryCardsTab />}
        {tab === "grammar" && <GrammarTab />}
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

  const addSentence    = () => setSentences([...sentences, { hindi: "", english: "" }]);
  const deleteSentence = (i: number) => setSentences(sentences.filter((_, idx) => idx !== i));
  const handleChange   = (i: number, field: "hindi" | "english", val: string) => {
    const u = [...sentences]; u[i][field] = val; setSentences(u);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return alert("Paste something first!");
    const parsed = bulkText.split("\n").map((line) => {
      const [hindi, english] = line.split("|");
      if (!hindi || !english) return null;
      return { hindi: hindi.trim(), english: english.trim() };
    }).filter(Boolean) as Sentence[];
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sentences: valid, youtubeUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Lesson saved with ${valid.length} sentences!`);
        setTitle(""); setYoutubeUrl(""); setSentences([{ hindi: "", english: "" }]); setBulkText("");
        fetchLessons();
      } else { alert(`❌ ${data.error}`); }
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
        <textarea placeholder={"Bulk paste (Hindi | English):\nमैं स्कूल जाता हूँ | I go to school"}
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
        {lessons.length === 0 ? <p className="text-gray-400 text-sm">No lessons yet.</p> : (
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

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return alert("Paste something first!");
    const parsed = bulkText.split("\n").map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 2) return null;
      return { word: parts[0] || "", meaning: parts[1] || "", hindiMeaning: parts[2] || "",
        example: parts[3] || "", hindiExample: parts[4] || "", pronunciation: parts[5] || "", level, category };
    }).filter(Boolean) as VocabWord[];
    if (!parsed.length) return alert("No valid lines found.");
    setWords([...words, ...parsed]); setBulkText("");
  };

  const addWord    = () => setWords([...words, { word: "", meaning: "", hindiMeaning: "", example: "", hindiExample: "", pronunciation: "", level, category }]);
  const deleteWord = (i: number) => setWords(words.filter((_, idx) => idx !== i));
  const handleChange = (i: number, field: keyof VocabWord, val: string) => {
    const u = [...words]; (u[i] as Record<string, string>)[field] = val; setWords(u);
  };

  const handleSave = async () => {
    const valid = words.filter((w) => w.word.trim() && w.meaning.trim());
    if (!valid.length) return alert("Add at least one word with meaning!");
    const toSave = valid.map((w) => ({ ...w, category: w.category || category || "general", level: w.level || level }));
    setSaving(true);
    try {
      const res  = await fetch("/api/vocab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toSave) });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Saved ${data.count} words!`);
        setWords([{ word: "", meaning: "", hindiMeaning: "", example: "", hindiExample: "", pronunciation: "", level: "beginner", category: "" }]);
        setCategory(""); setBulkText(""); setView("saved"); fetchSaved();
      } else { alert(`❌ ${data.error}`); }
    } catch { alert("❌ Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this word?")) return;
    await fetch(`/api/vocab/${id}`, { method: "DELETE" }); fetchSaved();
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-gray-700 pb-3">
        <button onClick={() => setView("add")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "add" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          ➕ Add Words
        </button>
        <button onClick={() => { setView("saved"); fetchSaved(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "saved" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          📖 Saved ({savedVocab.length})
        </button>
      </div>
      {view === "add" && (
        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold">➕ Add Vocabulary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Category</label>
              <input type="text" placeholder='e.g. "emotions"' value={category} onChange={(e) => setCategory(e.target.value)}
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
          <textarea placeholder={"happy | feeling good | खुश | I am happy. | मैं खुश हूँ। | hap-ee"}
            value={bulkText} onChange={(e) => setBulkText(e.target.value)}
            className="w-full p-3 rounded-lg text-black h-28 font-mono text-xs" />
          <button onClick={handleBulkAdd} className="bg-purple-600 px-4 py-2 rounded-lg w-full hover:bg-purple-700 text-sm">
            ⚡ Bulk Add Words
          </button>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {words.map((w, i) => (
              <div key={i} className="bg-gray-700 p-4 rounded-xl relative">
                <button onClick={() => deleteWord(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-500">✕</button>
                <div className="grid grid-cols-2 gap-2">
                  {([["word","Word *","happy"],["pronunciation","Pronunciation","hap-ee"],["meaning","English Meaning *","feeling good"],
                    ["hindiMeaning","Hindi Meaning","खुश"],["example","English Example","I am happy."],["hindiExample","Hindi Example","मैं खुश हूँ।"]] as [keyof VocabWord, string, string][])
                    .map(([field, label, ph]) => (
                      <div key={field}>
                        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                        <input value={w[field] as string} onChange={(e) => handleChange(i, field, e.target.value)} placeholder={ph}
                          className="w-full bg-gray-600 rounded-lg px-3 py-1.5 text-white text-sm" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={addWord} className="bg-blue-500 px-4 py-2.5 rounded-lg w-1/2 hover:bg-blue-600 text-sm">➕ Add Word</button>
            <button onClick={handleSave} disabled={saving}
              className="bg-green-500 px-4 py-2.5 rounded-lg w-1/2 hover:bg-green-600 disabled:opacity-50 text-sm">
              {saving ? "Saving..." : "💾 Save All Words"}
            </button>
          </div>
        </div>
      )}
      {view === "saved" && (
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">📖 Saved Vocabulary ({savedVocab.length})</h2>
          {savedVocab.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No vocab yet.</p>
              <button onClick={() => setView("add")} className="text-blue-400 text-sm mt-2 hover:underline">Add some →</button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {savedVocab.map((v) => (
                <div key={v._id} className="bg-gray-700 border border-gray-600 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">{v.word}</span>
                      {v.pronunciation && <span className="text-gray-500 text-xs">/{v.pronunciation}/</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${v.level === "beginner" ? "bg-green-900/60 text-green-400" : v.level === "intermediate" ? "bg-yellow-900/60 text-yellow-400" : "bg-red-900/60 text-red-400"}`}>{v.level}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{v.meaning}{v.hindiMeaning && <span className="text-gray-400"> — {v.hindiMeaning}</span>}</p>
                    {v.example && <p className="text-blue-300 text-xs mt-1 italic">"{v.example}"</p>}
                  </div>
                  <button onClick={() => handleDelete(v._id!)}
                    className="text-red-400 hover:text-red-500 text-xs border border-red-400/30 px-2 py-1.5 rounded-lg shrink-0">🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STORY CARDS TAB
// ════════════════════════════════════════════════════════════════
function StoryCardsTab() {
  const [view, setView]           = useState<"add" | "saved">("add");
  const [cards, setCards]         = useState<StoryCard[]>([]);
  const [saving, setSaving]       = useState(false);
  const [imgError, setImgError]   = useState("");
  const [title, setTitle]         = useState("");
  const [imageUrl, setImageUrl]   = useState("");
  const [prompt, setPrompt]       = useState("");
  const [minWords, setMinWords]   = useState(40);
  const [previewOk, setPreviewOk] = useState(false);

  useEffect(() => { fetchCards(); }, []);

  async function fetchCards() {
    const res = await fetch("/api/story-cards");
    setCards(await res.json());
  }

  function handleImageUrlChange(val: string) {
    setImageUrl(val); setPreviewOk(false); setImgError("");
  }

  function resetForm() {
    setTitle(""); setImageUrl(""); setPrompt(""); setMinWords(40);
    setPreviewOk(false); setImgError("");
  }

  async function handleSave() {
    if (!title.trim())    return alert("Title is required!");
    if (!imageUrl.trim()) return alert("Image URL is required!");
    if (!prompt.trim())   return alert("Prompt is required!");
    if (!previewOk)       return alert("Please verify the image loads correctly first.");
    setSaving(true);
    try {
      const res  = await fetch("/api/story-cards", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl, prompt, minWords }),
      });
      const data = await res.json();
      if (res.ok) { alert("✅ Story card saved!"); resetForm(); setView("saved"); fetchCards(); }
      else { alert(`❌ ${data.error}`); }
    } catch { alert("❌ Network error"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this story card?")) return;
    await fetch(`/api/story-cards/${id}`, { method: "DELETE" });
    fetchCards();
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-gray-700 pb-3">
        <button onClick={() => setView("add")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "add" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          ➕ Add Card
        </button>
        <button onClick={() => { setView("saved"); fetchCards(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "saved" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          🖼️ Saved ({cards.length})
        </button>
      </div>
      {view === "add" && (
        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold">➕ Add Story Card</h2>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Card Title *</label>
            <input type="text" placeholder='e.g. "The Old Lighthouse"' value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Image URL *</label>
            <input type="url" placeholder="https://images.unsplash.com/photo-..." value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            {imageUrl.trim() && (
              <div className="mt-3">
                {imgError ? (
                  <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 text-center">
                    <p className="text-red-400 text-sm">⚠️ Could not load image.</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-44 object-cover rounded-xl"
                      onLoad={() => { setPreviewOk(true); setImgError(""); }}
                      onError={() => { setPreviewOk(false); setImgError("failed"); }} />
                    {previewOk && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-lg">✓ Image OK</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Writing Prompt *</label>
            <textarea placeholder='e.g. "Write a short story about this image."'
              value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">
              Minimum Words: <span className="text-white">{minWords}</span>
            </label>
            <input type="range" min={20} max={200} step={10} value={minWords}
              onChange={(e) => setMinWords(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={resetForm} className="bg-gray-700 px-4 py-2.5 rounded-lg w-1/3 hover:bg-gray-600 text-sm text-gray-300">🔄 Reset</button>
            <button onClick={handleSave} disabled={saving}
              className="bg-green-500 px-4 py-2.5 rounded-lg w-2/3 hover:bg-green-600 disabled:opacity-50 text-sm font-medium">
              {saving ? "Saving..." : "💾 Save Story Card"}
            </button>
          </div>
        </div>
      )}
      {view === "saved" && (
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">🖼️ Saved Story Cards ({cards.length})</h2>
          {cards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No story cards yet.</p>
              <button onClick={() => setView("add")} className="text-blue-400 text-sm mt-2 hover:underline">Add one →</button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {cards.map((card) => (
                <div key={card._id} className="bg-gray-700 border border-gray-600 rounded-2xl overflow-hidden">
                  <img src={card.imageUrl} alt={card.title} className="w-full h-36 object-cover" />
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{card.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-400 mt-1 inline-block">Min {card.minWords} words</span>
                      <p className="text-gray-400 text-xs italic mt-2">"{card.prompt}"</p>
                    </div>
                    <button onClick={() => handleDelete(card._id)}
                      className="text-red-400 text-xs border border-red-400/30 px-3 py-1.5 rounded-lg hover:text-red-500 shrink-0">🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// GRAMMAR TAB
// ════════════════════════════════════════════════════════════════
function GrammarTab() {
  const [view, setView]       = useState<"add" | "saved">("add");
  const [topics, setTopics]   = useState<GrammarTopic[]>([]);
  const [saving, setSaving]   = useState(false);

  // Form state
  const [title, setTitle]           = useState("");
  const [hindiTitle, setHindiTitle] = useState("");
  const [icon, setIcon]             = useState("");
  const [color, setColor]           = useState("blue");
  const [rules, setRules]           = useState<GrammarRule[]>([
    { rule: "", hindi: "", examples: [{ english: "", hindi: "" }] }
  ]);

  useEffect(() => { fetchTopics(); }, []);

  async function fetchTopics() {
    const res = await fetch("/api/grammar");
    setTopics(await res.json());
  }

  function resetForm() {
    setTitle(""); setHindiTitle(""); setIcon(""); setColor("blue");
    setRules([{ rule: "", hindi: "", examples: [{ english: "", hindi: "" }] }]);
  }

  // Rule handlers
  function addRule() {
    setRules([...rules, { rule: "", hindi: "", examples: [{ english: "", hindi: "" }] }]);
  }

  function deleteRule(ri: number) {
    setRules(rules.filter((_, i) => i !== ri));
  }

  function updateRule(ri: number, field: "rule" | "hindi", val: string) {
    const u = [...rules]; u[ri][field] = val; setRules(u);
  }

  // Example handlers
  function addExample(ri: number) {
    const u = [...rules];
    u[ri].examples.push({ english: "", hindi: "" });
    setRules(u);
  }

  function deleteExample(ri: number, ei: number) {
    const u = [...rules];
    u[ri].examples = u[ri].examples.filter((_, i) => i !== ei);
    setRules(u);
  }

  function updateExample(ri: number, ei: number, field: "english" | "hindi", val: string) {
    const u = [...rules];
    u[ri].examples[ei][field] = val;
    setRules(u);
  }

  async function handleSave() {
    if (!title.trim())      return alert("Title required!");
    if (!hindiTitle.trim()) return alert("Hindi title required!");
    if (!icon.trim())       return alert("Icon required!");

    const validRules = rules.filter((r) => r.rule.trim() && r.hindi.trim());
    if (!validRules.length) return alert("Add at least one rule!");

    const payload = {
      title, hindiTitle, icon, color,
      rules: validRules.map((r) => ({
        ...r,
        examples: r.examples.filter((e) => e.english.trim() && e.hindi.trim()),
      })),
    };

    setSaving(true);
    try {
      const res  = await fetch("/api/grammar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Grammar topic saved!");
        resetForm(); setView("saved"); fetchTopics();
      } else { alert(`❌ ${data.error}`); }
    } catch { alert("❌ Network error"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this topic?")) return;
    await fetch(`/api/grammar/${id}`, { method: "DELETE" });
    fetchTopics();
  }

  return (
    <div className="space-y-5">
      {/* Sub tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-3">
        <button onClick={() => setView("add")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "add" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          ➕ Add Topic
        </button>
        <button onClick={() => { setView("saved"); fetchTopics(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "saved" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          📝 Saved ({topics.length})
        </button>
      </div>

      {/* ── ADD VIEW ── */}
      {view === "add" && (
        <div className="bg-gray-800 p-6 rounded-2xl space-y-5">
          <h2 className="text-lg font-semibold">➕ Add Grammar Topic</h2>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Title (English) *</label>
              <input type="text" placeholder="e.g. Tenses" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Title (Hindi) *</label>
              <input type="text" placeholder="e.g. काल" value={hindiTitle}
                onChange={(e) => setHindiTitle(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Icon (Emoji) *</label>
              <input type="text" placeholder="e.g. ⏰" value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1.5 block">Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm">
                {COLORS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-xs uppercase tracking-wide">Rules</label>
              <button onClick={addRule}
                className="text-blue-400 text-xs border border-blue-400/40 px-3 py-1 rounded-lg hover:bg-blue-900/30">
                ➕ Add Rule
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {rules.map((rule, ri) => (
                <div key={ri} className="bg-gray-700 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Rule {ri + 1}</p>
                    {rules.length > 1 && (
                      <button onClick={() => deleteRule(ri)} className="text-red-400 text-xs hover:text-red-500">✕ Remove</button>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs mb-1">Rule (English) *</p>
                    <input type="text" placeholder="e.g. Simple Present — Subject + V1"
                      value={rule.rule} onChange={(e) => updateRule(ri, "rule", e.target.value)}
                      className="w-full bg-gray-600 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Rule (Hindi) *</p>
                    <input type="text" placeholder="e.g. जो काम रोज होता है"
                      value={rule.hindi} onChange={(e) => updateRule(ri, "hindi", e.target.value)}
                      className="w-full bg-gray-600 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>

                  {/* Examples */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs">Examples</p>
                      <button onClick={() => addExample(ri)}
                        className="text-green-400 text-xs border border-green-400/40 px-2 py-0.5 rounded-lg hover:bg-green-900/30">
                        ➕ Example
                      </button>
                    </div>
                    <div className="space-y-2">
                      {rule.examples.map((ex, ei) => (
                        <div key={ei} className="bg-gray-600 p-3 rounded-lg relative">
                          {rule.examples.length > 1 && (
                            <button onClick={() => deleteExample(ri, ei)}
                              className="absolute top-2 right-2 text-red-400 text-xs hover:text-red-500">✕</button>
                          )}
                          <input type="text" placeholder="English sentence"
                            value={ex.english} onChange={(e) => updateExample(ri, ei, "english", e.target.value)}
                            className="w-full bg-gray-500 rounded px-3 py-1.5 text-white text-xs mb-1.5" />
                          <input type="text" placeholder="Hindi translation"
                            value={ex.hindi} onChange={(e) => updateExample(ri, ei, "hindi", e.target.value)}
                            className="w-full bg-gray-500 rounded px-3 py-1.5 text-white text-xs" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={resetForm}
              className="bg-gray-700 px-4 py-2.5 rounded-lg w-1/3 hover:bg-gray-600 text-sm text-gray-300">
              🔄 Reset
            </button>
            <button onClick={handleSave} disabled={saving}
              className="bg-green-500 px-4 py-2.5 rounded-lg w-2/3 hover:bg-green-600 disabled:opacity-50 text-sm font-medium">
              {saving ? "Saving..." : "💾 Save Grammar Topic"}
            </button>
          </div>
        </div>
      )}

      {/* ── SAVED VIEW ── */}
      {view === "saved" && (
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">📝 Saved Grammar Topics ({topics.length})</h2>
          {topics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-4xl mb-3">📝</p>
              <p className="text-gray-400 text-sm">No grammar topics yet.</p>
              <button onClick={() => setView("add")} className="text-blue-400 text-sm mt-2 hover:underline">Add one →</button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {topics.map((topic) => (
                <div key={topic._id} className="bg-gray-700 border border-gray-600 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{topic.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{topic.title}</p>
                      <p className="text-gray-400 text-xs">{topic.hindiTitle} • {topic.rules.length} rules</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(topic._id)}
                    className="text-red-400 text-xs border border-red-400/30 px-3 py-1.5 rounded-lg hover:text-red-500">
                    🗑 Delete
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