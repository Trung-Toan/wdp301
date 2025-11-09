import { memo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Spinner } from "react-bootstrap";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import { doctorApi } from "../../api/doctor/doctorApi";

const DoctorChangePassword = () => {
  // State quản lý việc hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // --- Yup Validation Schema ---
  const ChangePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string()
      .required("Mật khẩu hiện tại là bắt buộc.")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    newPassword: Yup.string()
      .required("Mật khẩu mới là bắt buộc.")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự.")
      .notOneOf(
        [Yup.ref("oldPassword")],
        "Mật khẩu mới không được giống mật khẩu cũ."
      ),
    confirmPassword: Yup.string()
      .required("Xác nhận mật khẩu là bắt buộc.")
      .oneOf([Yup.ref("newPassword"), null], "Mật khẩu xác nhận không khớp."),
  });

  // --- Initial Values ---
  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // --- Submit Handler ---
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  const { oldPassword, newPassword } = values;
  setSubmitting(true);

  try {
    const res = await doctorApi.putChangePassword({ oldPassword, newPassword });
    console.log("res: ", res);
    if (res?.data?.ok) {
      toast.success(res?.data?.message || "Đổi mật khẩu thành công!");
      resetForm();
      setShowPassword({ old: false, new: false, confirm: false });
    } else {
      toast.error(res?.data?.message || "Lỗi đổi mật khẩu. Vui lòng thử lại!");
    }
  } catch (error) {
    // lấy message ưu tiên từ server
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Lỗi đổi mật khẩu. Vui lòng thử lại!";
    toast.error(msg);
  } finally {
    setSubmitting(false);
  }
};


  // Helper component cho Input field với tính năng ẩn/hiện mật khẩu
  const PasswordInputField = ({ label, name, isShown, toggleShow }) => (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <Field
        name={name}
        type={isShown ? "text" : "password"}
        className="w-full border border-gray-300 rounded-xl p-3 pr-12 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 shadow-sm"
      />

      <span
        className="absolute right-3 top-1/2 mt-0.5 transform -translate-y-1/2 text-gray-500 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition"
        onClick={toggleShow}
        title={isShown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {isShown ? <EyeOff size={20} /> : <Eye size={20} />}
      </span>

      {/* Hiển thị lỗi từ Formik/Yup */}
      <ErrorMessage name={name}>
        {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
      </ErrorMessage>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-2xl p-8 lg:p-10 border border-gray-100">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4 shadow-md">
            <LockKeyhole size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Đổi mật khẩu
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Bảo mật thông tin tài khoản của bạn
          </p>
        </div>

        {/* --- Formik Wrapper --- */}
        <Formik
          initialValues={initialValues}
          validationSchema={ChangePasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-6">
              {/* Mật khẩu cũ */}
              <PasswordInputField
                label="Mật khẩu hiện tại"
                name="oldPassword"
                isShown={showPassword.old}
                toggleShow={() =>
                  setShowPassword({ ...showPassword, old: !showPassword.old })
                }
              />

              {/* Mật khẩu mới */}
              <PasswordInputField
                label="Mật khẩu mới (ít nhất 6 ký tự)"
                name="newPassword"
                isShown={showPassword.new}
                toggleShow={() =>
                  setShowPassword({ ...showPassword, new: !showPassword.new })
                }
              />

              {/* Xác nhận mật khẩu */}
              <PasswordInputField
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                isShown={showPassword.confirm}
                toggleShow={() =>
                  setShowPassword({
                    ...showPassword,
                    confirm: !showPassword.confirm,
                  })
                }
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 disabled:bg-gray-400"
                disabled={isSubmitting || !isValid} // Vô hiệu hóa nút khi đang gửi hoặc form không hợp lệ
              >
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={20} />
                    Xác nhận đổi mật khẩu
                  </>
                )}
              </Button>
            </Form>
          )}
        </Formik>
        {/* --- End Formik Wrapper --- */}
      </div>
    </div>
  );
};

export default memo(DoctorChangePassword);
