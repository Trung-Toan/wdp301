import { memo, useMemo, useState } from "react";
import { Plus, Trash2, Search, CheckCircle, XCircle } from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ElegantModal, FormField } from "./ElegantModal";

const AssistantManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const queryClient = useQueryClient();

  // ===== Danh mục role & chức năng theo role =====
  const ROLE_DEFS = [
    { label: "Y tá", value: "NURSE" },
    { label: "Lễ tân", value: "RECEPTIONIST" },
  ];

  // Map chức năng theo role (giữ đồng bộ với layout/route bạn đã dùng)
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

  // ===== React Query: fetch doctors =====
  const {
    data: doctors = [],
    isLoading: loadingDoctors,
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

  // ===== React Query: fetch assistants =====
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
    onError: (err) =>
      toast.error(err?.message || "Không thể tải danh sách trợ lý"),
  });

  // Chuẩn hoá dữ liệu trợ lý cho UI
  const assistants = useMemo(
    () =>
      (assistantsRaw || []).map((assistant) => {
        const user = assistant.user_id;
        const acc = user?.account_id;
        const doctor = assistant.doctor_id;
        const doctorUser = doctor?.user_id;

        // type có thể là mảng hoặc string; roles cũng có thể được BE hỗ trợ
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
          roleLabels, // hiển thị
          roleValues, // lọc
          features, // danh sách chức năng (array)
          featuresText, // text gộp để tooltip/hiển thị nhanh
          email: acc?.email || "N/A",
          phone: acc?.phone_number || "N/A",
          status: acc?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
          assignedDoctor: doctorUser
            ? `BS. ${doctorUser.full_name}`
            : "Chưa gán bác sĩ",
          assistantData: assistant,
        };
      }),
    [assistantsRaw]
  );

  // ===================== Formik + Yup (roles: string[]) =====================
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone_number: "",
      full_name: "",
      note: "",
      roles: [],
      doctor_id: "",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().trim().required("Họ và tên là bắt buộc"),
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
      note: Yup.string().trim().max(500, "Ghi chú tối đa 500 ký tự").nullable(),
      roles: Yup.array()
        .of(Yup.mixed().oneOf(ROLE_DEFS.map((r) => r.value)))
        .min(1, "Phải chọn ít nhất 1 vai trò")
        .required("Vai trò là bắt buộc"),
      doctor_id: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      const payload = {
        ...values,
        roles: values.roles.map(String), // mảng string
        doctor_id: values.doctor_id || undefined,
      };
      createAssistant(payload);
    },
  });

  // ===================== React Query: create assistant =====================
  const { mutate: createAssistant, isLoading: creatingAssistant } = useMutation({
    mutationFn: (payload) => adminclinicAPI.createAccountAssistant(payload),
    onSuccess: () => {
      toast.success("Tạo trợ lý thành công!");
      setShowModal(false);
      formik.resetForm();
      queryClient.invalidateQueries({ queryKey: ["assistants-of-admin-clinic"] });
    },
    onError: (error) => {
      console.error("Lỗi khi tạo trợ lý:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tạo trợ lý, thử lại!"
      );
    },
  });

  // ===================== React Query: delete assistant =====================
  const { mutate: deleteAssistant, isLoading: deletingAssistant } = useMutation({
    mutationFn: (id) => adminclinicAPI.deleteAssistant(id),
    onSuccess: () => {
      toast.success("Đã xoá trợ lý");
      queryClient.invalidateQueries({
        queryKey: ["assistants-of-admin-clinic"],
      });
    },
    onError: () => {
      toast.error("Không thể xoá trợ lý");
    },
  });

  const handleDeleteAssistant = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trợ lý này?")) return;
    deleteAssistant(id);
  };

  // Lọc trên UI
  const filteredAssistants = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return (assistants || []).filter((asst) => {
      const matchesSearch =
        asst.name?.toLowerCase().includes(term) ||
        asst.email?.toLowerCase().includes(term) ||
        asst.assignedDoctor?.toLowerCase().includes(term);

      const matchesRole =
        filterRole === "ALL" || asst.roleValues?.includes(filterRole);

      const matchesStatus =
        filterStatus === "ALL" || asst.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [assistants, searchTerm, filterRole, filterStatus]);

  const closeModal = () => {
    setShowModal(false);
    formik.resetForm();
  };

  // Tính chức năng tổng hợp theo role đang chọn trong modal
  const selectedFeatures = useMemo(
    () => getFeaturesForRoles(formik.values.roles),
    [formik.values.roles]
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý trợ lý</h1>
          <p className="text-sm text-gray-600 mt-2">
            Quản lý nhân viên hỗ trợ phòng khám
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
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
            placeholder="Tìm kiếm trợ lý..."
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
        {(loadingAssistants || loadingDoctors) && (
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

                  {/* Chức vụ + chức năng (tooltip + dòng mô tả) */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 flex-wrap">
                        {assistant.roleLabels?.map((label, idx) => (
                          <span
                            key={`${label}-${idx}`}
                            title={assistant.featuresText} // tooltip tổng hợp chức năng
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

                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {assistant.assignedDoctor}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        assistant.status === "ACTIVE"
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

                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteAssistant(assistant.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Xóa"
                      disabled={deletingAssistant}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal thêm trợ lý */}
      {showModal && (
        <ElegantModal onClose={closeModal}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center ring-1 ring-blue-200">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Thêm trợ lý mới</h2>
                <p className="text-sm text-gray-500">
                  Điền thông tin cơ bản và gán vai trò/phụ trách bác sĩ
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="shrink-0 rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <XCircle size={22} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

          {/* Content */}
          <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
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

            <FormField
              label="Họ và tên"
              name="full_name"
              required
              placeholder="vd: Phạm Minh Anh"
              formik={formik}
            />

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

            {/* Roles (multi-pills) */}
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
                      } // tooltip chức năng của role đó
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

            {/* Doctor select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gán bác sĩ (tuỳ chọn)
              </label>
              <select
                name="doctor_id"
                value={formik.values.doctor_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.user_id?.full_name}
                  </option>
                ))}
              </select>
              {formik.touched.doctor_id && formik.errors.doctor_id && (
                <p className="text-xs text-red-600 mt-1">
                  {formik.errors.doctor_id}
                </p>
              )}
            </div>

            {/* Note */}
            <FormField
              label="Ghi chú"
              name="note"
              as="textarea"
              placeholder="Thông tin bổ sung…"
              formik={formik}
            />

            {/* 👇 Chức năng sẽ có (theo vai trò đã chọn) */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
              <div className="text-sm font-semibold text-blue-800 mb-2">
                Chức năng sẽ có
              </div>
              {selectedFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.map((f) => (
                    <span
                      key={f.key}
                      className="inline-flex items-center rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-blue-700/80">
                  Chưa chọn vai trò — chưa có chức năng nào.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky -mb-6 mt-6 bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-white to-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
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
    </div>
  );
};

export default memo(AssistantManagement);
