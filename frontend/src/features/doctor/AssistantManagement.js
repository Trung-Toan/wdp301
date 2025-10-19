import { useState, useEffect, memo } from "react";
import { PlusCircle, Trash2, UserCog, Search } from "lucide-react";
import { doctorApi } from "../../api/doctor/doctorApi";

const AssistantManagement = () => {
  const [assistants, setAssistants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 🟢 Lấy danh sách trợ lý
  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAssistants();
      if (res.data?.ok) setAssistants(res.data.data || []);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Không thể tải danh sách trợ lý." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  // 🟢 Thêm trợ lý mới
  const handleAddAssistant = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin." });
      return;
    }
    try {
      const res = await doctorApi.addAssistant(formData);
      if (res.data?.ok) {
        setMessage({ type: "success", text: "Đã thêm trợ lý thành công!" });
        setFormData({ name: "", email: "", password: "" });
        fetchAssistants();
      } else {
        setMessage({
          type: "error",
          text: res.data?.message || "Thêm thất bại.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi thêm trợ lý." });
    }
  };

  // 🟢 Xóa trợ lý
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản trợ lý này?")) return;
    try {
      const res = await doctorApi.deleteAssistant(id);
      if (res.data?.ok) {
        setMessage({ type: "success", text: "Đã xóa trợ lý thành công!" });
        setAssistants((prev) => prev.filter((a) => a._id !== id));
      } else {
        setMessage({
          type: "error",
          text: res.data?.message || "Xóa thất bại.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi xóa trợ lý." });
    }
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredAssistants = assistants.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
        <UserCog size={26} /> Quản lý tài khoản trợ lý
      </h1>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form thêm trợ lý */}
      <form
        onSubmit={handleAddAssistant}
        className="bg-white shadow rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nhập họ và tên..."
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="example@email.com"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Mật khẩu</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nhập mật khẩu..."
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <PlusCircle size={18} /> Thêm
        </button>
      </form>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center bg-white p-3 rounded-xl shadow gap-3">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="flex-1 border-none outline-none text-sm"
        />
      </div>

      {/* Bảng danh sách trợ lý */}
      <div className="bg-white rounded-2xl shadow p-5">
        {loading ? (
          <p className="text-gray-500 text-sm italic">Đang tải dữ liệu...</p>
        ) : filteredAssistants.length === 0 ? (
          <p className="text-gray-500 text-sm italic">
            Không có tài khoản trợ lý nào.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-700 font-semibold text-left">
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssistants.map((a) => (
                <tr
                  key={a._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">{a.name}</td>
                  <td className="p-3 text-gray-600">{a.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {a.status === "ACTIVE" ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
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
    </div>
  );
};

export default memo(AssistantManagement);
