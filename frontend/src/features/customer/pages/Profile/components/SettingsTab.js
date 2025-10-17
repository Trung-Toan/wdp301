import React, { useState } from "react";

import {
    Lock,
    CheckCircle,
    AlertCircle,
    Bell,
    Shield,
} from "lucide-react";
import Card from "../../../../../components/ui/Card";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";

export default function SettingsTab() {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Xử lý thay đổi input
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    // Validate đơn giản
    const validatePassword = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            errors.confirmPassword = "Xác nhận mật khẩu không khớp";
        }
        return errors;
    };

    // Xử lý đổi mật khẩu
    const handlePasswordChange = () => {
        const errors = validatePassword();
        setPasswordErrors(errors);
        if (Object.keys(errors).length === 0) {
            setIsChangingPassword(true);
            setTimeout(() => {
                setIsChangingPassword(false);
                setPasswordSuccess(true);
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }, 1500);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Cài đặt</h2>
            <div className="space-y-6">

                {/* 🔐 Thay đổi mật khẩu */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Thay đổi mật khẩu
                    </h3>

                    {passwordSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800">
                                Mật khẩu đã được thay đổi thành công!
                            </span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Mật khẩu hiện tại */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Mật khẩu hiện tại
                            </label>
                            <Input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Nhập mật khẩu hiện tại"
                                className={passwordErrors.currentPassword ? "border-red-500" : ""}
                            />
                            {passwordErrors.currentPassword && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {passwordErrors.currentPassword}
                                </p>
                            )}
                        </div>

                        {/* Mật khẩu mới */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Mật khẩu mới
                            </label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Nhập mật khẩu mới"
                                className={passwordErrors.newPassword ? "border-red-500" : ""}
                            />
                            {passwordErrors.newPassword && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {passwordErrors.newPassword}
                                </p>
                            )}
                            {passwordForm.newPassword &&
                                !passwordErrors.newPassword &&
                                passwordForm.newPassword.length >= 6 && (
                                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4" />
                                        Mật khẩu mạnh
                                    </p>
                                )}
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordInputChange}
                                placeholder="Xác nhận mật khẩu mới"
                                className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {passwordErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handlePasswordChange}
                            disabled={
                                isChangingPassword ||
                                !passwordForm.currentPassword ||
                                !passwordForm.newPassword ||
                                !passwordForm.confirmPassword
                            }
                            className="gap-2"
                        >
                            {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                        </Button>
                    </div>
                </div>

                {/* 🔔 Thông báo */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Thông báo
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm">Nhận thông báo về lịch khám sắp tới</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm">Nhận thông báo về kết quả khám</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">Nhận email quảng cáo và khuyến mãi</span>
                        </label>
                    </div>
                </div>

                {/* 🛡️ Quyền riêng tư */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Quyền riêng tư
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm">
                                Cho phép bác sĩ xem lịch sử khám của tôi
                            </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm">
                                Cho phép chia sẻ dữ liệu y tế với các cơ sở y tế khác
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </Card>
    );
}
