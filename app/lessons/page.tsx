import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export const dynamic = "force-dynamic";

type Sentence = { hindi: string; english: string };
type LessonType = { _id: string; title: string; sentences: Sentence[] };

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

export default async function LessonsPage() {
  const lessons = await getLessons();

  return (
    <main className="bg-[#1a1f2e] min-h-screen px-6 py-6">
      <h1 className="text-white text-xl font-medium mb-5">All Lessons</h1>
      {lessons.length === 0 ? (
        <p className="text-[#8b9cb8]">No lessons yet. Check back soon!</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
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
              <p className="text-[#8b9cb8] text-sm">
                {lesson.sentences.slice(0, 3).map((s) => s.hindi).join(" · ")}...
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}