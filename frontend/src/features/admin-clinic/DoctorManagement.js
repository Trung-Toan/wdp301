import { memo, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Building2,
  X,
  Mail,
  Phone,
  User,
  GraduationCap,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { ElegantModal, FormField } from "./ElegantModal";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClinic, setFilterClinic] = useState("ALL");
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🧩 Mutation - Tạo bác sĩ
  const { mutate, isLoading: creatingDoctor } = useMutation({
    mutationFn: (payload) => adminclinicAPI.createAccountDoctor(payload),
    onSuccess: () => {
      toast.success("Tạo bác sĩ thành công!");
      setShowModal(false);
      formik.resetForm();
      window.location.reload();
    },
    onError: (error) => {
      console.error("Lỗi khi tạo bác sĩ:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tạo bác sĩ, thử lại!"
      );
    },
  });

  // 🧠 Formik + Yup
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone_number: "",
      full_name: "",
      specialty_id: [], // ✅ hỗ trợ nhiều chuyên khoa
    },
    validationSchema: Yup.object({
      full_name: Yup.string().trim().required("Tên bác sĩ là bắt buộc"),
      username: Yup.string().trim().required("Tên đăng nhập là bắt buộc"),
      password: Yup.string().trim().required("Mật khẩu là bắt buộc"),
      email: Yup.string()
        .trim()
        .email("Email không hợp lệ")
        .required("Email là bắt buộc"),
      phone_number: Yup.string()
        .trim()
        .matches(/^[0-9]{8,15}$/, "Số điện thoại không hợp lệ")
        .required("Số điện thoại là bắt buộc"),
      specialty_id: Yup.array()
        .of(Yup.string())
        .min(1, "Phải chọn ít nhất 1 chuyên khoa")
        .required("Chuyên khoa là bắt buộc"),
    }),
    onSubmit: (values) => {
      const payload = {
        ...values,
        specialty_id: values.specialty_id.map(String), // ✅ đảm bảo mảng string
      };
      mutate(payload);
    },
  });

  // 🏥 Lấy danh sách chuyên khoa của phòng khám
  useEffect(() => {
    const fetchClinicSpecialties = async () => {
      setLoadingSpecialties(true);
      try {
        const res = await adminclinicAPI.getClinicByAdmin();
        const clinicData = res.data?.data;

        if (clinicData && Array.isArray(clinicData.specialties)) {
          setSpecialties(clinicData.specialties);
        } else {
          setSpecialties([]);
          toast.warn("Phòng khám chưa đăng ký chuyên khoa hoặc API lỗi.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy chuyên khoa:", err);
        toast.error("Không thể lấy chuyên khoa: " + err.message);
      } finally {
        setLoadingSpecialties(false);
      }
    };
    fetchClinicSpecialties();
  }, []);

  // 👨‍⚕️ Lấy danh sách bác sĩ
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await adminclinicAPI.getAllClinics();
        const clinicsData = res.data?.data || [];
        setClinics(clinicsData);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phòng khám:", err);
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await adminclinicAPI.getDoctorsOfAdminClinic();
        const doctorsData = res.data?.data || [];
        const transformed = doctorsData.map((doc) => {
          const specialties = Array.isArray(doc.specialty_id)
            ? doc.specialty_id.map((s) => s.name).join(", ")
            : "N/A";

          const clinic = doc.clinic_id;
          const clinicName = clinic?.name || "Không xác định";
          const clinicId = clinic?._id?.toString() || null;

          return {
            id: doc._id,
            name: doc.user_id?.full_name || "Không rõ",
            avatar: doc.user_id?.avatar_url || null,
            specialty: specialties,
            email: doc.user_id?.account_id?.email || "N/A",
            phone: doc.user_id?.account_id?.phone_number || "N/A",
            status:
              doc.user_id?.account_id?.status === "ACTIVE"
                ? "ACTIVE"
                : "INACTIVE",
            clinicId: clinicId,
            clinicName: clinicName,
            doctorData: doc,
          };
        });
        setDoctors(transformed);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bác sĩ:", err);
        toast.error("Không thể lấy danh sách bác sĩ: " + err.message);
      }
    };
    fetchDoctors();
  }, []);

  const handleAddDoctor = () => {
    setEditingId(null);
    formik.resetForm();
    setShowModal(true);
  };


  const handleViewDetail = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản bác sĩ này? Hành động này không thể hoàn tác.")) {
      return;
    }
    
    try {
      const res = await adminclinicAPI.deleteDoctor(id);
      
      if (res.data?.ok) {
        setDoctors(doctors.filter((doc) => doc.id !== id));
        toast.success(res.data.message || "Xóa tài khoản bác sĩ thành công");
      } else {
        toast.error(res.data?.message || "Không thể xóa bác sĩ");
      }
    } catch (err) {
      console.error("Lỗi khi xóa bác sĩ:", err);
      const errorMessage = err.response?.data?.message || err.message || "Không thể xóa bác sĩ";
      toast.error(errorMessage);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.clinicName && doc.clinicName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClinic = filterClinic === "ALL" || doc.clinicId === filterClinic;
    return matchesSearch && matchesClinic;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bác sĩ</h1>

        <button
          onClick={handleAddDoctor}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} /> Thêm bác sĩ
        </button>
      </div>

      {/* Bộ lọc & tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ, chuyên khoa, email, phòng khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        <select
          value={filterClinic}
          onChange={(e) => setFilterClinic(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả phòng khám</option>
          {clinics.map((clinic) => (
            <option key={clinic._id} value={clinic._id}>
              {clinic.name}
            </option>
          ))}
        </select>

      </div>

      {/* Bảng danh sách bác sĩ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Tên bác sĩ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Phòng khám
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Chuyên khoa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Điện thoại
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr
                key={doctor.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {doctor.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">
                      {doctor.clinicName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {doctor.specialty}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doctor.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doctor.phone}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      doctor.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {doctor.status === "ACTIVE" ? (
                      <>
                        <CheckCircle size={16} /> Hoạt động
                      </>
                    ) : (
                      <>
                        <XCircle size={16} /> Không hoạt động
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(doctor)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Formik */}
      {showModal && (
        <ElegantModal onClose={() => setShowModal(false)}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center ring-1 ring-blue-200">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
                </h2>
                <p className="text-sm text-gray-500">
                  Điền thông tin tài khoản & chọn chuyên khoa
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="shrink-0 rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <XCircle size={22} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

          {/* Content (scrollable) */}
          <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
            {/* Họ tên */}
            <FormField
              label="Tên bác sĩ"
              name="full_name"
              required
              placeholder="vd: Trần Minh Khôi"
              formik={formik}
            />

            {/* Username + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Tên đăng nhập"
                name="username"
                required
                placeholder="vd: minh.khoi"
                formik={formik}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập mật khẩu"
                    className={
                      "w-full rounded-xl border px-3 py-2 text-gray-900 shadow-sm transition pr-10 " +
                      (formik.touched.password && formik.errors.password
                        ? "border-red-400 focus:ring-4 focus:ring-red-100 focus:border-red-400"
                        : "border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                required
                placeholder="vd: email@domain.com"
                formik={formik}
              />
              <FormField
                label="Số điện thoại"
                name="phone_number"
                required
                placeholder="vd: 0912345678"
                formik={formik}
              />
            </div>

            {/* Chuyên khoa (multi-select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyên khoa <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Tìm kiếm chuyên khoa..."
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-2"
              />

              <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                {loadingSpecialties ? (
                  <div className="flex justify-center items-center p-4 text-sm text-gray-500">
                    <Spinner animation="border" size="sm" />
                    <span className="ml-2">Đang tải...</span>
                  </div>
                ) : (
                  specialties
                    .filter((s) =>
                      s.name.toLowerCase().includes((searchSpecialty || "").toLowerCase())
                    )
                    .map((s) => {
                      const id = String(s._id);
                      const isSelected = formik.values.specialty_id.includes(id);
                      return (
                        <button
                          type="button"
                          key={s._id}
                          onClick={() => {
                            const next = new Set(formik.values.specialty_id);
                            if (isSelected) next.delete(id);
                            else next.add(id);
                            formik.setFieldValue("specialty_id", Array.from(next));
                          }}
                          className={
                            "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                            (isSelected
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700")
                          }
                        >
                          <span>{s.name}</span>
                          {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                        </button>
                      );
                    })
                )}
              </div>

              {formik.touched.specialty_id && formik.errors.specialty_id && (
                <p className="text-xs text-red-600 mt-1">
                  {formik.errors.specialty_id}
                </p>
              )}

              {formik.values.specialty_id.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Đã chọn:{" "}
                  <b>
                    {specialties
                      .filter((s) => formik.values.specialty_id.includes(String(s._id)))
                      .map((s) => s.name)
                      .join(", ")}
                  </b>
                </p>
              )}
            </div>
          </div>

          {/* Footer sticky */}
          <div className="sticky -mb-6 mt-6 bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-white to-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={formik.handleSubmit}
                disabled={creatingDoctor}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60"
              >
                {creatingDoctor ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </ElegantModal>
      )}

      {/* Modal xem chi tiết bác sĩ */}
      {showDetailModal && selectedDoctor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết bác sĩ
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phòng khám</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.clinicName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Chuyên khoa</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-1">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          selectedDoctor.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.status === "ACTIVE"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Điện thoại</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết từ doctorData */}
              {selectedDoctor.doctorData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin bổ sung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDoctor.doctorData.title && (
                      <div>
                        <p className="text-sm text-gray-600">Chức danh</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedDoctor.doctorData.title}
                        </p>
                      </div>
                    )}
                    {selectedDoctor.doctorData.degree && (
                      <div>
                        <p className="text-sm text-gray-600">Học vị</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedDoctor.doctorData.degree}
                        </p>
                      </div>
                    )}
                    {selectedDoctor.doctorData.experience && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Kinh nghiệm</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedDoctor.doctorData.experience}
                        </p>
                      </div>
                    )}
                    {selectedDoctor.doctorData.description && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Mô tả</p>
                        <p className="text-sm text-gray-900">
                          {selectedDoctor.doctorData.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteDoctor(selectedDoctor.id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DoctorManagement);
