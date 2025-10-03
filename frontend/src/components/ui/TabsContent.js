
export default function TabsContent({ value, active, children, className = "" }) {
    if (active !== value) return null;
    return <div className={`py-4 ${className}`}>{children}</div>;
}