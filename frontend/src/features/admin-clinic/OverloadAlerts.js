"use client"

import { useState } from "react"
import {
    AlertTriangle,
    Clock,
    Users,
    Download,
    Filter,
    Edit2,
    Trash2,
    Search,
    X,
    CheckCircle,
} from "lucide-react"
import { CSVLink } from "react-csv" // <-- 1. IMPORT THƯ VIỆN

const mockAlerts = [
    {
        id: "1",
        name: "Dr. Nguyễn Văn A",
        specialty: "Nội khoa",
        avgTimePerPatient: 8,
        patientsPerDay: 45,
        severity: "critical",
        schedule: "Thứ 2 - Thứ 6: 8:00 - 17:00",
    },
    {
        id: "2",
        name: "Dr. Trần Thị B",
        specialty: "Ngoại khoa",
        avgTimePerPatient: 12,
        patientsPerDay: 38,
        severity: "warning",
        schedule: "Thứ 2 - Thứ 5: 8:00 - 16:00",
    },
    {
        id: "3",
        name: "Dr. Lê Văn C",
        specialty: "Nhi khoa",
        avgTimePerPatient: 18,
        patientsPerDay: 22,
        severity: "normal",
        schedule: "Thứ 2 - Thứ 6: 9:00 - 17:00",
    },
    {
        id: "4",
        name: "Dr. Phạm Thị D",
        specialty: "Tim mạch",
        avgTimePerPatient: 10,
        patientsPerDay: 42,
        severity: "warning",
        schedule: "Thứ 2 - Thứ 6: 8:00 - 17:00",
    },
]

