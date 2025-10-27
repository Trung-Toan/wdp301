import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
                        <div className="relative bg-red-50 rounded-full p-6 border-2 border-red-200">
                            <Lock className="w-12 h-12 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl font-bold text-slate-900 mb-2">401</h1>
                <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                    Truy cập bị từ chối
                </h2>
                <p className="text-slate-600 mb-8">
                    Bạn không có quyền truy cập trang này. Vui lòng đăng nhập hoặc liên hệ
                    quản trị viên để được cấp quyền.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <LogIn className="w-5 h-5" />
                        Đăng nhập
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </button>
                </div>

                {/* Footer text */}
                <p className="mt-8 text-sm text-slate-500">
                    Nếu bạn cho rằng đây là lỗi, vui lòng{" "}
                    <a
                        href="mailto:support@healthcare.com"
                        className="text-blue-600 hover:underline"
                    >
                        liên hệ hỗ trợ
                    </a>
                </p>
            </div>
        </div>
    );
}
