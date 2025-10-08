export default function TabsTrigger({ value, children, active, setActive, className = "" }) {
    const isActive = active === value;
    return (
        <button
            onClick={() => setActive(value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                } ${className}`}
        >
            {children}
        </button>
    );
}