import { useState, useEffect, memo } from "react";
import { Button, Spinner, Modal, Form, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { CheckCircle, XCircle, FileText, Clock } from "lucide-react";

// URL server file của bạn
const FILE_SERVER_URL = "http://localhost:5000/uploads";

const ApproveDoctorLicenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal từ chối
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm tải danh sách
  const fetchPendingLicenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminclinicAPI.getPendingLicenses();
      if (res.data.ok) {
        setLicenses(res.data.data);
      } else {
        throw new Error(res.data.message || "Không thể tải danh sách");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi tải danh sách: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách khi component mount
  useEffect(() => {
    fetchPendingLicenses();
  }, []);

  // Hàm xử lý khi bấm "Duyệt"
  const handleApprove = async (licenseId) => {
    try {
      const payload = { status: "APPROVED" };
      await adminclinicAPI.updateLicenseStatus(licenseId, payload);
      toast.success("Duyệt chứng chỉ thành công!");

      // Xóa chứng chỉ khỏi danh sách
      setLicenses((prev) => prev.filter((lic) => lic._id !== licenseId));
    } catch (err) {
      toast.error("Lỗi khi duyệt: " + err.message);
    }
  };

  // Mở modal khi bấm "Từ chối"
  const openRejectModal = (licenseId) => {
    setSelectedLicenseId(licenseId);
    setShowRejectModal(true);
  };

  // Đóng modal
  const closeRejectModal = () => {
    setSelectedLicenseId(null);
    setShowRejectModal(false);
    setRejectionReason("");
    setIsSubmitting(false);
  };

  // Hàm xử lý khi xác nhận "Từ chối"
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: "REJECTED",
        rejected_reason: rejectionReason,
      };
      await adminclinicAPI.updateLicenseStatus(selectedLicenseId, payload);
      toast.success("Đã từ chối chứng chỉ.");

      // Xóa chứng chỉ khỏi danh sách
      setLicenses((prev) =>
        prev.filter((lic) => lic._id !== selectedLicenseId)
      );
      closeRejectModal();
    } catch (err) {
      toast.error("Lỗi khi từ chối: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner animation="border" variant="primary" />
        <p className="ml-3 text-gray-600">Đang tải danh sách chờ duyệt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <strong>Lỗi:</strong> {error}
      </Alert>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="p-5 bg-green-50 border border-green-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-green-700">Tuyệt vời!</h3>
        <p className="text-gray-600">Không có chứng chỉ nào đang chờ duyệt.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-800 mb-6">
        Duyệt chứng chỉ hành nghề của bác sĩ
      </h2>

      <div className="space-y-6">
        {licenses.map((lic) => {
          const doctor = lic.doctor_id;
          const user = doctor?.user_id;

          // Xử lý avatar URL
          const avatarUrl = user?.avatar_url
            ? user.avatar_url.startsWith("http")
              ? user.avatar_url
              : `${FILE_SERVER_URL}/${user.avatar_url}`
            : defaultAvatar;

          // Xử lý file URL
          const fileUrl =
            lic.document_url && lic.document_url.length > 0
              ? `${FILE_SERVER_URL}/${lic.document_url[0]}`
              : "#";

          return (
            <div
              key={lic._id}
              className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Thông tin bác sĩ */}
                <div className="flex items-center mb-4 pb-4 border-b">
                  <img
                    src={avatarUrl}
                    alt={user?.full_name || "Avatar"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      BS. {user?.full_name || "(Không rõ tên)"}
                    </h3>
                  </div>
                </div>

                {/* Chi tiết chứng chỉ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  <p className="text-gray-700">
                    <strong>Số hiệu:</strong> {lic.licenseNumber}
                  </p>
                  <p className="text-gray-700">
                    <strong>Cơ quan cấp:</strong> {lic.issued_by}
                  </p>
                  <p className="text-gray-700">
                    <strong>Ngày cấp:</strong>{" "}
                    {new Date(lic.issued_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <strong>Ngày hết hạn:</strong>{" "}
                    {new Date(lic.expiry_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 col-span-2">
                    <strong>Tệp đính kèm:</strong>{" "}
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      <FileText size={16} className="inline-block mr-1" />
                      {lic.document_url[0]}
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Ngày gửi:</strong>{" "}
                    <span className="text-gray-500">
                      <Clock size={14} className="inline-block mr-1" />
                      {new Date(lic.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Khu vực nút bấm */}
              <div className="bg-gray-50 p-4 flex justify-end space-x-3">
                <Button
                  variant="danger"
                  onClick={() => openRejectModal(lic._id)}
                  className="flex items-center"
                >
                  <XCircle size={18} className="mr-2" />
                  Từ chối
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApprove(lic._id)}
                  className="flex items-center"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Duyệt
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal xác nhận từ chối */}
      <Modal show={showRejectModal} onHide={closeRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận từ chối chứng chỉ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc muốn từ chối chứng chỉ này? Vui lòng cung cấp lý do:
          </p>
          <Form.Control
            as="textarea"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối (bắt buộc)..."
            isInvalid={!rejectionReason.trim() && isSubmitting} // Hiển thị lỗi nếu bấm submit mà chưa nhập
          />
          <Form.Control.Feedback type="invalid">
            Vui lòng nhập lý do.
          </Form.Control.Feedback>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRejectModal}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={submitRejection}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner as="span" animation="border" size="sm" role="status" />
            ) : (
              "Xác nhận từ chối"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default memo(ApproveDoctorLicenses);
