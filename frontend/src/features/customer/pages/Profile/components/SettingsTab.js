import React, { useState } from "react";
import {
    Lock,
    CheckCircle,
    AlertCircle,
    Bell,
    Shield,
    Settings,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";
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

        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword) {
            errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else {
            if (newPassword.length < 8) {
                errors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
            }
            if (!/[A-Z]/.test(newPassword)) {
                errors.newPassword = "Mật khẩu phải có ít nhất 1 chữ hoa";
            }
            if (!/[a-z]/.test(newPassword)) {
                errors.newPassword = "Mật khẩu phải có ít nhất 1 chữ thường";
            }
            if (!/[0-9]/.test(newPassword)) {
                errors.newPassword = "Mật khẩu phải có ít nhất 1 chữ số";
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                errors.newPassword = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
            }
        }
        if (confirmPassword !== newPassword) {
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

    const token = sessionStorage.getItem("token")?.replace(/^"|"$/g, "");
    if (!token) {
        return (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-700 font-semibold text-lg">Vui lòng đăng nhập để xem cài đặt</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                    <Settings className="h-6 w-6 text-sky-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cài đặt</h2>
            </div>

            {/* ---------------- CHANGE PASSWORD ---------------- */}
            <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Lock className="h-5 w-5 text-sky-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Thay đổi mật khẩu</h3>
                </div>

                {passwordSuccess && (
                    <Message type="success" text="Mật khẩu đã được thay đổi thành công!" />
                )}
                {passwordFail && <Message type="error" text={passwordFail} />}

                <div className="space-y-5">
                    <InputField
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        error={passwordErrors.currentPassword}
                        icon={Lock}
                    />
                    <InputField
                        label="Mật khẩu mới"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        error={passwordErrors.newPassword}
                        icon={Lock}
                    />
                    <InputField
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        error={passwordErrors.confirmPassword}
                        icon={Lock}
                    />

                    <button
                        onClick={handlePasswordChange}
                        disabled={
                            isChangingPassword ||
                            !passwordForm.currentPassword ||
                            !passwordForm.newPassword ||
                            !passwordForm.confirmPassword
                        }
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isChangingPassword ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <Lock className="h-4 w-4" />
                                Cập nhật mật khẩu
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ---------------- NOTIFICATIONS ---------------- */}
            <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Bell className="h-5 w-5 text-sky-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Thông báo</h3>
                </div>
                <div className="space-y-4">
                    <CheckboxField
                        label="Nhận thông báo về lịch khám sắp tới"
                        checked={settings.notify_upcoming}
                        onChange={(e) =>
                            setSettings((prev) => ({ ...prev, notify_upcoming: e.target.checked }))
                        }
                    />
                    <CheckboxField
                        label="Nhận thông báo về kết quả khám"
                        checked={settings.notify_results}
                        onChange={(e) =>
                            setSettings((prev) => ({ ...prev, notify_results: e.target.checked }))
                        }
                    />
                    <CheckboxField
                        label="Nhận email quảng cáo và khuyến mãi"
                        checked={settings.notify_marketing}
                        onChange={(e) =>
                            setSettings((prev) => ({ ...prev, notify_marketing: e.target.checked }))
                        }
                    />

                    <button
                        onClick={handleSaveNotifications}
                        disabled={isSavingNotifications}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSavingNotifications ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Bell className="h-4 w-4" />
                                Lưu thông báo
                            </>
                        )}
                    </button>
                    {notificationsSuccess && <Message type="success" text="Thông báo đã được cập nhật thành công!" />}
                </div>
            </div>

            {/* ---------------- PRIVACY ---------------- */}
            <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <Shield className="h-5 w-5 text-sky-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Quyền riêng tư</h3>
                </div>
                <div className="space-y-4">
                    <CheckboxField
                        label="Cho phép bác sĩ xem lịch sử khám của tôi"
                        checked={settings.privacy_allow_doctor_view}
                        onChange={(e) =>
                            setSettings((prev) => ({ ...prev, privacy_allow_doctor_view: e.target.checked }))
                        }
                    />
                    <CheckboxField
                        label="Cho phép chia sẻ dữ liệu y tế với các cơ sở y tế khác"
                        checked={settings.privacy_share_with_providers}
                        onChange={(e) =>
                            setSettings((prev) => ({ ...prev, privacy_share_with_providers: e.target.checked }))
                        }
                    />

                    <button
                        onClick={handleSavePrivacy}
                        disabled={isSavingPrivacy}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSavingPrivacy ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Shield className="h-4 w-4" />
                                Lưu quyền riêng tư
                            </>
                        )}
                    </button>
                    {privacySuccess && <Message type="success" text="Quyền riêng tư đã được cập nhật thành công!" />}
                </div>
            </div>
        </div>
    );
}

// ---------------- HELPER COMPONENTS ----------------  
const InputField = ({ label, name, type = "text", value, onChange, error, icon: Icon }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-sky-600" />}
                {label}
            </label>
            <div className="relative">
                <input
                    type={isPassword && showPassword ? "text" : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={label}
                    className={`w-full pl-12 ${isPassword ? "pr-12" : "pr-4"} py-3.5 border-2 ${
                        error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-sky-500 focus:ring-sky-500"
                    } rounded-xl focus:ring-2 focus:ring-offset-0 font-medium hover:border-sky-300 transition-colors outline-none bg-white`}
                />
                {Icon && !isPassword && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                )}
                {isPassword && (
                    <>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </>
                )}
            </div>
            {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
};

const CheckboxField = ({ label, checked, onChange }) => (
    <label className="flex items-start gap-3 cursor-pointer group bg-white/60 border border-gray-200 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all">
        <div className="relative flex-shrink-0 mt-0.5">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-sky-600 peer-checked:border-sky-600 transition-all flex items-center justify-center group-hover:border-sky-400">
                {checked && <CheckCircle className="h-3.5 w-3.5 text-white" />}
            </div>
        </div>
        <span className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1">{label}</span>
    </label>
);

const Message = ({ type, text }) => {
    const isSuccess = type === "success";
    return (
        <div
            className={`mb-4 p-4 border-2 rounded-xl flex items-start gap-3 ${
                isSuccess
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
                    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800"
            }`}
        >
            {isSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium flex-1">{text}</p>
        </div>
    );
};
