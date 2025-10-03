import React from "react";

export default function CardHeader({ children, className = "" }) {
    return (
        <div className={`p-4 border-b ${className}`}>
            {children}
        </div>
    );
}