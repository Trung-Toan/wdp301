"use client";
import "../../styles/admin-system/ConfirmModal.css";

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            className="btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
