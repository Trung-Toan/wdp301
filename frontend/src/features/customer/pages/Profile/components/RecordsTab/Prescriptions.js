export default function Prescriptions({ records }) {
  const prescriptions = records.map(r => r.prescription).filter(Boolean);
  if (prescriptions.length === 0) return null;

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Đơn thuốc</h3>
      {prescriptions.map((p, idx) => (
        <div key={idx} className="mb-4">
          {p.medicines.map((m, i) => (
            <p key={i} className="ml-4">
              <strong>{m.name}</strong>: {m.dosage}, {m.frequency}, {m.duration}. {m.note}
            </p>
          ))}
          {p.instruction && <p className="ml-4 mt-1">Hướng dẫn: {p.instruction}</p>}
        </div>
      ))}
    </div>
  );
}