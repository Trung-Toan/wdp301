import { StickyNote } from "lucide-react";

export default function Notes({ records }) {
  const notes = records.map(r => r.notes).filter(Boolean);
  if (notes.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
          <StickyNote className="h-5 w-5 text-sky-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Ghi chú</h3>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note, i) => (
          <div
            key={i}
            className="bg-white/60 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
                {note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}