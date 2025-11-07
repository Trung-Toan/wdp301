import ReactDOM from "react-dom";

// Modal đẹp: backdrop blur + transition + trap focus đơn giản
export const ElegantModal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose} // click ngoài để đóng
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]" />

      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200
                     animate-[scaleIn_200ms_ease-out] px-6 pt-6 pb-6
                     max-h-[85vh] overflow-hidden flex flex-col"
          onMouseDown={(e) => e.stopPropagation()} // chặn đóng khi click trong panel
        >
          {children}
        </div>
      </div>

      {/* keyframes (tailwind arbitrary) */}
      <style>{`
        @keyframes fadeIn { from {opacity: 0} to {opacity: 1} }
        @keyframes scaleIn { from {opacity: 0; transform: translateY(8px) scale(.98)}
                             to   {opacity: 1; transform: translateY(0)   scale(1)} }
      `}</style>
    </div>,
    document.body
  );
};

// Input/textarea + lỗi đẹp, thống nhất
export const FormField = ({
  label,
  name,
  formik,
  as = "input",
  required = false,
  className = "",
  ...rest
}) => {
  const error = formik.touched[name] && formik.errors[name];
  const BaseTag = as;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <BaseTag
        id={name}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={
          "w-full rounded-xl border px-3 py-2 text-gray-900 shadow-sm transition " +
          (error
            ? "border-red-400 focus:ring-4 focus:ring-red-100 focus:border-red-400"
            : "border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400")
        }
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {typeof error === "string" ? error : "Giá trị không hợp lệ"}
        </p>
      )}
    </div>
  );
};
