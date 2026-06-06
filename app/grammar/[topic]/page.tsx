"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Example = { english: string; hindi: string };
type Rule = { rule: string; hindi: string; examples: Example[] };
type GrammarTopic = {
  _id: string;
  title: string;
  hindiTitle: string;
  icon: string;
  rules: Rule[];
};

export default function GrammarTopicPage() {
  const { topic } = useParams();
  const [data, setData] = useState<GrammarTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/grammar/${topic}`)
      .then((r) => r.json())
      .then((d) => {
        setData({ ...d, rules: d.rules ?? [] }); // ← fix here
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topic]);

  if (loading) {
    return (
      <main className="bg-[#1a1f2e] min-h-screen flex items-center justify-center">
        <p className="text-[#8b9cb8] animate-pulse">Loading...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="bg-[#1a1f2e] min-h-screen flex items-center justify-center">
        <p className="text-white">Topic not found</p>
      </main>
    );
  }

  return (
    <main className="bg-[#1a1f2e] min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Link href="/grammar" className="text-[#8b9cb8] text-sm mb-5 flex items-center gap-1 hover:text-white transition-colors">
        ← Back to Grammar
      </Link>

      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">{data.icon} {data.title}</h1>
        <p className="text-[#8b9cb8] text-sm mt-1">{data.hindiTitle}</p>
      </div>

      <div className="space-y-6">
        {(data.rules ?? []).map((rule, i) => (  // ← fix here
          <div key={i} className="bg-[#172033] border border-[#2a4a7f] rounded-2xl p-5">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">Rule {i + 1}</p>
            <p className="text-white font-semibold text-sm">{rule.rule}</p>
            <p className="text-[#8b9cb8] text-xs mt-1 mb-4">{rule.hindi}</p>

            <p className="text-[#8b9cb8] text-xs font-semibold uppercase tracking-wide mb-2">Examples</p>
            <div className="space-y-2">
              {(rule.examples ?? []).map((ex, j) => (  // ← fix here too
                <div key={j} className="bg-[#1e2d45] rounded-xl p-3">
                  <p className="text-green-300 text-sm font-medium">{ex.english}</p>
                  <p className="text-[#8b9cb8] text-xs mt-1">{ex.hindi}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pb-6">
        <Link href="/grammar" className="block text-center bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          ← Back to All Topics
        </Link>
      </div>
    </main>
  );
}