"use client"

import { useState } from "react"
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

const Dashboard = () => {
  const [viewModal, setViewModal] = useState(null)

  // ====== DỮ LIỆU BIỂU ĐỒ ======
  const userStats = [
    { month: "1", users: 400, clinics: 230 },
    { month: "2", users: 300, clinics: 220 },
    { month: "3", users: 280, clinics: 200 },
    { month: "4", users: 190, clinics: 230 },
    { month: "5", users: 240, clinics: 210 },
  ]

  const complaintData = [
    { name: "Đã xử lý", value: 65 },
    { name: "Đang chờ", value: 25 },
    { name: "Leo thang", value: 10 },
  ]

  const bookingData = [
    { name: "0", bookings: 220 },
    { name: "1", bookings: 180 },
    { name: "2", bookings: 190 },
    { name: "3", bookings: 200 },
    { name: "4", bookings: 230 },
    { name: "5", bookings: 185 },
  ]

  const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"]

  const stats = [
    { label: "Tổng người dùng", value: "2,543", change: "+12% so với tháng trước" },
    { label: "Phòng khám", value: "156", change: "+5% so với tháng trước" },
    { label: "Lịch khám hôm nay", value: "89", change: "+23% so với tháng trước" },
    { label: "Khiếu nại chưa xử lý", value: "12", change: "-8% so với tháng trước" },
  ]

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
          <LineChart width={500} height={250} data={userStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="clinics" stroke="#14b8a6" strokeWidth={2} />
          </LineChart>
        </div>

        {/* Biểu đồ khiếu nại */}
        <div className="chart-card-dark">
          <h2 className="chart-title">Trạng thái khiếu nại</h2>
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
        </div>

        {/* Biểu đồ lịch khám */}
        <div className="chart-card-dark" style={{ gridColumn: "span 2" }}>
          <h2 className="chart-title">Thống kê lịch khám</h2>
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
        </div>
      </div>

      {viewModal && <ViewModal data={viewModal} onClose={() => setViewModal(null)} />}
    </div>
  )
}

export default Dashboard
