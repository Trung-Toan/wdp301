"use client";

import { useState } from "react";
import "../styles/Dashboard.css";
import ViewModal from "./ViewModal";

const Dashboard = () => {
  const [viewModal, setViewModal] = useState(null);

  const stats = [
    { label: "Tổng người dùng", value: "1,234", icon: "👥", color: "#3b82f6" },
    { label: "Phòng khám", value: "45", icon: "🏥", color: "#10b981" },
    { label: "Lịch khám", value: "892", icon: "📅", color: "#f59e0b" },
    { label: "Khiếu nại", value: "12", icon: "⚠️", color: "#ef4444" },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Tài khoản mới",
      user: "Nguyễn Văn A",
      time: "2 giờ trước",
    },
    {
      id: 2,
      action: "Phòng khám được phê duyệt",
      clinic: "Phòng khám ABC",
      time: "4 giờ trước",
    },
    {
      id: 3,
      action: "Khiếu nại mới",
      complaint: "Dịch vụ kém",
      time: "6 giờ trước",
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bảng điều khiển</h1>
        <p>Chào mừng quay lại, Admin</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h2>Hoạt động gần đây</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-detail">
                    {activity.user || activity.clinic || activity.complaint}
                  </p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h2>Thống kê hệ thống</h2>
          <div className="stats-summary">
            <div className="summary-item">
              <span>Tài khoản hoạt động</span>
              <strong>1,150</strong>
            </div>
            <div className="summary-item">
              <span>Phòng khám đang hoạt động</span>
              <strong>42</strong>
            </div>
            <div className="summary-item">
              <span>Bác sĩ đã xác minh</span>
              <strong>380</strong>
            </div>
            <div className="summary-item">
              <span>Lịch khám hôm nay</span>
              <strong>156</strong>
            </div>
          </div>
        </div>
      </div>

      {viewModal && (
        <ViewModal data={viewModal} onClose={() => setViewModal(null)} />
      )}
    </div>
  );
};

export default Dashboard;
