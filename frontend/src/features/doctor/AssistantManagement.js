import { useState, useEffect, memo } from "react";
import { UserCog, Search } from "lucide-react";
import { doctorApi } from "../../api/doctor/doctorApi";

const AssistantManagement = () => {
  const [assistants, setAssistants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  //xóa form tao tai khoan tro ly

  // Lấy danh sách trợ lý (có tìm kiếm + phân trang)
  const fetchAssistants = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await doctorApi.getAssistants(search, page);
      if (res.data?.ok) {
        const parsed = res.data.data.map((item) => {
          const assistant = item.assistant;
          const user = item.user || {};
          const account = item.account || {};
          return {
            _id: assistant._id,
            type: assistant.type || [],
            name: user.full_name || account.username || "Chưa có tên",
            gender: user.gender || "Chưa xác định",
            email: account.email || "Không có email",
            phone_number: account.phone_number || "Không có số điện thoại",
            status: account.status || "INACTIVE",
            createdAt: assistant.createdAt,
          };
        });
        setAssistants(parsed);
        setPagination({
          page: res.data.pagination?.page || 1,
          limit: res.data.pagination?.limit || 10,
          totalPages: res.data.pagination?.totalPages || 1,
        });
      } else {
        setAssistants([]);
      }
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

  // Gọi lại API khi tìm kiếm thay đổi
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAssistants(1, searchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Điều hướng phân trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchAssistants(newPage, searchTerm);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
        <UserCog size={26} /> Trợ lý của tôi
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
        ) : assistants.length === 0 ? (
          <p className="text-gray-500 text-sm italic">
            Không có tài khoản trợ lý nào.
          </p>
        ) : (
          <>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-700 font-semibold text-left">
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Giới tính</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Loại trợ lý</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {assistants.map((a) => (
                  <tr
                    key={a._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {/* Họ và tên */}
                    <td className="p-3 font-medium text-gray-800">{a.name}</td>

                    {/* Giới tính */}
                    <td className="p-3 text-gray-600">
                      {a.gender === "MALE"
                        ? "Nam"
                        : a.gender === "FEMALE"
                        ? "Nữ"
                        : a.gender}
                    </td>

                    {/* Email */}
                    <td className="p-3 text-gray-600">{a.email}</td>

                    {/* Số điện thoại */}
                    <td className="p-3 text-gray-600">{a.phone_number}</td>

                    {/* Loại trợ lý (NURSE / RECEPTIONIST) */}
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {a.type.includes("NURSE") && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Y tá
                          </span>
                        )}
                        {a.type.includes("RECEPTIONIST") && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                            Chăm sóc KH
                          </span>
                        )}
                        {a.type.length === 0 && (
                          <span className="text-gray-400 text-xs italic">
                            Không xác định
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái */}
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

                    {/* Ngày tạo */}
                    <td className="p-3 text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phân trang */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(AssistantManagement);