export default function OverloadAlerts() {
    // --- STATE ---
    const [alerts, setAlerts] = useState(mockAlerts)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSeverity, setSelectedSeverity] = useState("all")

    // (Các state cho modal giữ nguyên)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [formData, setFormData] = useState({
        avgTimePerPatient: 15,
        patientsPerDay: 30,
        schedule: "",
    })

    // --- LOGIC TÍNH TOÁN & LỌC ---

    const getSeverityFromTime = (time) => {
        // (Giữ nguyên)
        const numTime = parseInt(time, 10)
        if (numTime < 10) return "critical"
        if (numTime < 15) return "warning"
        return "normal"
    }

    const filteredAlerts = alerts.filter((alert) => {
        // (Giữ nguyên)
        const matchesSearch =
            alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity =
            selectedSeverity === "all" || alert.severity === selectedSeverity
        return matchesSearch && matchesSeverity
    })

    const getSeverityClass = (severity) => {
        // (Giữ nguyên)
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-700"
            case "warning":
                return "bg-orange-100 text-orange-700"
            default:
                return "bg-green-100 text-green-700"
        }
    }

    const getSeverityLabel = (severity) => {
        // (Giữ nguyên)
        switch (severity) {
            case "critical":
                return "Nghiêm trọng"
            case "warning":
                return "Cần chú ý"
            default:
                return "Bình thường"
        }
    }

    const getSeverityIcon = (severity) => {
        // (Giữ nguyên)
        switch (severity) {
            case "critical":
                return <AlertTriangle size={14} />
            case "warning":
                return <Clock size={14} />
            default:
                return <CheckCircle size={14} />
        }
    }

    // --- HANDLERS (XỬ LÝ SỰ KIỆN) ---
    // (Tất cả các hàm handler: handleCloseAllModals, handleOpenEditModal,
    // handleOpenDeleteModal, handleFormChange, handleEditSubmit,
    // handleConfirmDelete... giữ nguyên)

    const handleCloseAllModals = () => {
        setShowEditModal(false)
        setShowDeleteModal(false)
        setSelectedDoctor(null)
    }

    const handleOpenEditModal = (doctor) => {
        setSelectedDoctor(doctor)
        setFormData({
            avgTimePerPatient: doctor.avgTimePerPatient,
            patientsPerDay: doctor.patientsPerDay,
            schedule: doctor.schedule,
        })
        setShowEditModal(true)
    }

    const handleOpenDeleteModal = (doctor) => {
        setSelectedDoctor(doctor)
        setShowDeleteModal(true)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        const newAvgTime = parseInt(formData.avgTimePerPatient, 10)
        const newSeverity = getSeverityFromTime(newAvgTime)

        setAlerts(
            alerts.map((doc) =>
                doc.id === selectedDoctor.id
                    ? { ...doc, ...formData, severity: newSeverity }
                    : doc
            )
        )
        handleCloseAllModals()
    }

    const handleConfirmDelete = () => {
        setAlerts(alerts.filter((doc) => doc.id !== selectedDoctor.id))
        handleCloseAllModals()
    }


    // --- 2. LOGIC CHUẨN BỊ DATA CHO CSV ---
    const headers = [
        { label: "Tên Bác Sĩ", key: "name" },
        { label: "Chuyên Khoa", key: "specialty" },
        { label: "Thời gian/BN (phút)", key: "avgTimePerPatient" },
        { label: "BN/Ngày", key: "patientsPerDay" },
        { label: "Lịch Làm Việc", key: "schedule" },
        { label: "Mức Độ", key: "severity" }, // Key này sẽ khớp với data đã map
    ]

    // Map data để 'severity' hiển thị text (Nghiêm trọng) thay vì 'critical'
    // Chúng ta sẽ xuất dữ liệu đã được lọc (filteredAlerts)
    const csvData = filteredAlerts.map((alert) => ({
        name: alert.name,
        specialty: alert.specialty,
        avgTimePerPatient: alert.avgTimePerPatient,
        patientsPerDay: alert.patientsPerDay,
        schedule: alert.schedule,
        severity: getSeverityLabel(alert.severity), // Dùng hàm helper để lấy text
    }))

    // Tên file
    const getFormattedDate = () => new Date().toISOString().split("T")[0]
    const csvFilename = `bao_cao_qua_tai_${getFormattedDate()}.csv`

    // --- RENDER ---
    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Cảnh báo quá tải
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Theo dõi và điều chỉnh lịch làm việc của bác sĩ khi quá tải
                    </p>
                </div>

                {/* --- SỬA LỖI: Đã xóa target="_blank" --- */}
                <CSVLink
                    data={csvData}
                    headers={headers}
                    filename={csvFilename}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors no-underline"
                >
                    <Download size={18} />
                    Xuất báo cáo
                </CSVLink>
            </div>

            {/* ... (Phần Stats, Search/Filter, Table và Modals giữ nguyên) ... */}

            {/* Stats (Thêm onClick) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div
                    className={`flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedSeverity === "critical"
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-gray-200"
                        }`}
                    onClick={() => setSelectedSeverity("critical")}
                >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                            Cảnh báo nghiêm trọng
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {alerts.filter((a) => a.severity === "critical").length}
                        </p>
                    </div>
                </div>

                <div
                    className={`flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedSeverity === "warning"
                        ? "border-orange-400 ring-2 ring-orange-100"
                        : "border-gray-200"
                        }`}
                    onClick={() => setSelectedSeverity("warning")}
                >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-orange-100 rounded-full text-orange-600">
                        <Clock size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                            Cảnh báo cần chú ý
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {alerts.filter((a) => a.severity === "warning").length}
                        </p>
                    </div>
                </div>

                <div
                    className={`flex items-center p-5 bg-white rounded-lg shadow-sm border gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedSeverity === "normal"
                        ? "border-green-400 ring-2 ring-green-100"
                        : "border-gray-200"
                        }`}
                    onClick={() => setSelectedSeverity("normal")}
                >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                            Bác sĩ bình thường
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {alerts.filter((a) => a.severity === "normal").length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter (Thêm Search) */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên bác sĩ, chuyên khoa..."
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
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSeverity === "critical"
                            ? "bg-red-100 text-red-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedSeverity("critical")}
                    >
                        Nghiêm trọng
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSeverity === "warning"
                            ? "bg-orange-100 text-orange-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                        onClick={() => setSelectedSeverity("warning")}
                    >
                        Cần chú ý
                    </button>
                </div>
            </div>

            {/* Table */}
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
                                Thời gian/BN
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                BN/Ngày
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Lịch làm việc
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
                        {filteredAlerts.map((alert) => (
                            <tr
                                key={alert.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    {alert.name}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                        {alert.specialty}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${getSeverityClass(
                                            alert.severity
                                        )}`}
                                    >
                                        {getSeverityIcon(alert.severity)}
                                        {alert.avgTimePerPatient} phút
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {alert.patientsPerDay}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                    {alert.schedule}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                                            alert.severity
                                        )}`}
                                    >
                                        {getSeverityIcon(alert.severity)}
                                        {getSeverityLabel(alert.severity)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(alert)}
                                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                            title="Chỉnh sửa lịch"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(alert)}
                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                            title="Xóa cảnh báo"
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

            {/* --- MODALS --- */}

            {/* Modal Chỉnh sửa Lịch */}
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
                            Điều chỉnh lịch: {selectedDoctor.name}
                        </h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Thời gian/BN (phút)
                                    </label>
                                    <input
                                        type="number"
                                        name="avgTimePerPatient"
                                        value={formData.avgTimePerPatient}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        BN/Ngày (Tối đa)
                                    </label>
                                    <input
                                        type="number"
                                        name="patientsPerDay"
                                        value={formData.patientsPerDay}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Lịch làm việc mới
                                </label>
                                <textarea
                                    name="schedule"
                                    rows="3"
                                    value={formData.schedule}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Vd: Thứ 2 - Thứ 6: 9:00 - 16:00"
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
                                <AlertTriangle size={40} className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Xác nhận xóa
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa cảnh báo quá tải của bác sĩ{" "}
                                <strong className="font-semibold">{selectedDoctor.name}</strong>?
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