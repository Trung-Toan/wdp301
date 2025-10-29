import { memo, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";

const AssistantManagement = () => {
  const [assistants, setAssistants] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone_number: "",
    full_name: "",
    note: "",
    type: "NURSE",
    doctor_id: "",
    clinic_id: "",
  });

  const roles = [
    { label: "Y tá", value: "NURSE" },
    { label: "Lễ tân", value: "RECEPTIONIST" },
    { label: "Kỹ thuật viên", value: "TECHNICIAN" },
    { label: "Quản lý phòng khám", value: "ADMINISTRATOR" },
  ];

  const fetchAssistants = async () => {
    try {
      const res = await adminclinicAPI.getAssistantsOfAdminClinic();
      if (res.data.ok) {
        const transformed = res.data.data.map((assistant) => {
          const user = assistant.user_id;
          const acc = user.account_id;
          const doctor = assistant.doctor_id;
          const doctorUser = doctor?.user_id;

          return {
            id: assistant._id,
            name: user?.full_name || "Chưa có tên",
            role:
              assistant.type === "NURSE"
                ? "Y tá"
                : assistant.type === "RECEPTIONIST"
                ? "Lễ tân"
                : assistant.type === "TECHNICIAN"
                ? "Kỹ thuật viên"
                : "Quản lý phòng khám",
            email: `${acc?.username}@example.com`,
            phone: acc?.phone_number || "N/A",
            status: acc?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
            assignedDoctor: doctorUser
              ? `BS. ${doctorUser.full_name}`
              : "Chưa gán bác sĩ",
            assistantData: assistant,
          };
        });

        setAssistants(transformed);
      } else {
        toast.error(res.data.message || "Không thể tải danh sách trợ lý");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách trợ lý");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await adminclinicAPI.getDoctorsOfAdminClinic();
      if (res.data.success) setDoctors(res.data.data || []);
    } catch {
      toast.error("Không thể tải danh sách bác sĩ!");
    }
  };

  useEffect(() => {
    fetchAssistants();
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await adminclinicAPI.createAccountAssistant(formData);
      toast.success("Tạo trợ lý thành công!");
      setShowModal(false);
      setFormData({
        username: "",
        password: "",
        phone_number: "",
        full_name: "",
        note: "",
        type: "NURSE",
        doctor_id: "",
        clinic_id: "",
      });
      fetchAssistants();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi tạo trợ lý");
    }
  };


  const handleDeleteAssistant = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trợ lý này?")) return;
    try {
      await adminclinicAPI.deleteAssistant(id);
      toast.success("Đã xoá trợ lý");
      fetchAssistants();
    } catch (err) {
      toast.error("Không thể xoá trợ lý");
    }
  };

  const filteredAssistants = assistants.filter((asst) => {
    const matchesSearch =
      asst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asst.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asst.assignedDoctor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "ALL" ||
      roles.find((r) => r.label === asst.role)?.value === filterRole;
    const matchesStatus =
      filterStatus === "ALL" || asst.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

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
          {roles.map((r) => (
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
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {assistant.role}
                  </span>
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
                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm trợ lý */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-11/12 shadow-lg max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Thêm trợ lý mới
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Họ và tên"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <textarea
                placeholder="Ghi chú"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <select
                value={formData.doctor_id}
                onChange={(e) =>
                  setFormData({ ...formData, doctor_id: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                <option value="">-- Gán bác sĩ --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.user_id?.full_name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(AssistantManagement);
