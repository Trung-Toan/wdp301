import React, { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Bell, Shield } from "lucide-react";
import Card from "../../../../../components/ui/Card";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";
import { profilePatientApi } from "../../../../../api/patients/profilePatientApi";
import { changePasswordApi } from "../../../../../api/auth/ChangePassword/changePasswordApi";
export default function SettingsTab() {
    /** ---------------- PASSWORD ---------------- */
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordFail, setPasswordFail] = useState("");

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const validatePassword = () => {
        const errors = {};
        if (!passwordForm.currentPassword) errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
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

    const handlePasswordChange = async () => {
        setPasswordSuccess(false);
        setPasswordFail("");
        const errors = validatePassword();
        setPasswordErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsChangingPassword(true);
            try {
                await changePasswordApi.changePassword({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                });
                setPasswordSuccess(true);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } catch (err) {
                console.error(err);
                setPasswordFail(err.response?.data?.message || err.message || "Đổi mật khẩu thất bại");
            } finally {
                setIsChangingPassword(false);
            }
        }
    };

    /** ---------------- SETTINGS ---------------- */
    const [settings, setSettings] = useState({
        notify_upcoming: true,
        notify_results: true,
        notify_marketing: false,
        privacy_allow_doctor_view: true,
        privacy_share_with_providers: true,
    });

    const [isSavingNotifications, setIsSavingNotifications] = useState(false);
    const [notificationsSuccess, setNotificationsSuccess] = useState(false);

    const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
    const [privacySuccess, setPrivacySuccess] = useState(false);

    const handleSaveNotifications = async () => {
        setIsSavingNotifications(true);
        setNotificationsSuccess(false);
        try {
            await profilePatientApi.updateSetting({
                notify_upcoming: settings.notify_upcoming,
                notify_results: settings.notify_results,
                notify_marketing: settings.notify_marketing,
            });
            setNotificationsSuccess(true);
        } catch (err) {
            console.error(err);
            setNotificationsSuccess(false);
        } finally {
            setIsSavingNotifications(false);
        }
    };

    const handleSavePrivacy = async () => {
        setIsSavingPrivacy(true);
        setPrivacySuccess(false);
        try {
            await profilePatientApi.updateSetting({
                privacy_allow_doctor_view: settings.privacy_allow_doctor_view,
                privacy_share_with_providers: settings.privacy_share_with_providers,
            });
            setPrivacySuccess(true);
        } catch (err) {
            console.error(err);
            setPrivacySuccess(false);
        } finally {
            setIsSavingPrivacy(false);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Cài đặt</h2>

            {/* ---------------- CHANGE PASSWORD ---------------- */}
            <div className="border-b pb-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Thay đổi mật khẩu
                </h3>

                {passwordSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">Mật khẩu đã được thay đổi thành công!</span>
                    </div>
                )}
                {passwordFail && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" /> {passwordFail}
                    </div>
                )}

                <div className="space-y-4">
                    <InputField label="Mật khẩu hiện tại" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordInputChange} error={passwordErrors.currentPassword} />
                    <InputField label="Mật khẩu mới" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordInputChange} error={passwordErrors.newPassword} />
                    <InputField label="Xác nhận mật khẩu mới" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordInputChange} error={passwordErrors.confirmPassword} />

                    <Button
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="gap-2"
                    >
                        {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </Button>
                </div>
            </div>

            {/* ---------------- NOTIFICATIONS ---------------- */}
            <div className="border-b pb-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Thông báo
                </h3>
                <div className="space-y-3">
                    <CheckboxField label="Nhận thông báo về lịch khám sắp tới" checked={settings.notify_upcoming} onChange={(e) => setSettings((prev) => ({ ...prev, notify_upcoming: e.target.checked }))} />
                    <CheckboxField label="Nhận thông báo về kết quả khám" checked={settings.notify_results} onChange={(e) => setSettings((prev) => ({ ...prev, notify_results: e.target.checked }))} />
                    <CheckboxField label="Nhận email quảng cáo và khuyến mãi" checked={settings.notify_marketing} onChange={(e) => setSettings((prev) => ({ ...prev, notify_marketing: e.target.checked }))} />

                    <Button onClick={handleSaveNotifications} disabled={isSavingNotifications} className="mt-2 gap-2">
                        {isSavingNotifications ? "Đang lưu..." : "Lưu thông báo"}
                    </Button>
                    {notificationsSuccess && <SuccessMessage message="Thông báo đã được cập nhật thành công!" />}
                </div>
            </div>

            {/* ---------------- PRIVACY ---------------- */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Quyền riêng tư
                </h3>
                <div className="space-y-3">
                    <CheckboxField label="Cho phép bác sĩ xem lịch sử khám của tôi" checked={settings.privacy_allow_doctor_view} onChange={(e) => setSettings((prev) => ({ ...prev, privacy_allow_doctor_view: e.target.checked }))} />
                    <CheckboxField label="Cho phép chia sẻ dữ liệu y tế với các cơ sở y tế khác" checked={settings.privacy_share_with_providers} onChange={(e) => setSettings((prev) => ({ ...prev, privacy_share_with_providers: e.target.checked }))} />

                    <Button onClick={handleSavePrivacy} disabled={isSavingPrivacy} className="mt-2 gap-2">
                        {isSavingPrivacy ? "Đang lưu..." : "Lưu quyền riêng tư"}
                    </Button>
                    {privacySuccess && <SuccessMessage message="Quyền riêng tư đã được cập nhật thành công!" />}
                </div>
            </div>
        </Card>
    );
}

// ---------------- HELPER COMPONENTS ----------------
const InputField = ({ label, name, type = "text", value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <Input type={type} name={name} value={value} onChange={onChange} placeholder={label} className={error ? "border-red-500" : ""} />
        {error && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {error}
            </p>
        )}
    </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4" />
        <span className="text-sm">{label}</span>
    </label>
);

const SuccessMessage = ({ message }) => (
    <div className="mt-2 text-green-600 flex items-center gap-2">
        <CheckCircle className="h-4 w-4" /> {message}
    </div>
);
