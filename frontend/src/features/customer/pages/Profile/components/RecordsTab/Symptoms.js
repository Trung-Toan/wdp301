export default function Symptoms({ records }) {
    const symptoms = records
        .flatMap(r => r.symptoms || [])
        .filter(Boolean);

    if (symptoms.length === 0) return null;

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Triệu chứng</h3>
            <ul className="list-disc ml-6">
                {symptoms.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </div>
    );
}
