import React, { useState, useEffect } from "react";
import {
  Clipboard2Pulse,
  Person,
  PersonBadge,
  Telephone,
  CheckCircle,
  XCircle,
  FileEarmarkPlus,
  EyeFill,
  PencilFill,
} from "react-bootstrap-icons";
import { MEDICAL_RECORD_API } from "../../api/assistant/assistant.api";
import { useDataByUrl } from "../../utility/data.utils";

const AppComponent = ({
  appointment,
  patient,
  item,
  statusInfo,
  badgeColor,
  typeAss,
  handleVerifyStatus,
  openRecordModal,
  onRecordLoaded,
  onRecordLoadingChange,
  onRecordError,
}) => {
  const record = appointment.medical_record;
  const hasRecord = !!record;
  const recordPrescriptionStatus = record?.prescription?.status;

  const roles = Array.isArray(typeAss) ? typeAss : [];
  const isNurseOnly = roles.length === 1 && roles[0] === "NURSE";
  const isReceptionistOnly = roles.length === 1 && roles[0] !== "NURSE";
  const hasBothRoles = roles.length >= 2;

  // ====== FETCH HỒ SƠ (đã move xuống đây) ======
  const [shouldFetchRecord, setShouldFetchRecord] = useState(false);

  const {
    data: mrc,
    isLoading: isMrcLoading,
    error: mrcError,
  } = useDataByUrl({
    url: MEDICAL_RECORD_API.GET_MEDICAL_RECORD_BY_APPOINTMENT_ID(appointment?.appointment_id),
    key: "get-medical-record-by-appointment-id",
  });

  console.log("mrc: ", mrc);
  console.log("appointment: ", appointment);

  

  useEffect(() => {
    if (!shouldFetchRecord) return;

    // notify loading
    onRecordLoadingChange &&
      onRecordLoadingChange(appointment.appointment_id, isMrcLoading);

    if (!isMrcLoading && mrc) {
      const apiRecord = Array.isArray(mrc.data) ? mrc.data[0] : mrc.data?.[0];
      if (apiRecord) {
        onRecordLoaded &&
          onRecordLoaded(appointment.appointment_id, apiRecord);
        setShouldFetchRecord(false);
      }
    }

    if (!isMrcLoading && mrcError) {
      onRecordError &&
        onRecordError(
          appointment.appointment_id,
          mrcError.message || "Lỗi tải hồ sơ bệnh án"
        );
      setShouldFetchRecord(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchRecord, isMrcLoading, mrc, mrcError]);

  // ====== Buttons ======
  const ApproveBtn = () => (
    <button
      onClick={() =>
        handleVerifyStatus(appointment.appointment_id, "APPROVE")
      }
      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
      title="Duyệt"
    >
      <CheckCircle size={16} />
    </button>
  );

  const CancelBtn = () => (
    <button
      onClick={() =>
        handleVerifyStatus(appointment.appointment_id, "CANCELLED")
      }
      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
      title="Từ chối"
    >
      <XCircle size={16} />
    </button>
  );

  const NoShowBtn = () => (
    <button
      onClick={() =>
        handleVerifyStatus(appointment.appointment_id, "NO_SHOW")
      }
      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
      title="Vắng mặt"
    >
      <XCircle size={16} />
    </button>
  );

  const CreateRecordBtn = () => (
    <button
      onClick={() => openRecordModal(item, "CREATE")}
      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
      title="Tạo bệnh án"
    >
      <FileEarmarkPlus size={16} />
    </button>
  );

  const ViewRecordBtn = () => (
    <button
      onClick={() => {
        openRecordModal(item, "VIEW");
        setShouldFetchRecord(true);
      }}
      className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
      title="Xem bệnh án"
    >
      <EyeFill size={16} />
    </button>
  );

  const EditRecordBtn = () => (
    <button
      onClick={() => {
        openRecordModal(item, "EDIT");
        setShouldFetchRecord(true);
      }}
      className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50"
      title="Sửa bệnh án"
      disabled={recordPrescriptionStatus === "VERIFIED"}
    >
      <PencilFill size={16} />
    </button>
  );

  const StatusBadge = () => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
    >
      {statusInfo.label}
    </span>
  );

  const renderActions = () => {
    // --- Chỉ NURSE ---
    if (isNurseOnly) {
      if (appointment.status === "SCHEDULED") return <StatusBadge />;

      if (appointment.status === "APPROVE") {
        return (
          <>
            <StatusBadge />
            {!hasRecord && <CreateRecordBtn />}
          </>
        );
      }

      if (appointment.status === "COMPLETED") {
        return (
          <>
            <StatusBadge />
            {recordPrescriptionStatus === "PENDING" && (
              <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                Đơn thuốc chờ duyệt
              </span>
            )}
            <ViewRecordBtn />
            <EditRecordBtn />
          </>
        );
      }

      if (["CANCELLED", "NO_SHOW"].includes(appointment.status)) {
        return <StatusBadge />;
      }
    }

    // --- Chỉ RECEPTIONIST (hoặc role khác không phải NURSE đơn lẻ) ---
    if (isReceptionistOnly) {
      if (appointment.status === "SCHEDULED") {
        return (
          <>
            <StatusBadge />
            <ApproveBtn />
            <CancelBtn />
          </>
        );
      }

      if (appointment.status === "APPROVE") {
        return (
          <>
            <StatusBadge />
            <NoShowBtn />
          </>
        );
      }

      if (appointment.status === "COMPLETED") {
        return (
          <>
            <StatusBadge />
            {recordPrescriptionStatus === "PENDING" && (
              <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                Đơn thuốc chờ duyệt
              </span>
            )}
            <ViewRecordBtn />
          </>
        );
      }

      if (["CANCELLED", "NO_SHOW"].includes(appointment.status)) {
        return <StatusBadge />;
      }
    }

    // --- Có nhiều role (NURSE + DOCTOR, etc.) ---
    if (hasBothRoles) {
      if (appointment.status === "SCHEDULED") {
        return (
          <>
            <StatusBadge />
            <ApproveBtn />
            <CancelBtn />
          </>
        );
      }

      if (appointment.status === "APPROVE") {
        return (
          <>
            <StatusBadge />
            <NoShowBtn />
            {!hasRecord && <CreateRecordBtn />}
          </>
        );
      }

      if (appointment.status === "COMPLETED") {
        return (
          <>
            <StatusBadge />
            {recordPrescriptionStatus === "PENDING" && (
              <span className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                Đơn thuốc chờ duyệt
              </span>
            )}
            <ViewRecordBtn />
            <EditRecordBtn />
          </>
        );
      }

      if (["CANCELLED", "NO_SHOW"].includes(appointment.status)) {
        return <StatusBadge />;
      }
    }

    // Mặc định
    return <StatusBadge />;
  };

  // ==== UI chính ====
  return (
    <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg shadow-sm">
      {/* Thông tin bệnh nhân */}
      <div className="flex items-center gap-4 mb-2 sm:mb-0">
        <Person className="text-blue-600" size={20} />
        <div>
          <p className="font-semibold">
            {patient.patient_name || "Bệnh nhân ẩn"}
          </p>
          <p className="text-gray-500 text-sm">
            <Telephone className="inline mr-1" />
            {patient.phone_number || "Không rõ"}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            <PersonBadge className="inline mr-1" />
            Mã BN: {patient.patient_code || "N/A"}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            <Clipboard2Pulse className="inline mr-1" />
            Lý do: {appointment.reason || "Không rõ"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">{renderActions()}</div>
    </div>
  );
};

export default AppComponent;
