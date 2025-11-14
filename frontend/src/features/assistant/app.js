import React, { useState, useEffect } from "react";
import {
  Clipboard2Pulse,
  PersonCircle,
  PersonBadge,
  Telephone,
  CheckCircleFill,
  XCircleFill,
  FileEarmarkPlusFill,
  EyeFill,
  PencilFill,
  Calendar3,
  Clock,
  Capsule,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import { MEDICAL_RECORD_API } from "../../api/assistant/assistant.api";
import { useDataByUrl } from "../../utility/data.utils";

const AppComponent = ({
  setSelectedApp,
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
  const localPrescriptionStatus = record?.prescription?.status;

  const roles = Array.isArray(typeAss) ? typeAss : [];
  const isNurseOnly = roles.length === 1 && roles[0] === "NURSE";
  const isReceptionistOnly = roles.length === 1 && roles[0] !== "NURSE";
  const hasBothRoles = roles.length >= 2;

  const [shouldFetchRecord, setShouldFetchRecord] = useState(false);

  const {
    data: mrc,
    isLoading: isMrcLoading,
    error: mrcError,
  } = useDataByUrl({
    url: MEDICAL_RECORD_API.GET_MEDICAL_RECORD_BY_APPOINTMENT_ID(
      appointment?.appointment_id
    ),
    key: [
      "get-medical-record-by-appointment-id",
      appointment?.appointment_id,
    ],
    options: {
      enabled: !!appointment?.appointment_id && shouldFetchRecord,
    },
  });

  // Chuẩn hóa data record từ API
  const apiRecord = Array.isArray(mrc?.data)
    ? mrc.data[0]
    : mrc?.data?.[0];

  const apiPrescriptionStatus = apiRecord?.prescription?.status;
  const displayPrescriptionStatus = apiPrescriptionStatus || localPrescriptionStatus;
  const hasApiRecord = !!apiRecord;
  const showNoRecord = !hasRecord && !hasApiRecord && !isMrcLoading;

  // CHỈ VÔ HIỆU HÓA EDIT KHI VERIFIED
  const isEditDisabled = displayPrescriptionStatus === "VERIFIED";

  useEffect(() => {
    if (!shouldFetchRecord) return;

    onRecordLoadingChange?.(appointment.appointment_id, isMrcLoading);

    if (!isMrcLoading && apiRecord) {
      onRecordLoaded?.(appointment.appointment_id, apiRecord);
      setShouldFetchRecord(false);
    }

    if (!isMrcLoading && mrcError) {
      onRecordError?.(
        appointment.appointment_id,
        mrcError.message || "Lỗi tải hồ sơ"
      );
      setShouldFetchRecord(false);
    }
    setSelectedApp(mrc.data[0] || mrc?.data?.[0])
  }, [
    shouldFetchRecord,
    isMrcLoading,
    apiRecord,
    mrcError,
    appointment.appointment_id,
    onRecordLoaded,
    onRecordLoadingChange,
    onRecordError,
  ]);

  // ====== AVATAR BỆNH NHÂN ======
  const PatientAvatar = () => {
    const gender = patient?.gender;
    const bgColor =
      gender === "MALE"
        ? "bg-blue-100"
        : gender === "FEMALE"
        ? "bg-pink-100"
        : "bg-gray-100";
    const iconColor =
      gender === "MALE"
        ? "text-blue-600"
        : gender === "FEMALE"
        ? "text-pink-600"
        : "text-gray-600";

    return (
      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <PersonCircle className={iconColor} size={26} />
      </div>
    );
  };

  // ====== BADGE TRẠNG THÁI LỊCH HẸN ======
  const AppointmentStatusBadge = () => {
    const config = {
      SCHEDULED: {
        label: "Đã đặt",
        color: "bg-purple-100 text-purple-800",
        icon: <Calendar3 size={14} />,
      },
      APPROVE: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: <CheckCircleFill size={14} />,
      },
      COMPLETED: {
        label: "Đã khám",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircleFill size={14} />,
      },
      CANCELLED: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: <XCircleFill size={14} />,
      },
      NO_SHOW: {
        label: "Vắng mặt",
        color: "bg-orange-100 text-orange-800",
        icon: <ExclamationTriangleFill size={14} />,
      },
    };

    const { label, color, icon } = config[appointment.status] || {
      label: appointment.status,
      color: "bg-gray-100 text-gray-700",
      icon: <Calendar3 size={14} />,
    };

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${color}`}>
        {icon} {label}
      </span>
    );
  };

  // ====== BADGE TRẠNG THÁI ĐƠN THUỐC ======
  const PrescriptionStatusBadge = () => {
    if (!displayPrescriptionStatus) return null;

    const config = {
      PENDING: {
        label: "Chờ duyệt đơn",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={14} />,
      },
      VERIFIED: {
        label: "Đã duyệt đơn",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircleFill size={14} />,
      },
      REJECTED: {
        label: "Từ chối đơn",
        color: "bg-red-100 text-red-800",
        icon: <XCircleFill size={14} />,
      },
    };

    const { label, color, icon } = config[displayPrescriptionStatus] || {
      label: displayPrescriptionStatus,
      color: "bg-gray-100 text-gray-700",
      icon: <Capsule size={14} />,
    };

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${color}`}>
        {icon} {label}
      </span>
    );
  };

  // ====== THÔNG BÁO CHƯA CÓ BỆNH ÁN ======
  const NoRecordMessage = () => (
    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm italic shadow-sm">
      <Clipboard2Pulse size={14} /> Chưa có bệnh án
    </span>
  );

  // ====== NÚT HÀNH ĐỘNG ======
  const ActionButton = ({
    onClick,
    label,
    icon,
    color = "blue",
    disabled = false,
    variant = "solid",
  }) => {
    const variants = {
      solid: {
        green: "bg-green-600 text-white hover:bg-green-700",
        red: "bg-red-600 text-white hover:bg-red-700",
        blue: "bg-blue-600 text-white hover:bg-blue-700",
        indigo: "bg-indigo-600 text-white hover:bg-indigo-700",
        amber: "bg-amber-600 text-white hover:bg-amber-700",
        gray: "bg-gray-400 text-white cursor-not-allowed",
      },
      outline: {
        green: "border border-green-600 text-green-600 hover:bg-green-50",
        red: "border border-red-600 text-red-600 hover:bg-red-50",
        blue: "border border-blue-600 text-blue-600 hover:bg-blue-50",
        indigo: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
        amber: "border border-amber-600 text-amber-600 hover:bg-amber-50",
      },
    };

    const style =
      variant === "outline"
        ? variants.outline[color]
        : variants.solid[color];

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm ${style}`}
      >
        {icon} {label}
      </button>
    );
  };

  const ApproveBtn = () => (
    <ActionButton
      onClick={() =>
        handleVerifyStatus(appointment.appointment_id, "APPROVE")
      }
      label="Duyệt lịch"
      icon={<CheckCircleFill size={16} />}
      color="green"
    />
  );

  const CancelBtn = () => (
    <ActionButton
      onClick={() =>
        handleVerifyStatus(appointment.appointment_id, "CANCELLED")
      }
      label="Hủy lịch"
      icon={<XCircleFill size={16} />}
      color="red"
    />
  );

  const NoShowBtn = () => (
    <ActionButton
      onClick={() =>
        handleVerifyStatus(appointment.appointment_id, "NO_SHOW")
      }
      label="Vắng mặt"
      icon={<ExclamationTriangleFill size={16} />}
      color="red"
      variant="outline"
    />
  );

  const CreateRecordBtn = () => (
    <ActionButton
      onClick={() => openRecordModal(item, "CREATE")}
      label="Tạo bệnh án"
      icon={<FileEarmarkPlusFill size={16} />}
      color="blue"
    />
  );

  const ViewRecordBtn = () => (
    <ActionButton
      onClick={() => {
        openRecordModal(item, "VIEW");
        setShouldFetchRecord(true);
      }}
      label="Xem bệnh án"
      icon={<EyeFill size={16} />}
      color="indigo"
      variant="outline"
    />
  );

  const EditRecordBtn = () => (
    <ActionButton
      onClick={() => {
        openRecordModal(item, "EDIT");
        setShouldFetchRecord(true);
      }}
      label={
        isEditDisabled
          ? "Đã duyệt, không thể sửa"
          : displayPrescriptionStatus === "REJECTED"
          ? "Sửa lại bệnh án"
          : "Sửa bệnh án"
      }
      icon={<PencilFill size={16} />}
      color={isEditDisabled ? "gray" : "amber"}
      disabled={isEditDisabled}
    />
  );

  // ====== RENDER HÀNH ĐỘNG THEO VAI TRÒ ======
  const renderActions = () => {
    const statusBadges = (
      <div className="flex flex-wrap items-center gap-2">
        <AppointmentStatusBadge />
        {displayPrescriptionStatus && <PrescriptionStatusBadge />}
      </div>
    );

    const hasMedicalRecord = hasRecord || hasApiRecord;

    if (isNurseOnly) {
      if (appointment.status === "SCHEDULED") return statusBadges;

      if (appointment.status === "APPROVE") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {!hasMedicalRecord && <CreateRecordBtn />}
          </div>
        );
      }

      if (appointment.status === "COMPLETED") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {hasMedicalRecord ? (
              <>
                <ViewRecordBtn />
                <EditRecordBtn />
              </>
            ) : (
              <NoRecordMessage />
            )}
          </div>
        );
      }

      if (["CANCELLED", "NO_SHOW"].includes(appointment.status)) {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {showNoRecord && <NoRecordMessage />}
          </div>
        );
      }
    }

    if (isReceptionistOnly) {
      if (appointment.status === "SCHEDULED") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            <ApproveBtn />
            <CancelBtn />
          </div>
        );
      }

      if (appointment.status === "APPROVE") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            <NoShowBtn />
          </div>
        );
      }

      if (appointment.status === "COMPLETED") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {hasMedicalRecord ? <ViewRecordBtn /> : <NoRecordMessage />}
          </div>
        );
      }

      if (["CANCELLED", "NO_SHOW"].includes(appointment.status)) {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {showNoRecord && <NoRecordMessage />}
          </div>
        );
      }
    }

    if (hasBothRoles) {
      if (appointment.status === "SCHEDULED") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            <ApproveBtn />
            <CancelBtn />
          </div>
        );
      }

      if (appointment.status === "APPROVE") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            <NoShowBtn />
            {!hasMedicalRecord && <CreateRecordBtn />}
          </div>
        );
      }

      if (appointment.status === "COMPLETED") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {hasMedicalRecord ? (
              <>
                <ViewRecordBtn />
                <EditRecordBtn />
              </>
            ) : (
              <NoRecordMessage />
            )}
          </div>
        );
      }

      if (["CANCELLED", "NO_SHOW"].includes(appointment.status)) {
        return (
          <div className="flex flex-wrap items-center gap-2">
            {statusBadges}
            {showNoRecord && <NoRecordMessage />}
          </div>
        );
      }
    }

    return statusBadges;
  };

  // ====== GIAO DIỆN CHÍNH ======
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* THÔNG TIN BỆNH NHÂN */}
        <div className="flex items-start gap-4 flex-1">
          <PatientAvatar />
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-gray-900 text-xl">
              {patient.patient_name || "Bệnh nhân ẩn"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Telephone size={15} /> {patient.phone_number || "Không rõ"}
              </span>
              <span className="flex items-center gap-1.5">
                <PersonBadge size={15} /> {patient.patient_code || "N/A"}
              </span>
            </div>

            <p className="text-sm text-gray-700 flex items-center gap-1.5">
              <Clipboard2Pulse size={15} className="text-blue-600" />
              <span className="font-semibold">Lý do khám:</span>{" "}
              {appointment.reason || "Không rõ"}
            </p>

            {appointment.appointment_time && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar3 size={14} />
                {new Date(appointment.appointment_time).toLocaleString(
                  "vi-VN",
                  {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            )}
          </div>
        </div>

        {/* TRẠNG THÁI & HÀNH ĐỘNG */}
        <div className="flex flex-col gap-3">{renderActions()}</div>
      </div>
    </div>
  );
};

export default AppComponent;
