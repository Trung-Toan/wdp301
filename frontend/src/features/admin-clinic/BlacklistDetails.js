"use client"

import { useState } from "react"
import {
    Ban,
    AlertCircle,
    Filter,
    Trash2,
    Eye,
    Edit2,
    Search,
    X,
} from "lucide-react"

const mockBlacklist = [
    {
        id: "1",
        name: "Dr. Hoàng Văn X",
        specialty: "Nội khoa",
        reason: "Vi phạm quy tắc ứng xử chuyên nghiệp",
        dateAdded: "2025-09-15",
        severity: "high",
        details:
            "Bác sĩ có hành vi không phù hợp với bệnh nhân, vi phạm tiêu chuẩn đạo đức y tế.",
    },
    {
        id: "2",
        name: "Dr. Tô Thị Y",
        specialty: "Ngoại khoa",
        reason: "Kết quả điều trị kém, khiếu nại từ bệnh nhân",
        dateAdded: "2025-08-22",
        severity: "high",
        details:
            "Nhiều khiếu nại từ bệnh nhân về kết quả điều trị không như mong đợi.",
    },
    {
        id: "3",
        name: "Dr. Ngô Văn Z",
        specialty: "Nhi khoa",
        reason: "Thiếu chứng chỉ hành nghề",
        dateAdded: "2025-07-10",
        severity: "high",
        details:
            "Bác sĩ không có chứng chỉ hành nghề hợp lệ cho chuyên khoa nhi khoa.",
    },
    {
        id: "4",
        name: "Dr. Dương Thị K",
        specialty: "Tim mạch",
        reason: "Lỗi y tế, gây hại cho bệnh nhân",
        dateAdded: "2025-06-05",
        severity: "high",
        details:
            "Lỗi y tế trong quá trình điều trị gây biến chứng cho bệnh nhân.",
    },
    {
        id: "5",
        name: "Dr. Võ Văn L",
        specialty: "Nội khoa",
        reason: "Hành vi không chuyên nghiệp",
        dateAdded: "2025-05-18",
        severity: "medium",
        details:
            "Bác sĩ có hành vi không chuyên nghiệp trong giao tiếp với bệnh nhân.",
    },
]

