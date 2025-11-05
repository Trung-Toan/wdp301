import { memo, useState, useEffect } from "react"; // Thêm useEffect
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
  Building2,
} from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap"; // Thêm Spinner

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterClinic, setFilterClinic] = useState("ALL");
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone_number: "",
    full_name: "",
    specialty_id: "",
    specialtyName: "",
    clinic_id: "",
  });

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
          toast.warn("Phòng khám chưa đăng ký chuyên khoa nào, hoặc API lỗi.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy chuyên khoa của phòng khám:", err);
        toast.error("Không thể lấy chuyên khoa của phòng khám: " + err.message);
      } finally {
        setLoadingSpecialties(false);
      }
    };
    fetchClinicSpecialties();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        toast.info("Chức năng chỉnh sửa đang phát triển");
        setShowModal(false);
        return;
      }

      if (!formData.clinic_id) {
        toast.error("Vui lòng chọn phòng khám");
        return;
      }

      const payload = {
        username: formData.username,
        password: formData.password,
        phone_number: formData.phone_number,
        full_name: formData.full_name,
        specialty_id: [formData.specialty_id],
        clinic_id: formData.clinic_id,
      };

      const res = await adminclinicAPI.createAccountDoctor(payload);
      if (res.data?.data) {
        toast.success("Tạo bác sĩ thành công");
        setShowModal(false);
        window.location.reload(); // refresh danh sách
      }
    } catch (err) {
      console.error("Lỗi khi tạo bác sĩ:", err);
      toast.error("Không thể tạo bác sĩ: " + err.message);
    }
  };

  const handleAddDoctor = () => {
    setEditingId(null);
    setFormData({
      username: "",
      password: "",
      phone_number: "",
      full_name: "",
      specialty_id: "",
      specialtyName: "",
      clinic_id: "",
    });
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
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clinicName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || doc.status === filterStatus;
    const matchesClinic = filterClinic === "ALL" || doc.clinicId === filterClinic;
    return matchesSearch && matchesStatus && matchesClinic;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bác sĩ</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleAddDoctor}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Thêm bác sĩ
          </button>
        </div>
      </div>

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

      {/* Bảng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Tên bác sĩ
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Phòng khám
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Chuyên khoa
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Điện thoại
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                  <button
                    onClick={() => handleToggleStatus(doctor.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${doctor.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="Xóa"
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

      {/* Modal thêm bác sĩ */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên bác sĩ
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên bác sĩ"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập username"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mật khẩu
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu"
                />

                {/* Nút con mắt */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phòng khám *
                </label>
                <select
                  required
                  value={formData.clinic_id}
                  onChange={(e) =>
                    setFormData({ ...formData, clinic_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn phòng khám --</option>
                  {clinics.map((clinic) => (
                    <option key={clinic._id} value={clinic._id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
                {clinics.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Chưa có phòng khám nào. Vui lòng tạo phòng khám trước.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Chuyên khoa *
                </label>

                {/* Ô tìm kiếm */}
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên khoa..."
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Dropdown cuộn */}
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
                  {/* Hiển thị loading */}
                  {loadingSpecialties ? (
                    <div className="flex justify-center items-center p-4">
                      <Spinner animation="border" size="sm" />
                      <span className="ml-2 text-sm text-gray-500">
                        Đang tải...
                      </span>
                    </div>
                  ) : (
                    // Hiển thị danh sách
                    specialties
                      .filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(searchSpecialty.toLowerCase())
                      )
                      .map((s) => (
                        <div
                          key={s._id}
                          onClick={() =>
                            setFormData({
                              ...formData,

                              specialty_id: s._id,
                              specialtyName: s.name,
                            })
                          }
                          className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${
                            formData.specialty_id === s._id
                              ? "bg-blue-100 text-blue-700 font-semibold"
                              : "text-gray-700"
                          }`}
                          _id
                        >
                          {s.name}
                        </div>
                      ))
                  )}
                  {/* Hiển thị nếu không có chuyên khoa */}
                  {!loadingSpecialties && specialties.length === 0 && (
                    <p className="p-3 text-sm text-gray-500 italic">
                      Không tìm thấy chuyên khoa nào. Vui lòng thêm chuyên khoa
                      tại trang "Tạo phòng khám".
                    </p>
                  )}
                </div>

                {/* Hiển thị chuyên khoa đã chọn */}
                {formData.specialtyName && (
                  <p className="text-sm text-gray-600 mt-2">
                    Đã chọn: <b>{formData.specialtyName}</b>
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingId ? "Cập nhật" : "Thêm bác sĩ"}
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
