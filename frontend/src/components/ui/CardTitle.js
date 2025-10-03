import React from "react";

export default function CardTitle({ children, className = "" }) {
    return (
        <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h3>
    );
}
