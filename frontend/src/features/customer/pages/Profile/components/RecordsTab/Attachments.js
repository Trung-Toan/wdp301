export default function Attachments({ records }) {
    const attachments = records.flatMap(r => r.attachments || []);
    if (attachments.length === 0) return null;

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">File đính kèm</h3>
            <ul className="list-disc ml-6">
                {attachments.map((a, i) => (
                    <li key={i}>
                        <a href={a} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            {a}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}