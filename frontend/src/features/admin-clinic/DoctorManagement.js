import { memo, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
} from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";



const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState({
    id: "",
    name: "",
  });

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
      specialty_id: "",
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
      specialty_id: Yup.string().required("Chuyên khoa là bắt buộc"),
    }),
    onSubmit: (values) => {
      const payload = {
        ...values,
        specialty_id: [values.specialty_id],
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
    const fetchDoctors = async () => {
      try {
        const res = await adminclinicAPI.getDoctorsOfAdminClinic();
        const doctorsData = res.data?.data || [];
        const transformed = doctorsData.map((doc) => {
          const specialties = Array.isArray(doc.specialty_id)
            ? doc.specialty_id.map((s) => s.name).join(", ")
            : "N/A";
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
    setSelectedSpecialty({ id: "", name: "" });
    setShowModal(true);
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?")) {
      setDoctors(doctors.filter((doc) => doc.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setDoctors(
      doctors.map((doc) =>
        doc.id === id
          ? {
            ...doc,
            status: doc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          }
          : doc
      )
    );
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
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
            placeholder="Tìm kiếm bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
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
                  <button
                    onClick={() => handleToggleStatus(doctor.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${doctor.status === "ACTIVE"
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
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toast.info("Chức năng chỉnh sửa đang phát triển")
                      }
                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-11/12 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingId ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Tên bác sĩ */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tên bác sĩ
                </label>
                <input
                  name="full_name"
                  value={formik.values.full_name}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Nhập tên bác sĩ"
                />
                {formik.errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.full_name}
                  </p>
                )}
              </div>

              {/* Tên đăng nhập */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tên đăng nhập
                </label>
                <input
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Nhập username"
                />
                {formik.errors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.username}
                  </p>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="relative">
                <label className="block text-sm font-semibold mb-2">
                  Mật khẩu
                </label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm pr-10"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {formik.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Nhập email"
                />
                {formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Điện thoại
                </label>
                <input
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Nhập số điện thoại"
                />
                {formik.errors.phone_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.phone_number}
                  </p>
                )}
              </div>

              {/* Chuyên khoa */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Chuyên khoa
                </label>
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên khoa..."
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="w-full px-3 py-2 mb-2 border rounded-lg text-sm"
                />
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {loadingSpecialties ? (
                    <div className="flex justify-center items-center p-4">
                      <Spinner animation="border" size="sm" />
                      <span className="ml-2 text-sm text-gray-500">
                        Đang tải...
                      </span>
                    </div>
                  ) : (
                    specialties
                      .filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(searchSpecialty.toLowerCase())
                      )
                      .map((s) => (
                        <div
                          key={s._id}
                          onClick={() => {
                            formik.setFieldValue("specialty_id", s._id);
                            setSelectedSpecialty({
                              id: s._id,
                              name: s.name,
                            });
                          }}
                          className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${formik.values.specialty_id === s._id
                              ? "bg-blue-100 text-blue-700 font-semibold"
                              : "text-gray-700"
                            }`}
                        >
                          {s.name}
                        </div>
                      ))
                  )}
                </div>
                {formik.errors.specialty_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.specialty_id}
                  </p>
                )}
                {selectedSpecialty.name && (
                  <p className="text-sm text-gray-600 mt-2">
                    Đã chọn: <b>{selectedSpecialty.name}</b>
                  </p>
                )}
              </div>

              {/* Nút submit */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingDoctor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {creatingDoctor ? (
                    <>
                      <Spinner animation="border" size="sm" className="mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DoctorManagement);

