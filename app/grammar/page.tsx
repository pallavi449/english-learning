"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GrammarTopic = {
  _id: string;
  title: string;
  hindiTitle: string;
  icon: string;
  color: string;
  rules: { rule: string; hindi: string; examples: { english: string; hindi: string }[] }[];
};

const colorMap: Record<string, string> = {
  blue:   "bg-blue-900/30 border-blue-500/30 text-blue-400",
  green:  "bg-green-900/30 border-green-500/30 text-green-400",
  purple: "bg-purple-900/30 border-purple-500/30 text-purple-400",
  orange: "bg-orange-900/30 border-orange-500/30 text-orange-400",
  red:    "bg-red-900/30 border-red-500/30 text-red-400",
  yellow: "bg-yellow-900/30 border-yellow-500/30 text-yellow-400",
};

export default function GrammarPage() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grammar")
      .then((r) => r.json())
      .then((data) => { setTopics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="bg-[#1a1f2e] min-h-screen flex items-center justify-center">
        <p className="text-[#8b9cb8] text-sm animate-pulse">Loading grammar topics...</p>
      </main>
    );
  }

  return (
    <main className="bg-[#1a1f2e] min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">📖 Grammar</h1>
        <p className="text-[#8b9cb8] text-sm mt-1">Hindi + English mein seekho</p>
      </div>

      {topics.length === 0 ? (
        <div className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-white font-medium mb-1">No grammar topics yet</p>
          <p className="text-[#8b9cb8] text-sm">Add topics from the Admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic._id}
              href={`/grammar/${topic._id}`}
              className={`border rounded-2xl px-5 py-4 flex items-center justify-between hover:scale-[1.02] transition-transform ${colorMap[topic.color] ?? "bg-blue-900/30 border-blue-500/30 text-blue-400"}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{topic.icon}</span>
                <div>
                  <p className="text-white font-semibold text-base">{topic.title}</p>
                  <p className="text-[#8b9cb8] text-xs mt-0.5">
                    {topic.hindiTitle} • {topic.rules.length} rules
                  </p>
                </div>
              </div>
              <span className="text-white/50 text-xl">→</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}