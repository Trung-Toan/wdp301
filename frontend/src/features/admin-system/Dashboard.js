"use client"

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
import "../../styles/admin-system/Dashboard.css"
import ViewModal from "./ViewModal"
import { adminSystemAPI } from "../../api/admin-system/adminSystemAPI"
import { Spinner } from "react-bootstrap"

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
        
        // Cập nhật stats
        if (data.stats) {
          setStats([
            { 
              label: "Tổng người dùng", 
              value: data.stats.totalUsers?.value || "0", 
              change: data.stats.totalUsers?.change || "0% so với tháng trước" 
            },
            { 
              label: "Phòng khám", 
              value: data.stats.totalClinics?.value || "0", 
              change: data.stats.totalClinics?.change || "0% so với tháng trước" 
            },
            { 
              label: "Lịch khám hôm nay", 
              value: data.stats.todayAppointments?.value || "0", 
              change: data.stats.todayAppointments?.change || "0% so với tháng trước" 
            },
            { 
              label: "Khiếu nại chưa xử lý", 
              value: data.stats.pendingComplaints?.value || "0", 
              change: data.stats.pendingComplaints?.change || "0% so với tháng trước" 
            },
          ])
        }

        // Cập nhật charts
        if (data.charts) {
          if (data.charts.userStats) {
            setUserStats(data.charts.userStats || [])
          }
          if (data.charts.complaintData) {
            setComplaintData(data.charts.complaintData || [])
          }
          if (data.charts.bookingData) {
            setBookingData(data.charts.bookingData || [])
          }
        }
      } else {
        setError("Không thể tải dữ liệu dashboard")
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      // Xử lý lỗi kết nối
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('CONNECTION_REFUSED')) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra xem backend server đã chạy chưa.")
      } else {
        setError(err.response?.data?.message || err.message || "Lỗi khi tải dữ liệu dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-dark" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <p style={{ marginTop: "1rem", color: "#94a3b8" }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-dark" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
          <button 
            onClick={fetchDashboardStats}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer"
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-dark">
      <h1 className="dashboard-title">Bảng điều khiển</h1>
      <p className="dashboard-subtitle">Chào mừng quay lại, Admin 👋</p>

      {/* ==== Stats Grid ==== */}
      <div className="stats-section">
        {stats.map((s, i) => (
          <div key={i} className="stat-card-dark">
            <h4 className="stat-label">{s.label}</h4>
            <h2 className="stat-value">{s.value}</h2>
            <p className={`stat-change ${s.change.includes("-") ? "negative" : "positive"}`}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* ==== Charts Grid ==== */}
      <div className="chart-grid">
        {/* Biểu đồ người dùng */}
        <div className="chart-card-dark">
          <h2 className="chart-title">Thống kê người dùng</h2>
          {userStats.length > 0 ? (
            <LineChart width={500} height={250} data={userStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="clinics" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "250px", color: "#94a3b8" }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ khiếu nại */}
        <div className="chart-card-dark">
          <h2 className="chart-title">Trạng thái khiếu nại</h2>
          {complaintData.length > 0 ? (
            <PieChart width={400} height={250}>
              <Pie
                data={complaintData}
                cx={200}
                cy={120}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {complaintData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "250px", color: "#94a3b8" }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ lịch khám */}
        <div className="chart-card-dark" style={{ gridColumn: "span 2" }}>
          <h2 className="chart-title">Thống kê lịch khám</h2>
          {bookingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                <Legend />
                <Bar dataKey="bookings" fill="#3b82f6" barSize={50} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px", color: "#94a3b8" }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {viewModal && <ViewModal data={viewModal} onClose={() => setViewModal(null)} />}
    </div>
  )
}

export default Dashboard
