import React from "react";

<<<<<<< HEAD
export default function Card({ children, className = "" }) {
=======
export function Card({ children, className = "" }) {
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
    return (
        <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
            {children}
        </div>
    );
}

<<<<<<< HEAD

=======
export function CardContent({ children, className = "" }) {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
}
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2
