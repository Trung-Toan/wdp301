import React, { memo } from "react";

const AssistantDashboard = () => {
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard - Assistant</h2>
      <p>Giao diện thử nghiệm cho trợ lý y tế.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <div
          style={{ flex: 1, padding: 12, background: "#fff", borderRadius: 8 }}
        >
          Yêu cầu hồ sơ
        </div>
        <div
          style={{ flex: 1, padding: 12, background: "#fff", borderRadius: 8 }}
        >
          Lịch làm việc
        </div>
        <div
          style={{ flex: 1, padding: 12, background: "#fff", borderRadius: 8 }}
        >
          Chat với bác sĩ
        </div>
      </div>
    </div>
  );
};

export default memo(AssistantDashboard);
