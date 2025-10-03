import React from "react";

export default function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full rounded-md border border-gray-300 bg-white py-2 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 outline-none ${className}`}
            {...props}
        />
    );
}
