// src/components/ui/Toast.jsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const typeConfig = {
    success: { bg: "bg-green-500", icon: <CheckCircle className="w-5 h-5" /> },
    error: { bg: "bg-red-500", icon: <XCircle className="w-5 h-5" /> },
    info: { bg: "bg-blue-500", icon: <Info className="w-5 h-5" /> },
    warning: { bg: "bg-yellow-500", icon: <AlertTriangle className="w-5 h-5" /> },
};

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg text-white ${typeConfig[type]?.bg || "bg-gray-500"}`}
                >
                    <span>{typeConfig[type]?.icon}</span>
                    <span className="flex-1">{message}</span>
                    <button
                        onClick={onClose}
                        className="ml-2 p-1 rounded hover:bg-white/20 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
