import React, { useState } from "react";
import { findEmailAndResetPassword } from "../../api/auth/ForgotPassword/forgorPasswordApi";
 // import hàm API

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) return setError("Vui lòng nhập email");

        setLoading(true);
        try {
            await findEmailAndResetPassword(email); //  Gọi API thông qua hàm riêng
            setMessage("Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu cho bạn.");
        } catch (err) {
            console.error(err);
            setError("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-center mb-4">Quên mật khẩu</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {message && <p className="text-green-600 text-sm">{message}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                    >
                        {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                    </button>
                </form>
            </div>
        </main>
    );
}
