const React = require("react")
export default function TabsList({ children, active, setActive, className = "" }) {
    return (
        <div className={`flex border-b ${className}`}>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { active, setActive })
            )}
        </div>
    );
}