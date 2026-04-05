import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export const dynamic = "force-dynamic";

type Sentence = { hindi: string; english: string };
type LessonType = {
  _id: string;
  title: string;
  sentences: Sentence[];
};

async function getLessons(): Promise<LessonType[]> {
  try {
    await connectDB();
    const lessons = await Lesson.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(lessons));
  } catch (err) {
    console.error("DB error:", err);
    return [];
  }
}

export default async function Home() {
  const lessons = await getLessons();

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-500 py-16 px-6 text-center">
        <h1 className="text-4xl font-semibold text-white mb-3">
          Learn English for Free
        </h1>
        <p className="text-blue-100 text-base mb-8">
          Daily spoken English for Hindi speakers — हिंदी से अंग्रेजी सीखें
        </p>
        <div className="flex justify-center gap-12 mb-10">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-white">{lessons.length}+</span>
            <span className="text-blue-200 text-sm mt-1">Lessons</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-white">
              {lessons.reduce((acc, l) => acc + l.sentences.length, 0)}+
            </span>
            <span className="text-blue-200 text-sm mt-1">Sentences</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-white">Free</span>
            <span className="text-blue-200 text-sm mt-1">Forever</span>
          </div>
        </div>
        <Link
          href="/lessons"
          className="inline-block bg-white text-blue-700 font-medium px-8 py-3 rounded-full text-base hover:bg-blue-50 transition-colors"
        >
          Start Learning →
        </Link>
      </section>

      {/* Features */}
      <section className="bg-[#1a1f2e] px-6 py-8">
        <h2 className="text-white text-lg font-medium mb-5">Why learn here?</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "🎧", title: "Audio", desc: "Hear every sentence spoken aloud" },
            { icon: "📝", title: "Quiz", desc: "Test yourself after each lesson" },
            { icon: "📈", title: "Progress", desc: "Track lessons completed" },
          ].map((f) => (
            <div key={f.title} className="bg-[#252d3d] border border-[#2d3748] rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white text-sm font-medium mb-1">{f.title}</h3>
              <p className="text-[#8b9cb8] text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Lessons */}
        <h2 className="text-white text-lg font-medium mb-4">All Lessons</h2>
        {lessons.length === 0 ? (
          <div className="bg-[#252d3d] border border-[#2d3748] rounded-xl px-5 py-8 text-center">
            <p className="text-[#8b9cb8] text-sm">No lessons yet. Check back soon!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lessons.map((lesson) => (
              <Link
                key={lesson._id}
                href={`/lessons/${lesson._id}`}
                className="bg-[#252d3d] border border-[#2d3748] rounded-xl px-5 py-4 hover:border-[#4a5568] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-base">{lesson.title}</span>
                  <span className="bg-[#2d3748] text-[#a0aec0] text-xs px-3 py-1 rounded-full">
                    {lesson.sentences.length} sentences
                  </span>
                </div>
                <p className="text-[#8b9cb8] text-sm mb-3">
                  {lesson.sentences.slice(0, 3).map((s) => s.hindi).join(" · ")}...
                </p>
                <div className="h-1 bg-[#2d3748] rounded-full">
                  <div className="h-1 bg-blue-600 rounded-full w-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}