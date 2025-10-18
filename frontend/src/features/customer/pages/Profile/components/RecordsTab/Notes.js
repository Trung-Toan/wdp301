export default function Notes({ records }) {
  const notes = records.map(r => r.notes).filter(Boolean);
  if (notes.length === 0) return null;

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Ghi chú</h3>
      <ul className="list-disc ml-6">
        {notes.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  );
}