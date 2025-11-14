// src/components/appointment/AppListComponent.js
import { memo } from "react";
import AppComponent from "./app";

const getStatusBadge = (status) => {
  const config = {
    SCHEDULED: { label: "Chờ duyệt", className: "status-scheduled" },
    APPROVE: { label: "Đã duyệt", className: "status-approved" },
    COMPLETED: { label: "Đã khám xong", className: "status-completed" },
    CANCELLED: { label: "Đã hủy", className: "status-cancelled" },
    NO_SHOW: { label: "Vắng mặt", className: "status-no-show" },
  };
  return config[status] || config.SCHEDULED;
};

const AppListComponent = ({
  appointments,
  typeAss,
  handleVerifyStatus,
  openRecordModal,
  onRecordLoaded,
  onRecordLoadingChange,
  onRecordError,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Không có bệnh nhân nào.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {appointments.map((item) => {
        const { appointment, patient } = item;
        const statusInfo = getStatusBadge(appointment.status);

        let badgeColor = "bg-gray-100 text-gray-700";
        if (statusInfo.className === "status-scheduled")
          badgeColor = "bg-blue-100 text-blue-700";
        else if (statusInfo.className === "status-approved")
          badgeColor = "bg-green-100 text-green-700";
        else if (statusInfo.className === "status-completed")
          badgeColor = "bg-indigo-100 text-indigo-700";
        else if (
          statusInfo.className === "status-cancelled" ||
          statusInfo.className === "status-no-show"
        )
          badgeColor = "bg-red-100 text-red-700";

        return (
          <AppComponent
            key={appointment.appointment_id}
            appointment={appointment}
            patient={patient}
            item={item}
            statusInfo={statusInfo}
            badgeColor={badgeColor}
            typeAss={typeAss}
            handleVerifyStatus={handleVerifyStatus}
            openRecordModal={openRecordModal}
            onRecordLoaded={onRecordLoaded}
            onRecordLoadingChange={onRecordLoadingChange}
            onRecordError={onRecordError}
          />
        );
      })}
    </div>
  );
};

export default memo(AppListComponent);
