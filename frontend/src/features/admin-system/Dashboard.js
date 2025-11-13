import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts"
import ViewModal from "./ViewModal"
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI"

const Dashboard = () => {
  const [viewModal, setViewModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState([
    { label: "Tổng người dùng", value: "0", change: "0% so với tháng trước" },
    { label: "Phòng khám", value: "0", change: "0% so với tháng trước" },
    { label: "Lịch khám hôm nay", value: "0", change: "0% so với tháng trước" },
    { label: "Khiếu nại chưa xử lý", value: "0", change: "0% so với tháng trước" },
  ])

  const [userStats, setUserStats] = useState([])
  const [complaintData, setComplaintData] = useState([])
  const [bookingData, setBookingData] = useState([])

  const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"]

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await adminSystemAPI.getDashboardStats()

      if (res.data?.ok && res.data?.data) {
        const data = res.data.data

        if (data.stats) {
          setStats([
            {
              label: "Tổng người dùng",
              value: data.stats.totalUsers?.value || "0",
              change: data.stats.totalUsers?.change || "0% so với tháng trước",
            },
            {
              label: "Phòng khám",
              value: data.stats.totalClinics?.value || "0",
              change: data.stats.totalClinics?.change || "0% so với tháng trước",
            },
            {
              label: "Lịch khám hôm nay",
              value: data.stats.todayAppointments?.value || "0",
              change: data.stats.todayAppointments?.change || "0% so với tháng trước",
            },
            {
              label: "Khiếu nại chưa xử lý",
              value: data.stats.pendingComplaints?.value || "0",
              change: data.stats.pendingComplaints?.change || "0% so với tháng trước",
            },
          ])
        }

        if (data.charts) {
          setUserStats(data.charts.userStats || [])
          setComplaintData(data.charts.complaintData || [])
          setBookingData(data.charts.bookingData || [])
        }
      } else {
        setError("Không thể tải dữ liệu dashboard")
      }
    } catch (err) {
      console.error("Dashboard error:", err)
      if (err.code === "ERR_NETWORK") {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra backend.")
      } else {
        setError(err.response?.data?.message || "Lỗi khi tải dữ liệu dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
      <p className="text-gray-600 mt-1">Chào mừng quay lại, Admin 👋</p>

      {/* ==== Stats ==== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition">
            <h4 className="text-gray-600">{s.label}</h4>
            <h2 className="text-3xl font-bold mt-2 text-gray-900">{s.value}</h2>
            <p
              className={`mt-1 text-sm ${s.change.includes("-") ? "text-red-600" : "text-green-600"
                }`}
            >
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* ==== Charts ==== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Line Chart */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Thống kê người dùng</h2>

          {userStats.length ? (
            <LineChart width={500} height={250} data={userStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="clinics" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          ) : (
            <p className="text-center text-gray-500 h-[250px] flex items-center justify-center">
              Chưa có dữ liệu
            </p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Trạng thái khiếu nại</h2>

          {complaintData.length ? (
            <PieChart width={400} height={250}>
              <Pie
                data={complaintData}
                cx={200}
                cy={120}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {complaintData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            </PieChart>
          ) : (
            <p className="text-center text-gray-500 h-[250px] flex items-center justify-center">
              Chưa có dữ liệu
            </p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Thống kê lịch khám</h2>

          {bookingData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="bookings" fill="#3b82f6" barSize={50} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 h-[300px] flex items-center justify-center">
              Chưa có dữ liệu
            </p>
          )}
        </div>
      </div>

      {viewModal && <ViewModal data={viewModal} onClose={() => setViewModal(null)} />}
    </div>
  )
}

export default Dashboard
