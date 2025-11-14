import { memo, useMemo, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  Eye,
} from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ElegantModal, FormField } from "./ElegantModal";

const AssistantManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  // Search/filter trên list
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterClinic, setFilterClinic] = useState("ALL");

  // Search trong modal tạo
  const [searchClinic, setSearchClinic] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");

  // Search trong modal xem/cập nhật
  const [detailSearchClinic, setDetailSearchClinic] = useState("");
  const [detailSearchDoctor, setDetailSearchDoctor] = useState("");

  // Danh sách bác sĩ theo clinic trong modal tạo
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [loadingClinicDoctors, setLoadingClinicDoctors] = useState(false);

  // Danh sách bác sĩ theo clinic trong modal chi tiết
  const [detailClinicDoctors, setDetailClinicDoctors] = useState([]);
  const [detailLoadingClinicDoctors, setDetailLoadingClinicDoctors] = useState(false);

  // State edit trong modal chi tiết
  const [detailClinicId, setDetailClinicId] = useState("");
  const [detailDoctorId, setDetailDoctorId] = useState("");
  const [detailRoles, setDetailRoles] = useState([]);
  const [detailNote, setDetailNote] = useState("");

  const queryClient = useQueryClient();

  // ===== Role defs & feature mapping =====
  const ROLE_DEFS = [
    { label: "Y tá", value: "NURSE" },
    { label: "Lễ tân", value: "RECEPTIONIST" },
  ];

  const ROLE_FEATURES = {
    NURSE: [
      { key: "patients", label: "Quản lý bệnh nhân" },
      { key: "slot_schedule", label: "Tạo lịch khám cho bác sĩ" },
      { key: "dashboard", label: "Trang chủ" },
    ],
    RECEPTIONIST: [
      { key: "approve_appointments", label: "Duyệt lịch khám" },
      { key: "dashboard", label: "Trang chủ" },
    ],
  };

  const getFeaturesForRoles = (rolesArr) => {
    const byKey = new Map();
    (rolesArr || []).forEach((r) => {
      (ROLE_FEATURES[r] || []).forEach((f) => byKey.set(f.key, f));
    });
    return Array.from(byKey.values());
  };

  // ===== React Query: clinics =====
  const {
    data: clinics = [],
    isLoading: loadingClinics,
  } = useQuery({
    queryKey: ["all-clinics-of-admin"],
    queryFn: async () => {
      const res = await adminclinicAPI.getAllClinics();
      if (res?.data?.ok) return res.data.data || [];
      throw new Error(res?.data?.message || "Không thể tải danh sách phòng khám");
    },
    onError: () => toast.error("Không thể tải danh sách phòng khám!"),
    staleTime: 5 * 60 * 1000,
  });

  // ===== React Query: all doctors (fallback cho lọc theo clinic) =====
  const {
    data: doctorsAll = [],
    isLoading: loadingDoctorsAll,
  } = useQuery({
    queryKey: ["doctors-of-admin-clinic"],
    queryFn: async () => {
      const res = await adminclinicAPI.getDoctorsOfAdminClinic();
      if (res?.data?.success) return res.data.data || [];
      throw new Error(res?.data?.message || "Không thể tải danh sách bác sĩ!");
    },
    onError: () => toast.error("Không thể tải danh sách bác sĩ!"),
    staleTime: 5 * 60 * 1000,
  });

  // ===== React Query: assistants =====
  const {
    data: assistantsRaw = [],
    isLoading: loadingAssistants,
  } = useQuery({
    queryKey: ["assistants-of-admin-clinic"],
    queryFn: async () => {
      const res = await adminclinicAPI.getAssistantsOfAdminClinic();
      if (res?.data?.ok) return res.data.data || [];
      throw new Error(res?.data?.message || "Không thể tải danh sách trợ lý");
    },
    onError: (err) => toast.error(err?.message || "Không thể tải danh sách trợ lý"),
  });

  // Chuẩn hoá trợ lý
  const assistants = useMemo(
    () =>
      (assistantsRaw || []).map((assistant) => {
        const user = assistant.user_id;
        const acc = user?.account_id;
        const doctor = assistant.doctor_id;
        const doctorUser = doctor?.user_id;
        const clinic = assistant.clinic_id;

        const roleValuesRaw = Array.isArray(assistant.roles)
          ? assistant.roles
          : Array.isArray(assistant.type)
            ? assistant.type
            : assistant.type
              ? [assistant.type]
              : [];
        const roleValues = roleValuesRaw.filter(Boolean);
        const roleLabels = roleValues.map(
          (v) => ROLE_DEFS.find((r) => r.value === v)?.label || v
        );

        const features = getFeaturesForRoles(roleValues);
        const featuresText = features.map((f) => f.label).join(", ");

        return {
          id: assistant._id,
          name: user?.full_name || "N/A",
          roleLabels,
          roleValues,
          features,
          featuresText,
          email: acc?.email || "N/A",
          phone: acc?.phone_number || "N/A",
          status: acc?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
          assignedDoctor: doctorUser ? `BS. ${doctorUser.full_name}` : "Chưa gán bác sĩ",
          clinicId: clinic?._id?.toString() || null,
          clinicName: clinic?.name || "Không xác định",
          assistantData: assistant,
        };
      }),
    [assistantsRaw]
  );

  // ===== Formik (Create) =====
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone_number: "",
      full_name: "",
      note: "",
      roles: [],
      clinic_id: "",
      doctor_id: "",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().trim().required("Họ và tên là bắt buộc"),
      username: Yup.string().trim().required("Tên đăng nhập là bắt buộc"),
      password: Yup.string().trim().required("Mật khẩu là bắt buộc"),
      email: Yup.string().trim().email("Email không hợp lệ").required("Email là bắt buộc"),
      phone_number: Yup.string()
        .trim()
        .matches(/^[0-9]{8,15}$/, "Số điện thoại không hợp lệ")
        .required("Số điện thoại là bắt buộc"),
      note: Yup.string().trim().max(500, "Ghi chú tối đa 500 ký tự").nullable(),
      roles: Yup.array()
        .of(Yup.mixed().oneOf(ROLE_DEFS.map((r) => r.value)))
        .min(1, "Phải chọn ít nhất 1 vai trò")
        .required("Vai trò là bắt buộc"),
      clinic_id: Yup.string().required("Phải chọn phòng khám"),
      doctor_id: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      const payload = {
        ...values,
        roles: values.roles.map(String),
        clinic_id: String(values.clinic_id),
        doctor_id: values.doctor_id || undefined,
      };
      createAssistant(payload);
    },
  });

  // ===== API helpers =====
  const fetchDoctorsByClinic = async (clinicId) => {
    if (!clinicId) return [];
    try {
      if (typeof adminclinicAPI.getDoctorsByClinic === "function") {
        const res = await adminclinicAPI.getDoctorsByClinic(clinicId);
        const arr = res?.data?.data || [];
        return arr || [];
      }
      // Fallback lọc từ all doctors
      const arr = (doctorsAll || []).filter(
        (d) => String(d?.clinic_id?._id ?? d?.clinic_id) === String(clinicId)
      );
      return arr;
    } catch (e) {
      console.error("Lỗi lấy bác sĩ theo phòng khám:", e);
      return [];
    }
  };

  // Load doctors theo clinic (Create)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const cid = formik.values.clinic_id;
      if (!cid) {
        setClinicDoctors([]);
        if (formik.values.doctor_id) formik.setFieldValue("doctor_id", "");
        return;
      }
      setLoadingClinicDoctors(true);
      const docs = await fetchDoctorsByClinic(cid);
      if (!mounted) return;
      setClinicDoctors(docs);
      const allowed = new Set(docs.map((d) => String(d._id)));
      if (!allowed.has(String(formik.values.doctor_id))) {
        formik.setFieldValue("doctor_id", "");
      }
      setLoadingClinicDoctors(false);
    };
    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.clinic_id]);

  // ===== Mutations =====
  const { mutate: createAssistant, isLoading: creatingAssistant } = useMutation({
    mutationFn: (payload) => adminclinicAPI.createAccountAssistant(payload),
    onSuccess: () => {
      toast.success("Tạo trợ lý thành công!");
      setShowModal(false);
      formik.resetForm();
      setClinicDoctors([]);
      setSearchClinic("");
      setSearchDoctor("");
      queryClient.invalidateQueries({ queryKey: ["assistants-of-admin-clinic"] });
    },
    onError: (error) => {
      console.error("Lỗi khi tạo trợ lý:", error);
      toast.error(error?.response?.data?.message || "Không thể tạo trợ lý, thử lại!");
    },
  });

  const { mutate: deleteAssistant, isLoading: deletingAssistant } = useMutation({
    mutationFn: ({id, status}) => adminclinicAPI.deleteAssistant(id, status),
    onSuccess: () => {
      toast.success("Đã xoá trợ lý");
      queryClient.invalidateQueries({ queryKey: ["assistants-of-admin-clinic"] });
    },
    onError: () => toast.error("Không thể xoá trợ lý"),
  });

  // Cập nhật trợ lý (view/update modal)
  const { mutate: updateAssistant, isLoading: updatingAssistant } = useMutation({
    mutationFn: async (payload) => {
      // Ưu tiên 1: updateAssistant
      if (typeof adminclinicAPI.updateAssistant === "function") {
        return adminclinicAPI.updateAssistant(payload);
      }
      // Ưu tiên 2: updateAssistantById
      if (typeof adminclinicAPI.updateAssistantById === "function") {
        return adminclinicAPI.updateAssistantById(payload);
      }
      // Ưu tiên 3: updateAssistantInfo / updateAssistantAccount
      if (typeof adminclinicAPI.updateAssistantInfo === "function") {
        return adminclinicAPI.updateAssistantInfo(payload);
      }
      if (typeof adminclinicAPI.updateAssistantAccount === "function") {
        return adminclinicAPI.updateAssistantAccount(payload);
      }
      throw new Error("Chưa có API cập nhật trợ lý (updateAssistant).");
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Cập nhật trợ lý thành công!");
      setShowDetailModal(false);
      setSelectedAssistant(null);
      queryClient.invalidateQueries({ queryKey: ["assistants-of-admin-clinic"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Không thể cập nhật trợ lý.");
    },
  });

  // ===== Handlers =====
  const handleDeleteAssistant = (id, status ) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trợ lý này?")) return;
    status = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    deleteAssistant({ id, status });
  };

  const handleOpenCreate = () => {
    formik.resetForm();
    setSearchClinic("");
    setSearchDoctor("");
    setClinicDoctors([]);
    setShowModal(true);
  };

  const handleOpenDetail = (asst) => {
    setSelectedAssistant(asst);

    // preset clinic/doctor/roles/note
    const rawRoles =
      Array.isArray(asst?.assistantData?.roles)
        ? asst.assistantData.roles
        : Array.isArray(asst?.assistantData?.type)
          ? asst.assistantData.type
          : asst?.assistantData?.type
            ? [asst.assistantData.type]
            : [];
    const roleValues = rawRoles.filter(Boolean).map(String);

    setDetailClinicId(asst.clinicId || "");
    setDetailDoctorId(asst.assistantData?.doctor_id?._id || "");
    setDetailRoles(roleValues);
    setDetailNote(asst.assistantData?.note || "");

    // reset search fields
    setDetailSearchClinic("");
    setDetailSearchDoctor("");

    setShowDetailModal(true);
  };

  // Khi đổi clinic trong modal detail -> load doctors theo clinic đó
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!showDetailModal) return;
      if (!detailClinicId) {
        setDetailClinicDoctors([]);
        setDetailDoctorId("");
        return;
      }
      setDetailLoadingClinicDoctors(true);
      const docs = await fetchDoctorsByClinic(detailClinicId);
      if (!mounted) return;
      setDetailClinicDoctors(docs);
      const allowed = new Set(docs.map((d) => String(d._id)));
      if (!allowed.has(String(detailDoctorId))) setDetailDoctorId("");
      setDetailLoadingClinicDoctors(false);
    };
    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailClinicId, showDetailModal]);

  // ===== Filtering for list =====
  const filteredAssistants = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return (assistants || []).filter((asst) => {
      const matchesSearch =
        asst.name?.toLowerCase().includes(term) ||
        asst.email?.toLowerCase().includes(term) ||
        asst.assignedDoctor?.toLowerCase().includes(term) ||
        asst.clinicName?.toLowerCase().includes(term);

      const matchesRole = filterRole === "ALL" || asst.roleValues?.includes(filterRole);
      const matchesStatus = filterStatus === "ALL" || asst.status === filterStatus;
      const matchesClinic = filterClinic === "ALL" || asst.clinicId === filterClinic;

      return matchesSearch && matchesRole && matchesStatus && matchesClinic;
    });
  }, [assistants, searchTerm, filterRole, filterStatus, filterClinic]);

  // Lọc phòng khám (create modal)
  const filteredClinicsInModal = useMemo(() => {
    const q = (searchClinic || "").toLowerCase();
    return (clinics || []).filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [clinics, searchClinic]);

  // Lọc bác sĩ theo clinic (create modal)
  const filteredDoctorsInModal = useMemo(() => {
    const q = (searchDoctor || "").toLowerCase();
    return (clinicDoctors || []).filter((d) =>
      (d?.user_id?.full_name || "").toLowerCase().includes(q)
    );
  }, [clinicDoctors, searchDoctor]);

  // Lọc phòng khám (detail modal)
  const filteredClinicsInDetail = useMemo(() => {
    const q = (detailSearchClinic || "").toLowerCase();
    return (clinics || []).filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [clinics, detailSearchClinic]);

  // Lọc bác sĩ theo clinic (detail modal)
  const filteredDoctorsInDetail = useMemo(() => {
    const q = (detailSearchDoctor || "").toLowerCase();
    return (detailClinicDoctors || []).filter((d) =>
      (d?.user_id?.full_name || "").toLowerCase().includes(q)
    );
  }, [detailClinicDoctors, detailSearchDoctor]);

  // ===== UI =====
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý trợ lý</h1>
          <p className="text-sm text-gray-600 mt-2">Quản lý nhân viên hỗ trợ phòng khám</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full md:w-auto"
        >
          <Plus size={20} />
          Thêm trợ lý
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1 min-w-64">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trợ lý, email, bác sĩ, phòng khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả chức vụ</option>
          {ROLE_DEFS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          value={filterClinic}
          onChange={(e) => setFilterClinic(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loadingClinics}
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

      {/* Bảng danh sách */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        {(loadingAssistants || loadingDoctorsAll || loadingClinics) && (
          <div className="p-4 text-sm text-gray-500">Đang tải dữ liệu...</div>
        )}
        {!loadingAssistants && filteredAssistants?.length === 0 && (
          <div className="p-4 text-sm text-gray-500">Không có trợ lý nào.</div>
        )}
        {filteredAssistants?.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Tên trợ lý
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Chức vụ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Phòng khám
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Bác sĩ phụ trách
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
              {filteredAssistants.map((assistant) => (
                <tr
                  key={assistant.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {assistant.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {assistant.email}
                      </span>
                    </div>
                  </td>

                  {/* Role + features */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 flex-wrap">
                        {assistant.roleLabels?.map((label, idx) => (
                          <span
                            key={`${label}-${idx}`}
                            title={assistant.featuresText}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      {assistant.features?.length > 0 && (
                        <div className="text-[11px] text-gray-500">
                          <span className="font-medium">Chức năng:&nbsp;</span>
                          {assistant.features.map((f) => f.label).join(", ")}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Clinic */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">
                        {assistant.clinicName}
                      </span>
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {assistant.assignedDoctor}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${assistant.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {assistant.status === "ACTIVE" ? (
                        <>
                          <CheckCircle size={16} /> Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle size={16} /> Ngừng
                        </>
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDetail(assistant)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        title="Xem / Cập nhật"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAssistant(assistant.id, assistant.status)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Xóa"
                        disabled={deletingAssistant}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal tạo trợ lý */}
      {showModal && (
        <ElegantModal onClose={() => setShowModal(false)}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center ring-1 ring-blue-200">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Thêm trợ lý mới</h2>
                <p className="text-sm text-gray-500">
                  Điền thông tin cơ bản, chọn phòng khám & (tuỳ chọn) gán bác sĩ
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

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

          {/* Content */}
          <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
            {/* Username + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Tên đăng nhập"
                name="username"
                required
                placeholder="vd: pham.anh"
                formik={formik}
              />
              <FormField
                label="Mật khẩu"
                name="password"
                type="password"
                required
                placeholder="Nhập mật khẩu"
                formik={formik}
              />
            </div>

            {/* Fullname */}
            <FormField
              label="Họ và tên"
              name="full_name"
              required
              placeholder="vd: Phạm Minh Anh"
              formik={formik}
            />

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

            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLE_DEFS.map((r) => {
                  const active = formik.values.roles.includes(r.value);
                  return (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => {
                        const set = new Set(formik.values.roles);
                        if (set.has(r.value)) set.delete(r.value);
                        else set.add(r.value);
                        formik.setFieldValue("roles", Array.from(set));
                      }}
                      className={
                        "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm " +
                        (active
                          ? "border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50")
                      }
                      title={
                        getFeaturesForRoles([r.value])
                          .map((f) => f.label)
                          .join(", ") || undefined
                      }
                    >
                      <CheckCircle
                        size={16}
                        className={
                          active
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-30 transition-opacity"
                        }
                      />
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {formik.touched.roles && formik.errors.roles && (
                <p className="text-xs text-red-600 mt-1">
                  {typeof formik.errors.roles === "string"
                    ? formik.errors.roles
                    : "Vai trò không hợp lệ"}
                </p>
              )}
            </div>

            {/* PHÒNG KHÁM (search + list) */}
            <div className="rounded-2xl border border-gray-200 p-4">
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
                {loadingClinics ? (
                  <div className="p-3 text-sm text-gray-500">Đang tải...</div>
                ) : (filteredClinicsInModal || []).length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">Không có phòng khám phù hợp.</div>
                ) : (
                  filteredClinicsInModal.map((c) => {
                    const id = String(c._id);
                    const isSelected = formik.values.clinic_id === id;
                    return (
                      <button
                        type="button"
                        key={c._id}
                        onClick={() => formik.setFieldValue("clinic_id", id)}
                        className={
                          "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                          (isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")
                        }
                      >
                        <span className="flex items-center gap-2">
                          <Building2 size={16} className="text-gray-400" />
                          {c.name}
                        </span>
                        {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                      </button>
                    );
                  })
                )}
              </div>

              {formik.touched.clinic_id && formik.errors.clinic_id && (
                <p className="text-xs text-red-600 mt-2">{formik.errors.clinic_id}</p>
              )}

              {formik.values.clinic_id && (
                <p className="text-sm text-gray-600 mt-2">
                  Đã chọn:{" "}
                  <b>{clinics.find((c) => String(c._id) === String(formik.values.clinic_id))?.name || "—"}</b>
                </p>
              )}
            </div>

            {/* BÁC SĨ THEO PHÒNG KHÁM */}
            <div className="rounded-2xl border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Gán bác sĩ (tuỳ chọn)
              </label>

              {!formik.values.clinic_id ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                  Hãy chọn <b>Phòng khám</b> trước để hiển thị danh sách bác sĩ.
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Tìm bác sĩ theo tên..."
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-2"
                  />
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                    {loadingClinicDoctors ? (
                      <div className="p-3 text-sm text-gray-500">Đang tải bác sĩ...</div>
                    ) : filteredDoctorsInModal.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">Không có bác sĩ phù hợp.</div>
                    ) : (
                      filteredDoctorsInModal.map((doc) => {
                        const id = String(doc._id);
                        const name = doc?.user_id?.full_name || "Không rõ";
                        const isSelected = formik.values.doctor_id === id;
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => formik.setFieldValue("doctor_id", id)}
                            className={
                              "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                              (isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")
                            }
                          >
                            <span>{name}</span>
                            {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {formik.values.doctor_id && (
                    <p className="text-sm text-gray-600 mt-2">
                      Đã chọn:{" "}
                      <b>
                        {clinicDoctors.find((d) => String(d._id) === String(formik.values.doctor_id))?.user_id
                          ?.full_name || "—"}
                      </b>
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Note */}
            <FormField label="Ghi chú" name="note" as="textarea" placeholder="Thông tin bổ sung…" formik={formik} />

            {/* Chức năng theo Role */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
              <div className="text-sm font-semibold text-blue-800 mb-2">Chức năng sẽ có</div>
              {(getFeaturesForRoles(formik.values.roles)).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {getFeaturesForRoles(formik.values.roles).map((f) => (
                    <span
                      key={f.key}
                      className="inline-flex items-center rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-blue-700/80">Chưa chọn vai trò — chưa có chức năng nào.</div>
              )}
            </div>
          </div>

          {/* Footer */}
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
                disabled={creatingAssistant}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60"
              >
                {creatingAssistant ? "Đang tạo…" : "Tạo"}
              </button>
            </div>
          </div>
        </ElegantModal>
      )}

      {/* Modal Xem & Cập nhật trợ lý */}
      {showDetailModal && selectedAssistant && (
        <ElegantModal onClose={() => { setShowDetailModal(false); setSelectedAssistant(null); }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết & Cập nhật trợ lý</h2>
              <p className="text-sm text-gray-500">Xem thông tin và cập nhật phòng khám, bác sĩ, vai trò, ghi chú</p>
            </div>
            <button
              onClick={() => { setShowDetailModal(false); setSelectedAssistant(null); }}
              className="shrink-0 rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <XCircle size={22} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

          {/* Content */}
          <div className="overflow-y-auto pr-1 -mr-1 space-y-6">
            {/* Basic readonly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Họ và tên</label>
                <div className="text-sm font-semibold text-gray-900">
                  {selectedAssistant.name}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <div className="text-sm text-gray-800">{selectedAssistant.email}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Điện thoại</label>
                <div className="text-sm text-gray-800">{selectedAssistant.phone}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
                <div className="text-sm">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${selectedAssistant.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {selectedAssistant.status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
                  </span>
                </div>
              </div>
            </div>

            {/* Vai trò (edit) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_DEFS.map((r) => {
                  const active = detailRoles.includes(r.value);
                  return (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => {
                        const set = new Set(detailRoles);
                        if (set.has(r.value)) set.delete(r.value);
                        else set.add(r.value);
                        setDetailRoles(Array.from(set));
                      }}
                      className={
                        "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm " +
                        (active
                          ? "border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50")
                      }
                    >
                      <CheckCircle
                        size={16}
                        className={active ? "opacity-100" : "opacity-0 group-hover:opacity-30 transition-opacity"}
                      />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phòng khám (edit) */}
            <div className="rounded-2xl border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phòng khám</label>
              <input
                type="text"
                placeholder="Tìm phòng khám..."
                value={detailSearchClinic}
                onChange={(e) => setDetailSearchClinic(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-2"
              />
              <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                {(filteredClinicsInDetail || []).map((c) => {
                  const id = String(c._id);
                  const isSelected = detailClinicId === id;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setDetailClinicId(id)}
                      className={
                        "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                        (isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        {c.name}
                      </span>
                      {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
              {detailClinicId && (
                <p className="text-sm text-gray-600 mt-2">
                  Đã chọn: <b>{clinics.find((c) => String(c._id) === String(detailClinicId))?.name || "—"}</b>
                </p>
              )}
            </div>

            {/* Bác sĩ theo phòng khám (edit) */}
            <div className="rounded-2xl border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Gán bác sĩ (tuỳ chọn)
              </label>

              {!detailClinicId ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                  Hãy chọn <b>Phòng khám</b> để hiển thị danh sách bác sĩ.
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Tìm bác sĩ..."
                    value={detailSearchDoctor}
                    onChange={(e) => setDetailSearchDoctor(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition mb-2"
                  />
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                    {detailLoadingClinicDoctors ? (
                      <div className="p-3 text-sm text-gray-500">Đang tải bác sĩ...</div>
                    ) : (filteredDoctorsInDetail || []).length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">Không có bác sĩ phù hợp.</div>
                    ) : (
                      filteredDoctorsInDetail.map((doc) => {
                        const id = String(doc._id);
                        const name = doc?.user_id?.full_name || "Không rõ";
                        const isSelected = detailDoctorId === id;
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => setDetailDoctorId(id)}
                            className={
                              "w-full flex items-center justify-between px-3 py-2 text-sm transition text-left " +
                              (isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")
                            }
                          >
                            <span>{name}</span>
                            {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {detailDoctorId && (
                    <p className="text-sm text-gray-600 mt-2">
                      Đã chọn:{" "}
                      <b>
                        {detailClinicDoctors.find((d) => String(d._id) === String(detailDoctorId))?.user_id?.full_name ||
                          "—"}
                      </b>
                    </p>
                  )}

                  {/* Nút bỏ gán bác sĩ */}
                  {detailDoctorId && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setDetailDoctorId("")}
                        className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Bỏ gán bác sĩ
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Ghi chú (edit) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
              <textarea
                value={detailNote}
                onChange={(e) => setDetailNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                placeholder="Thông tin bổ sung…"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky -mb-6 mt-6 bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-white to-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowDetailModal(false); setSelectedAssistant(null); }}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={updatingAssistant || !selectedAssistant}
                onClick={() => {
                  if (!detailClinicId) {
                    toast.error("Vui lòng chọn phòng khám trước khi cập nhật.");
                    return;
                  }
                  const payload = {
                    assistant_id: selectedAssistant?.id,
                    clinic_id: detailClinicId,
                    doctor_id: detailDoctorId || undefined,
                    roles: detailRoles.map(String),
                    note: detailNote || "",
                  };
                  updateAssistant(payload);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60"
              >
                {updatingAssistant ? "Đang cập nhật…" : "Cập nhật"}
              </button>
            </div>
          </div>
        </ElegantModal>
      )}
    </div>
  );
};

export default memo(AssistantManagement);
