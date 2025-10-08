const React = require("react")
const { useState } = React

export default function Tabs({ defaultValue, children, className = "" }) {
    const [active, setActive] = useState(defaultValue);

    return (
        <div className={`w-full ${className}`}>
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
                return React.cloneElement(child, { active, setActive });
            })}
        </div>
    );
}


