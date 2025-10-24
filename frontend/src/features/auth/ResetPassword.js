import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AUTHEN_API } from "../../api/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const accountId = searchParams.get("accountId"); // ✅ thêm dòng này
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password || !confirm) return setError("Vui lòng nhập đầy đủ thông tin");
        if (password.length < 8) return setError("Mật khẩu phải có ít nhất 8 ký tự");
        if (password !== confirm) return setError("Mật khẩu không khớp");

        setLoading(true);
        try {
            await axios.post(AUTHEN_API.FORGOTPASSWORD, {
                token,
                newPassword: password,
                accountId, // ✅ gửi accountId lên backend
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    if (success)
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Thành công!</h2>
                    <p className="text-gray-500">Mật khẩu của bạn đã được đặt lại.</p>
                </div>
            </main>
        );

    return (
        <main className="flex-1 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-center mb-4">Đặt lại mật khẩu</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                    >
                        {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </div>
        </main>
    );
}
