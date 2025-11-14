import { memo, useCallback, useEffect, useMemo, useState } from "react";
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

/**
 * DoctorManagement
 * - Chọn phòng khám bằng list + search
 * - Sau khi chọn clinic -> tự động gọi API để lấy chuyên khoa của clinic đó
 * - Áp dụng cho cả modal Tạo bác sĩ và modal Xem chi tiết
 * - BỎ window.location.reload(); thay bằng refetch dữ liệu & cập nhật state cục bộ
 */
const DoctorManagement = () => {
  // ======= Lists & UI =======
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Tìm kiếm & lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClinic, setFilterClinic] = useState("ALL");

  // Password toggle (create)
  const [showPassword, setShowPassword] = useState(false);

  // ======= CREATE modal: chọn clinic -> load specialties theo clinic =======
  const [searchClinic, setSearchClinic] = useState("");
  const filteredClinicCreate = useMemo(
    () =>
      clinics.filter((c) =>
        (c.name || "")
          .toLowerCase()
          .includes((searchClinic || "").toLowerCase())
      ),
    [clinics, searchClinic]
  );

  const [createSpecs, setCreateSpecs] = useState([]); // [{id,name}]
  const [loadingCreateSpecs, setLoadingCreateSpecs] = useState(false);
  const [searchSpecCreate, setSearchSpecCreate] = useState("");

  // ======= DETAIL modal: đổi clinic -> tự load specialties theo clinic =======
  const [detailClinicId, setDetailClinicId] = useState("");
  const [detailSearchClinic, setDetailSearchClinic] = useState("");
  const filteredClinicDetail = useMemo(
    () =>
      clinics.filter((c) =>
        (c.name || "")
          .toLowerCase()
          .includes((detailSearchClinic || "").toLowerCase())
      ),
    [clinics, detailSearchClinic]
  );

  const [detailSpecialties, setDetailSpecialties] = useState([]); // [{id,name}]
  const [detailLoadingSpecs, setDetailLoadingSpecs] = useState(false);
  const [detailSelectedSpecIds, setDetailSelectedSpecIds] = useState([]); // ["id1","id2"]
  const [detailSearchSpec, setDetailSearchSpec] = useState("");
  // ======= Helpers =======
  const sameSet = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    const s = new Set(a.map(String));
    return b.every((x) => s.has(String(x)));
  };

  const mapSpec = (s) => ({
    id: String(s?._id ?? s?.id ?? s?.value ?? s),
    name: s?.name ?? s?.label ?? String(s),
  });

  const transformDoctor = (doc) => {
    const specialties = Array.isArray(doc.specialty_id)
      ? doc.specialty_id.map((s) => s?.name || s).join(", ")
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
        doc.user_id?.account_id?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      clinicId,
      clinicName,
      doctorData: doc,
    };
  };

  // Ưu tiên gọi API chuyên biệt, fallback khi không có
  const getSpecialtiesOfClinic = async (clinicId) => {
    try {
      if (!clinicId) return [];
      // 1) API chuyên biệt
      if (typeof adminclinicAPI.getSpecialtiesByClinic === "function") {
        const res = await adminclinicAPI.getSpecialtiesByClinic(clinicId);
        const arr = res?.data?.data || res?.data?.specialties || [];
        return (arr || []).map(mapSpec);
      }
      // 2) API lấy detail clinic
      if (typeof adminclinicAPI.getClinicDetail === "function") {
        const res = await adminclinicAPI.getClinicDetail(clinicId);
        const arr = res?.data?.data?.specialties || [];
        return (arr || []).map(mapSpec);
      }
      // 3) Fallback từ danh sách clinics sẵn có
      const clinic = clinics.find((c) => String(c._id) === String(clinicId));
      const arr = clinic?.specialties || [];
      return (arr || []).map(mapSpec);
    } catch (e) {
      console.error("Lỗi lấy chuyên khoa theo clinic:", e);
      return [];
    }
  };

  // ======= Refetch functions (không reload trang) =======
  const fetchClinics = useCallback(async () => {
    try {
      const res = await adminclinicAPI.getAllClinics();
      const clinicsData = res?.data?.data || [];
      setClinics(clinicsData);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phòng khám:", err);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await adminclinicAPI.getDoctorsOfAdminClinic();
      const doctorsData = res?.data?.data || [];
      setDoctors(doctorsData.map(transformDoctor));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", err);
      toast.error(
        "Không thể lấy danh sách bác sĩ: " +
        (err?.message || "Lỗi không xác định")
      );
    }
  }, []);

  // ======= Mutations =======
  const { mutate: createDoctor, isLoading: creatingDoctor } = useMutation({
    mutationFn: (payload) => adminclinicAPI.createAccountDoctor(payload),
    onSuccess: async (res) => {
      toast.success(res?.data?.message || "Tạo bác sĩ thành công!");
      await fetchDoctors();
      formik.resetForm();
      setCreateSpecs([]);
      setSearchSpecCreate("");
      setShowPassword(false);
      setShowModal(false);
    },
    onError: (error) => {
      console.error("Lỗi khi tạo bác sĩ:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tạo bác sĩ, thử lại!"
      );
    },
  });

  // Cập nhật clinic cho bác sĩ (detail modal)
  const { mutate: updateDoctorClinic, isLoading: updatingClinic } = useMutation(
    {
      mutationFn: async ({ doctorId, clinicId }) => {
        if (typeof adminclinicAPI.updateDoctorClinic === "function") {
          return adminclinicAPI.updateDoctorClinic({
            doctor_id: doctorId,
            clinic_id: clinicId,
          });
        }
        if (typeof adminclinicAPI.updateDoctor === "function") {
          return adminclinicAPI.updateDoctor({
            doctor_id: doctorId,
            clinic_id: clinicId,
          });
        }
        if (typeof adminclinicAPI.assignClinicToDoctor === "function") {
          return adminclinicAPI.assignClinicToDoctor(doctorId, clinicId);
        }
        throw new Error("Chưa có API cập nhật clinic cho bác sĩ.");
      },
      onSuccess: async (res, { doctorId, clinicId }) => {
        const clinicName =
          clinics.find((c) => String(c._id) === String(clinicId))?.name ||
          "Không xác định";
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === doctorId ? { ...d, clinicId, clinicName } : d
          )
        );
        setSelectedDoctor((prev) =>
          prev ? { ...prev, clinicId, clinicName } : prev
        );
        toast.success(res?.data?.message || "Đã cập nhật phòng khám.");

        await fetchDoctors();
        if (detailClinicId) {
          const specs = await getSpecialtiesOfClinic(detailClinicId);
          setDetailSpecialties(specs);
          setDetailSelectedSpecIds([]);
        }
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
          error.message ||
          "Không thể cập nhật phòng khám."
        );
      },
    }
  );

  // Cập nhật chuyên khoa cho bác sĩ (detail modal)
  const { mutate: updateDoctorSpecialties, isLoading: updatingSpecs } =
    useMutation({
      mutationFn: async ({ doctorId, specialtyIds }) => {
        if (typeof adminclinicAPI.updateDoctorSpecialties === "function") {
          return adminclinicAPI.updateDoctorSpecialties({
            doctor_id: doctorId,
            specialty_id: specialtyIds,
          });
        }
        if (typeof adminclinicAPI.updateDoctor === "function") {
          return adminclinicAPI.updateDoctor({
            doctor_id: doctorId,
            specialty_id: specialtyIds,
          });
        }
        if (typeof adminclinicAPI.assignSpecialtiesToDoctor === "function") {
          return adminclinicAPI.assignSpecialtiesToDoctor(
            doctorId,
            specialtyIds
          );
        }
        throw new Error("Chưa có API cập nhật chuyên khoa cho bác sĩ.");
      },
      onSuccess: async (res, { doctorId, specialtyIds }) => {
        const names = detailSpecialties
          .filter((sp) => specialtyIds.includes(String(sp.id)))
          .map((sp) => sp.name)
          .join(", ");

        // Optimistic UI
        setDoctors((prev) =>
          prev.map((d) => (d.id === doctorId ? { ...d, specialty: names } : d))
        );

        setSelectedDoctor((prev) =>
          prev
            ? {
              ...prev,
              specialty: names,
              doctorData: {
                ...prev.doctorData,
                specialty_id: specialtyIds,
              },
            }
            : prev
        );

        toast.success(res?.data?.message || "Đã cập nhật chuyên khoa.");
        // Refetch để đồng bộ dữ liệu (nếu backend trả khác)
        await fetchDoctors();
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
          error.message ||
          "Không thể cập nhật chuyên khoa."
        );
      },
    });

  // ======= Formik (CREATE) =======
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone_number: "",
      full_name: "",
      specialty_id: [], // IDs theo clinic đã chọn
      clinic_id: "",
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
      clinic_id: Yup.string().required("Phải chọn phòng khám"),
    }),
    onSubmit: (values) => {
      const payload = {
        ...values,
        specialty_id: values.specialty_id.map(String),
        clinic_id: String(values.clinic_id),
      };
      createDoctor(payload);
    },
  });

  // Khi chọn clinic ở CREATE -> tự load specialties của clinic đó
  useEffect(() => {
    const cid = formik.values.clinic_id;
    let mounted = true;

    const run = async () => {
      if (!cid) {
        setCreateSpecs([]);
        formik.setFieldValue("specialty_id", []);
        return;
      }
      setLoadingCreateSpecs(true);
      const specs = await getSpecialtiesOfClinic(cid);
      if (!mounted) return;
      setCreateSpecs(specs);

      // Giữ lại giao cắt với danh sách hợp lệ của clinic
      const allowed = new Set(specs.map((s) => String(s.id)));
      const next = (formik.values.specialty_id || []).filter((id) =>
        allowed.has(String(id))
      );
      formik.setFieldValue("specialty_id", next);
      setLoadingCreateSpecs(false);
    };

    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.clinic_id]);

  // ======= Load dữ liệu ban đầu =======
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await Promise.all([fetchClinics(), fetchDoctors()]);
      if (!mounted) return;
    };

    init();
    return () => {
      mounted = false;
    };
  }, [fetchClinics, fetchDoctors]);

  // ======= Handlers =======
  const handleAddDoctor = () => {
    formik.resetForm();
    setSearchClinic("");
    setSearchSpecCreate("");
    setCreateSpecs([]);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleViewDetail = (doctor) => {
    setSelectedDoctor(doctor);
    setDetailClinicId(doctor.clinicId || "");
    setDetailSearchClinic("");
    // preset các chuyên khoa hiện tại
    const currentSpecIds = (doctor?.doctorData?.specialty_id || []).map((s) =>
      String(s?._id ?? s)
    );
    setDetailSelectedSpecIds(currentSpecIds);
    setDetailSearchSpec("");
    setShowDetailModal(true);
  };

  const handleDeleteDoctor = async (id, status ) => {
    if (
      !window.confirm(
        "Bạn có muốn khóa tài khoản này không?"
      )
    ) {
      return;
    }
    status = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await adminclinicAPI.deleteDoctor(id, status);
      if (res?.data?.ok) {
        // Xoá ngay trong state mà không reload
        setDoctors((prev) => prev.filter((doc) => doc.id !== id));
        // Nếu đang mở modal chi tiết của người vừa xoá -> đóng modal
        setShowDetailModal((open) =>
          open && selectedDoctor?.id === id ? false : open
        );
        if (selectedDoctor?.id === id) setSelectedDoctor(null);
        toast.success(res?.data?.message || "Xóa tài khoản bác sĩ thành công");
      } else {
        toast.error(res?.data?.message || "Không thể xóa bác sĩ");
      }
    } catch (err) {
      console.error("Lỗi khi xóa bác sĩ:", err);
      toast.error(
        err?.response?.data?.message || err.message || "Không thể xóa bác sĩ"
      );
    }
  };

  // Khi đổi clinic ở DETAIL -> tự load specialties của clinic đó
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!detailClinicId) {
        setDetailSpecialties([]);
        setDetailSelectedSpecIds([]);
        return;
      }
      setDetailLoadingSpecs(true);
      const specs = await getSpecialtiesOfClinic(detailClinicId);
      if (!mounted) return;
      setDetailSpecialties(specs);
      // Giữ lại giao cắt lựa chọn cũ
      const allowed = new Set(specs.map((s) => String(s.id)));
      setDetailSelectedSpecIds((prev) =>
        prev.filter((id) => allowed.has(String(id)))
      );
      setDetailLoadingSpecs(false);
    };
    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailClinicId, clinics]);

  // Lọc danh sách bác sĩ
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      (doc.name || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (doc.specialty || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (doc.email || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (doc.clinicName || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase());

    const matchesClinic =
      filterClinic === "ALL" || doc.clinicId === filterClinic;
    return matchesSearch && matchesClinic;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
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
                {/* name doctor */}
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {doctor.name}
                </td>
                {/* name clinic */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">
                      {doctor.clinicName}
                    </span>
                  </div>
                </td>
                {/* specialty */}
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {doctor.specialty}
                  </span>
                </td>
                {/* email */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doctor.email}
                </td>
                {/* phone number */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doctor.phone}
                </td>
                {/* status */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${doctor.status === "ACTIVE"
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
                {/* actions */}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {/* --- Nút 1: Xem (Giữ nguyên làm chuẩn) --- */}
                    <button
                      onClick={() => handleViewDetail(doctor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                      <span className="text-sm font-medium">Xem</span>
                    </button>

                    {/* --- Nút 2: Khóa / Mở (Cập nhật style) --- */}
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id, doctor.status)}
                      // THAY ĐỔI: Dùng 'px-3 py-1.5' và 'gap-1.5' giống nút "Xem"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors
        ${doctor.status === "ACTIVE"
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                        }
      `}
                      title={
                        doctor.status === "ACTIVE"
                          ? "Chuyển thành không hoạt động"
                          : "Chuyển thành hoạt động"
                      }
                    >
                      {doctor.status === "ACTIVE" ? (
                        <>
                          <XCircle size={18} />
                          {/* THAY ĐỔI: Bọc text trong <span> để đồng bộ font */}
                          <span className="text-sm font-medium">Khóa</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          {/* THAY ĐỔI: Bọc text trong <span> để đồng bộ font */}
                          <span className="text-sm font-medium">Mở</span>
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDoctors.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Không có bác sĩ phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo bác sĩ */}
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
                  Thêm bác sĩ mới
                </h2>
                <p className="text-sm text-gray-500">
                  Điền thông tin tài khoản, chọn phòng khám & chuyên khoa
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="shrink-0 rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <XCircle
                size={22}
                className="text-gray-500 hover:text-gray-700"
              />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

          {/* Content */}
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

            {/* PHÒNG KHÁM (single-select bằng list) */}
            <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phòng khám <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Tìm phòng khám..."
                value={searchClinic}
                onChange={(e) => setSearchClinic(e.target.value)}
                onBlur={() => formik.setFieldTouched("clinic_id", true)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-2"
              />

              <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                {clinics.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    Chưa có phòng khám.
                  </div>
                ) : (
                  filteredClinicCreate.map((c) => {
                    const id = String(c._id);
                    const isSelected = formik.values.clinic_id === id;
                    return (
                      <button
                        type="button"
                        key={c._id}
                        onClick={() => formik.setFieldValue("clinic_id", id)}
                        className={
                          "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                          (isSelected
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "hover:bg-gray-50 text-gray-700")
                        }
                      >
                        <span className="flex items-center gap-2">
                          <Building2 size={16} className="text-gray-400" />
                          {c.name}
                        </span>
                        {isSelected && (
                          <CheckCircle size={16} className="text-blue-600" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {formik.touched.clinic_id && formik.errors.clinic_id && (
                <p className="text-xs text-red-600 mt-2">
                  {formik.errors.clinic_id}
                </p>
              )}

              {formik.values.clinic_id && (
                <p className="text-sm text-gray-600 mt-2">
                  Đã chọn:{" "}
                  <b>
                    {clinics.find(
                      (c) => String(c._id) === String(formik.values.clinic_id)
                    )?.name || "—"}
                  </b>
                </p>
              )}
            </div>

            {/* CHUYÊN KHOA (multi-select bằng list, theo clinic đã chọn) */}
            <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chuyên khoa <span className="text-red-500">*</span>
              </label>

              {!formik.values.clinic_id ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                  Hãy chọn <b>Phòng khám</b> trước để hiển thị danh sách chuyên
                  khoa.
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Tìm kiếm chuyên khoa..."
                    value={searchSpecCreate}
                    onChange={(e) => setSearchSpecCreate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-3"
                  />

                  <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 p-1">
                    {loadingCreateSpecs ? (
                      <div className="flex justify-center items-center p-4 text-sm text-gray-500">
                        <Spinner animation="border" size="sm" />
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    ) : createSpecs.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        Phòng khám chưa có chuyên khoa hoặc không lấy được danh
                        sách.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {createSpecs
                          .filter((s) =>
                            (s.name || "")
                              .toLowerCase()
                              .includes((searchSpecCreate || "").toLowerCase())
                          )
                          .map((s) => {
                            const id = String(s.id);
                            const isSelected =
                              formik.values.specialty_id.includes(id);
                            return (
                              <button
                                type="button"
                                key={id}
                                onClick={() => {
                                  const next = new Set(
                                    formik.values.specialty_id
                                  );
                                  if (isSelected) next.delete(id);
                                  else next.add(id);
                                  formik.setFieldValue(
                                    "specialty_id",
                                    Array.from(next)
                                  );
                                }}
                                className={
                                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition text-left " +
                                  (isSelected
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "hover:bg-gray-50 text-gray-700")
                                }
                              >
                                <span>{s.name}</span>
                                {isSelected && (
                                  <CheckCircle
                                    size={16}
                                    className="text-blue-600"
                                  />
                                )}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {formik.touched.specialty_id &&
                    formik.errors.specialty_id && (
                      <p className="text-xs text-red-600 mt-2">
                        {formik.errors.specialty_id}
                      </p>
                    )}

                  {formik.values.specialty_id.length > 0 && (
                    <p className="text-sm text-gray-600 mt-3">
                      Đã chọn:{" "}
                      <b>
                        {createSpecs
                          .filter((sp) =>
                            formik.values.specialty_id.includes(String(sp.id))
                          )
                          .map((sp) => sp.name)
                          .join(", ")}
                      </b>
                    </p>
                  )}
                </>
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

      {/* Modal xem chi tiết bác sĩ (EDIT modal) */}
      {showDetailModal && selectedDoctor && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header đẹp hơn */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                  {String(selectedDoctor.name || "BS")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDoctor.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${selectedDoctor.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {selectedDoctor.status === "ACTIVE" ? (
                        <>
                          <CheckCircle size={14} /> Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Không hoạt động
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedDoctor.specialty}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Đóng"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Grid 2 cột: Clinic + Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Card: Clinic selector */}
              <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={18} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Phòng khám
                  </h3>
                </div>

                <p className="text-xs text-gray-500 mb-2">
                  Hiện tại: <b>{selectedDoctor.clinicName}</b>
                </p>

                <input
                  type="text"
                  placeholder="Tìm phòng khám..."
                  value={detailSearchClinic}
                  onChange={(e) => setDetailSearchClinic(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                    focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-2"
                />

                <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                  {clinics.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      Chưa có phòng khám.
                    </div>
                  ) : (
                    filteredClinicDetail.map((c) => {
                      const id = String(c._id);
                      const isSelected = detailClinicId === id;
                      return (
                        <button
                          type="button"
                          key={c._id}
                          onClick={() => setDetailClinicId(id)} // chọn -> tự load chuyên khoa
                          className={
                            "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                            (isSelected
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700")
                          }
                        >
                          <span className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            {c.name}
                          </span>
                          {isSelected && (
                            <CheckCircle size={16} className="text-blue-600" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateDoctorClinic({
                      doctorId: selectedDoctor.id,
                      clinicId: detailClinicId,
                    })
                  }
                  disabled={
                    updatingClinic ||
                    !detailClinicId ||
                    detailClinicId === selectedDoctor.clinicId
                  }
                  className="mt-3 w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {updatingClinic ? "Đang cập nhật..." : "Cập nhật phòng khám"}
                </button>
              </div>

              {/* Card: Contact info */}
              <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <User size={18} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Liên hệ
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Điện thoại</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedDoctor.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card lớn: Specialties theo clinic */}
            <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={18} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Chuyên khoa theo phòng khám
                </h3>
              </div>

              <input
                type="text"
                placeholder="Tìm chuyên khoa..."
                value={detailSearchSpec}
                onChange={(e) => setDetailSearchSpec(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                  focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-3"
              />

              <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 p-1">
                {detailLoadingSpecs ? (
                  <div className="p-3 text-sm text-gray-500">Đang tải...</div>
                ) : detailSpecialties.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    Phòng khám này chưa có chuyên khoa hoặc không lấy được danh
                    sách.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {detailSpecialties
                      .filter((s) =>
                        (s.name || "")
                          .toLowerCase()
                          .includes((detailSearchSpec || "").toLowerCase())
                      )
                      .map((s) => {
                        const id = String(s.id);
                        const checked = detailSelectedSpecIds.includes(id);
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => {
                              const next = new Set(detailSelectedSpecIds);
                              if (checked) next.delete(id);
                              else next.add(id);
                              setDetailSelectedSpecIds(Array.from(next));
                            }}
                            className={
                              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition text-left " +
                              (checked
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "hover:bg-gray-50 text-gray-700")
                            }
                          >
                            <span>{s.name}</span>
                            {checked && (
                              <CheckCircle
                                size={16}
                                className="text-blue-600"
                              />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Nút cập nhật chuyên khoa – nằm dưới card */}
              {(() => {
                const initialIds = (
                  selectedDoctor?.doctorData?.specialty_id || []
                ).map((x) => String(x?._id ?? x));
                const changed = !sameSet(initialIds, detailSelectedSpecIds);
                return (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateDoctorSpecialties({
                          doctorId: selectedDoctor.id,
                          specialtyIds: detailSelectedSpecIds,
                        })
                      }
                      disabled={updatingSpecs || !changed}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {updatingSpecs
                        ? "Đang cập nhật..."
                        : "Cập nhật chuyên khoa"}
                    </button>
                    {!changed && (
                      <span className="text-xs text-gray-500">
                        Chưa có thay đổi so với hiện tại.
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Actions dưới cùng */}
            <div className="flex gap-3 justify-end pt-5">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleDeleteDoctor(selectedDoctor.id, selectedDoctor.status);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Khóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DoctorManagement);
