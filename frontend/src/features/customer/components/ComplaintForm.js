import React, { useState } from "react";
import { AlertCircle, X, Upload, FileText, Loader2, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { toast } from "react-toastify";
import { complaintApi } from "../../../api/patients/complaintApi";

/**
 * Component form khiếu nại về bác sĩ hoặc phòng khám
 * @param {Object} props
 * @param {string} props.complaintType - Loại khiếu nại: "DOCTOR" hoặc "CLINIC"
 * @param {string} props.doctorId - ID bác sĩ (nếu complaintType = "DOCTOR")
 * @param {string} props.clinicId - ID phòng khám (nếu complaintType = "CLINIC")
 * @param {string} props.appointmentId - ID lịch hẹn (tùy chọn)
 * @param {Function} props.onClose - Callback khi đóng form
 * @param {Function} props.onSuccess - Callback khi gửi thành công
 */
export default function ComplaintForm({
    complaintType,
    doctorId,
    clinicId,
    appointmentId,
    onClose,
    onSuccess,
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [evidence, setEvidence] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim()) {
            setError("Vui lòng nhập tiêu đề khiếu nại");
            return;
        }

        if (!content.trim()) {
            setError("Vui lòng nhập nội dung khiếu nại");
            return;
        }

        if (content.trim().length < 20) {
            setError("Nội dung khiếu nại phải có ít nhất 20 ký tự");
            return;
        }

        if (complaintType === "DOCTOR" && !doctorId) {
            setError("Không tìm thấy thông tin bác sĩ");
            return;
        }

        if (complaintType === "CLINIC" && !clinicId) {
            setError("Không tìm thấy thông tin phòng khám");
            return;
        }

        try {
            setSubmitting(true);

            const data = {
                title: title.trim(),
                content: content.trim(),
                complaint_type: complaintType,
                evidence: evidence,
            };

            if (complaintType === "DOCTOR") {
                data.doctor_id = doctorId;
            } else {
                data.clinic_id = clinicId;
            }

            if (appointmentId) {
                data.appointment_id = appointmentId;
            }

            const response = await complaintApi.createComplaint(data);

            if (response.data.success) {
                toast.success("Gửi khiếu nại thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.");
                if (onSuccess) {
                    onSuccess(response.data.data);
                }
                if (onClose) {
                    onClose();
                }
            }
        } catch (err) {
            console.error("Error creating complaint:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại sau.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        // TODO: Implement file upload to server
        // For now, we'll skip file upload and just store file names
        const files = Array.from(e.target.files);
        // Giới hạn 5 files, mỗi file tối đa 5MB
        if (files.length + evidence.length > 5) {
            toast.error("Chỉ được tải lên tối đa 5 file");
            return;
        }

        files.forEach((file) => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} vượt quá 5MB`);
                return;
            }

            // Tạm thời chỉ lưu tên file, sẽ upload sau khi có API upload
            setEvidence([...evidence, file.name]);
        });
    };

    const removeEvidence = (index) => {
        setEvidence(evidence.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 text-white p-5 sm:p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg flex-shrink-0">
                                <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1">Gửi khiếu nại</h2>
                                <p className="text-white/90 text-xs sm:text-sm">
                                    {complaintType === "DOCTOR" ? "Về bác sĩ" : "Về phòng khám"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 flex-shrink-0"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-900 flex-1">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Tiêu đề khiếu nại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ví dụ: Khiếu nại về thái độ phục vụ"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 font-medium transition-all"
                                required
                                maxLength={100}
                            />
                            <p className="mt-1 text-xs text-gray-500">{title.length}/100 ký tự</p>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Nội dung khiếu nại <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 20 ký tự)..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 font-medium transition-all resize-none"
                                rows="6"
                                required
                                minLength={20}
                                maxLength={2000}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {content.length}/2000 ký tự (tối thiểu 20 ký tự)
                            </p>
                        </div>

                        {/* Evidence Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Bằng chứng (tùy chọn)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-red-400 transition-colors">
                                <input
                                    type="file"
                                    id="evidence-upload"
                                    className="hidden"
                                    multiple
                                    accept="image/*,application/pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="evidence-upload"
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Nhấn để tải lên bằng chứng
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Tối đa 5 file, mỗi file tối đa 5MB (Hỗ trợ: ảnh, PDF, Word)
                                    </p>
                                </label>
                            </div>

                            {evidence.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {evidence.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                                            <span className="flex-1 text-sm text-gray-700 truncate">
                                                {file}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeEvidence(index)}
                                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                            >
                                                <X className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                                        <strong className="font-semibold">Lưu ý:</strong> Khiếu nại của bạn sẽ được xem xét bởi đội ngũ quản trị viên. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất có thể.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-5 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-5 sm:px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Gửi khiếu nại
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

