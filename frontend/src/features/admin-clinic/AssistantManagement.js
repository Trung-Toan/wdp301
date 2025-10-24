import { memo, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
} from "lucide-react";

const AssistantManagement = () => {
  const [assistants, setAssistants] = useState([
    {
      id: 1,
      name: "Nguyễn Thị C",
      role: "Lễ tân",
      email: "assistant1@clinic.com",
      phone: "0912345680",
      status: "ACTIVE",
      assignedDoctor: "BS. Nguyễn Văn A",
      hireDate: "2022-01-15",
      performanceRating: 4.7,
      tasksCompleted: 245,
      shift: "MORNING",
      certifications: ["Chứng chỉ Y tá", "Chứng chỉ Sơ cứu"],
    },
    {
      id: 2,
      name: "Trần Văn D",
      role: "Y tá",
      email: "assistant2@clinic.com",
      phone: "0912345681",
      status: "ACTIVE",
      assignedDoctor: "BS. Trần Thị B",
      hireDate: "2023-03-20",
      performanceRating: 4.5,
      tasksCompleted: 189,
      shift: "AFTERNOON",
      certifications: ["Chứng chỉ Y tá"],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    assignedDoctor: "",
    shift: "MORNING",
  });

  const roles = ["Lễ tân", "Y tá", "Kỹ thuật viên", "Quản lý phòng khám"];
  const doctors = ["BS. Nguyễn Văn A", "BS. Trần Thị B", "BS. Lê Văn C"];
  const shifts = [
    { value: "MORNING", label: "Sáng (8:00 - 12:00)" },
    { value: "AFTERNOON", label: "Chiều (13:00 - 17:00)" },
    { value: "EVENING", label: "Tối (17:00 - 21:00)" },
    { value: "FULL_DAY", label: "Cả ngày" },
  ];

  const handleAddAssistant = () => {
    setEditingId(null);
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      assignedDoctor: "",
      shift: "MORNING",
    });
    setShowModal(true);
  };

  const handleEditAssistant = (assistant) => {
    setEditingId(assistant.id);
    setFormData({
      name: assistant.name,
      role: assistant.role,
      email: assistant.email,
      phone: assistant.phone,
      assignedDoctor: assistant.assignedDoctor,
      shift: assistant.shift,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setAssistants(
        assistants.map((asst) =>
          asst.id === editingId
            ? {
                ...asst,
                ...formData,
              }
            : asst
        )
      );
    } else {
      const newAssistant = {
        id: Math.max(...assistants.map((a) => a.id), 0) + 1,
        ...formData,
        status: "ACTIVE",
        hireDate: new Date().toISOString().split("T")[0],
        performanceRating: 0,
        tasksCompleted: 0,
        certifications: [],
      };
      setAssistants([...assistants, newAssistant]);
    }
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      assignedDoctor: "",
      shift: "MORNING",
    });
    setShowModal(false);
  };

  const handleDeleteAssistant = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trợ lý này?")) {
      setAssistants(assistants.filter((asst) => asst.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setAssistants(
      assistants.map((asst) =>
        asst.id === id
          ? {
              ...asst,
              status: asst.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : asst
      )
    );
  };

  const filteredAssistants = assistants.filter((asst) => {
    const matchesSearch =
      asst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asst.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asst.assignedDoctor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "ALL" || asst.role === filterRole;
    const matchesStatus =
      filterStatus === "ALL" || asst.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getShiftLabel = (shift) => {
    return shifts.find((s) => s.value === shift)?.label || shift;
  };

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
          onClick={handleAddAssistant}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full md:w-auto"
        >
          <Plus size={20} />
          Thêm trợ lý
        </button>
      </div>

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
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
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
                Ca làm việc
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Đánh giá
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded w-fit">
                    <Calendar size={14} />
                    <span>{getShiftLabel(assistant.shift)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {assistant.performanceRating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(assistant.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      assistant.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {assistant.status === "ACTIVE" ? (
                      <>
                        <CheckCircle size={16} />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Không hoạt động
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAssistant(assistant)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteAssistant(assistant.id)}
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
              {editingId ? "Chỉnh sửa trợ lý" : "Thêm trợ lý mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tên trợ lý
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên trợ lý"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Chức vụ
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn chức vụ</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Bác sĩ phụ trách
                  </label>
                  <select
                    required
                    value={formData.assignedDoctor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedDoctor: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {doctors.map((doctor) => (
                      <option key={doctor} value={doctor}>
                        {doctor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ca làm việc
                  </label>
                  <select
                    required
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {shifts.map((shift) => (
                      <option key={shift.value} value={shift.value}>
                        {shift.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {editingId ? "Cập nhật" : "Thêm trợ lý"}
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