export default function BlacklistDetails() {
    // --- TẤT CẢ STATE ĐẶT Ở ĐẦU COMPONENT ---
    const [blacklist, setBlacklist] = useState(mockBlacklist) // <-- State cho dữ liệu
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSeverity, setSelectedSeverity] = useState("all")

    // State quản lý các modal
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // State để biết đang thao tác với ai
    const [selectedDoctor, setSelectedDoctor] = useState(null)

    // State cho form chỉnh sửa
    const [formData, setFormData] = useState({
        reason: "",
        severity: "medium",
        details: "",
    })

    // --- TẤT CẢ CÁC HÀM XỬ LÝ ĐẶT TIẾP THEO (BÊN TRONG COMPONENT) ---

    // Sửa: Lọc từ state `blacklist` thay vì `mockBlacklist`
    const filteredBlacklist = blacklist.filter((doctor) => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.reason.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity =
            selectedSeverity === "all" || doctor.severity === selectedSeverity
        return matchesSearch && matchesSeverity
    })

    const getSeverityClass = (severity) => {
        switch (severity) {
            case "high":
                return "bg-red-100 text-red-700"
            case "medium":
                return "bg-orange-100 text-orange-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case "high":
                return "Nghiêm trọng"
            case "medium":
                return "Trung bình"
            default:
                return "Thấp"
        }
    }

    // Hàm đóng tất cả modal
    const handleCloseAllModals = () => {
        setShowViewModal(false)
        setShowEditModal(false)
        setShowDeleteModal(false)
        setSelectedDoctor(null)
    }

    // 1. Xử lý Mở Modal Xem
    const handleOpenViewModal = (doctor) => {
        setSelectedDoctor(doctor)
        setShowViewModal(true)
    }

    // 2. Xử lý Mở Modal Sửa
    const handleOpenEditModal = (doctor) => {
        setSelectedDoctor(doctor)
        setFormData({
            reason: doctor.reason,
            severity: doctor.severity,
            details: doctor.details,
        })
        setShowEditModal(true)
    }

    // 3. Xử lý Mở Modal Xóa
    const handleOpenDeleteModal = (doctor) => {
        setSelectedDoctor(doctor)
        setShowDeleteModal(true)
    }

    // 4. Xử lý thay đổi Form Sửa
    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // 5. Xử lý Submit Form Sửa
    const handleEditSubmit = (e) => {
        e.preventDefault()
        setBlacklist(
            blacklist.map((doc) =>
                doc.id === selectedDoctor.id ? { ...doc, ...formData } : doc
            )
        )
        handleCloseAllModals()
    }

    // 6. Xử lý Xác nhận Xóa
    const handleConfirmDelete = () => {
        setBlacklist(blacklist.filter((doc) => doc.id !== selectedDoctor.id))
        handleCloseAllModals()
    }

    // --- PHẦN RETURN JSX LUÔN NẰM CUỐI CÙNG ---
    return (
        <div className="flex flex-col gap-5">
            {/* Header: Sửa lại để đếm `blacklist.length` */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh sách đen</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Quản lý bác sĩ bị cấm hoạt động tại phòng khám
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
                    <Ban size={18} />
                    {/* Sửa: Đếm từ state `blacklist` */}
                    <span>{blacklist.length} bác sĩ trong danh sách</span>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-l-red-500 rounded-lg">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm text-red-700">
                        <strong className="font-semibold text-red-900">Lưu ý:</strong> Các bác
                        sĩ trong danh sách này bị cấm hoạt động tại phòng khám. Không
                        được phép tuyển dụng hoặc hợp tác với họ.
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, chuyên khoa hoặc lý do..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
                    />
                </div>

                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSeverity === "all"
                                ? "bg-blue-100 text-blue-700 shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedSeverity("all")}
                    >
                        <Filter size={16} />
                        Tất cả
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSeverity === "high"
                                ? "bg-red-100 text-red-700 shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedSeverity("high")}
                    >
                        Nghiêm trọng
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSeverity === "medium"
                                ? "bg-orange-100 text-orange-700 shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedSeverity("medium")}
                    >
                        Trung bình
                    </button>
                </div>
            </div>

            {/* Table: Cập nhật onClick cho các nút */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Tên bác sĩ
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Chuyên khoa
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Lý do cấm
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Ngày thêm vào
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Mức độ
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Sửa: .map() từ `filteredBlacklist` */}
                        {filteredBlacklist.map((doctor) => (
                            <tr
                                key={doctor.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Ban size={16} className="text-red-500 flex-shrink-0" />
                                        <span className="text-sm font-semibold text-gray-900">
                                            {doctor.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                        {doctor.specialty}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 max-w-sm">
                                    <p className="text-gray-800">{doctor.reason}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {doctor.dateAdded}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                                            doctor.severity
                                        )}`}
                                    >
                                        <AlertCircle size={14} />
                                        {getSeverityLabel(doctor.severity)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        {/* Sửa: Thêm onClick */}
                                        <button
                                            onClick={() => handleOpenViewModal(doctor)}
                                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditModal(doctor)}
                                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(doctor)}
                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- CÁC MODAL --- */}

            {/* Modal xem chi tiết (Sửa: dùng `showViewModal`) */}
            {showViewModal && selectedDoctor && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleCloseAllModals}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-lg w-11/12 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Chi tiết vi phạm
                            </h2>
                            <button
                                onClick={handleCloseAllModals}
                                className="p-1.5 text-gray-500 hover:text-gray-800"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                    Bác sĩ
                                </label>
                                <p className="text-gray-700">{selectedDoctor.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                    Chuyên khoa
                                </label>
                                <p className="text-gray-700">{selectedDoctor.specialty}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                    Lý do
                                </label>
                                <p className="text-gray-700">{selectedDoctor.reason}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                    Mức độ
                                </label>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                                        selectedDoctor.severity
                                    )}`}
                                >
                                    <AlertCircle size={14} />
                                    {getSeverityLabel(selectedDoctor.severity)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                    Chi tiết
                                </label>
                                <p className="text-gray-700 p-3 bg-gray-50 rounded-md border border-gray-200">
                                    {selectedDoctor.details}
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseAllModals}
                                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chỉnh sửa */}
            {showEditModal && selectedDoctor && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleCloseAllModals}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-lg w-11/12 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-5">
                            Chỉnh sửa vi phạm: {selectedDoctor.name}
                        </h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Lý do cấm
                                </label>
                                <textarea
                                    name="reason"
                                    rows="3"
                                    value={formData.reason}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập lý do"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Mức độ nghiêm trọng
                                </label>
                                <select
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Thấp</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high">Nghiêm trọng</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Chi tiết vi phạm
                                </label>
                                <textarea
                                    name="details"
                                    rows="5"
                                    value={formData.details}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mô tả chi tiết hành vi"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseAllModals}
                                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xác nhận Xóa */}
            {showDeleteModal && selectedDoctor && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleCloseAllModals}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-11/12 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
                                <AlertCircle size={40} className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Xác nhận xóa
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa bác sĩ{" "}
                                <strong className="font-semibold">{selectedDoctor.name}</strong>{" "}
                                khỏi danh sách đen không? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3 justify-center w-full">
                                <button
                                    type="button"
                                    onClick={handleCloseAllModals}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Xác nhận Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}