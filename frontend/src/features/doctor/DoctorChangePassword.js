import { memo, useState } from "react";
import { Button } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";

const DoctorChangePassword = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Sau này bạn sẽ gọi API đổi mật khẩu tại đây
    console.log("Dữ liệu đổi mật khẩu:", passwords);
    alert("Đổi mật khẩu thành công (demo)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Đổi mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mật khẩu cũ */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type={showPassword.old ? "text" : "password"}
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <span
              className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
              onClick={() =>
                setShowPassword({ ...showPassword, old: !showPassword.old })
              }
            >
              {showPassword.old ? <EyeSlash size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Mật khẩu mới */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu mới
            </label>
            <input
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <span
              className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
              onClick={() =>
                setShowPassword({ ...showPassword, new: !showPassword.new })
              }
            >
              {showPassword.new ? <EyeSlash size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <span
              className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
            >
              {showPassword.confirm ? (
                <EyeSlash size={20} />
              ) : (
                <Eye size={20} />
              )}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Xác nhận đổi mật khẩu
          </Button>
        </form>
      </div>
    </div>
  );
};

export default memo(DoctorChangePassword);
