export default function LessonCard({ title, id }: any) {
  return (
    <div className="bg-gray-800 p-6 rounded shadow hover:scale-105 transition">
      <h2 className="text-lg font-semibold">{title}</h2>

      <a
        href={`/lessons/${id}`}
        className="text-blue-400 mt-2 inline-block"
      >
        View Lesson →
      </a>
    </div>
  );
}