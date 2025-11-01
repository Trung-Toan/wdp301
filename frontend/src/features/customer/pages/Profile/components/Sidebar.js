import React, { useState, useRef } from "react"
import { User, Shield, FileText, Lock, Mail, UserCircle, Camera, Loader2, CheckCircle } from "lucide-react"
import { profilePatientApi } from "../../../../../api/patients/profilePatientApi"

export default function Sidebar({ activeTab, setActiveTab, formData, onAvatarUpdate }) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const fileInputRef = useRef(null)
    const tabs = [
        { name: "Thông tin cá nhân", key: "personal", icon: User },
        { name: "Lịch sử khám", key: "history", icon: Shield },
        { name: "Hồ sơ bệnh án", key: "records", icon: FileText },
        { name: "Cài đặt", key: "settings", icon: Lock },
    ]

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB')
            return
        }

        try {
            setIsUploading(true)
            setUploadSuccess(false)

            // Create FormData
            const formDataToSend = new FormData()
            formDataToSend.append('avatar', file)

            // Preview image immediately
            const reader = new FileReader()
            reader.onloadend = () => {
                if (onAvatarUpdate) {
                    onAvatarUpdate(reader.result)
                }
            }
            reader.readAsDataURL(file)

            // Upload to server
            // Note: You may need to adjust the API endpoint based on your backend
            const response = await profilePatientApi.updateInformation(formDataToSend)
            
            if (response.data) {
                setUploadSuccess(true)
                setTimeout(() => setUploadSuccess(false), 3000)
                
                // Update avatar URL if returned from server
                if (response.data.data?.avatar_url) {
                    if (onAvatarUpdate) {
                        onAvatarUpdate(response.data.data.avatar_url)
                    }
                }
            }
        } catch (error) {
            console.error("Error uploading avatar:", error)
            alert("Không thể tải ảnh lên. Vui lòng thử lại sau.")
        } finally {
            setIsUploading(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 lg:p-8 border border-white/50 sticky top-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full blur-xl opacity-30"></div>
                    <div className="relative">
                        <div className="relative">
                            <img 
                                src={formData.avatar} 
                                alt="Avatar" 
                                className="h-28 w-28 rounded-full border-4 border-white shadow-xl object-cover transition-all group-hover:brightness-90" 
                            />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                            {uploadSuccess && !isUploading && (
                                <div className="absolute inset-0 bg-green-500/80 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                            className="absolute -bottom-1 -right-1 p-2.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full border-4 border-white shadow-lg hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Thay đổi ảnh đại diện"
                        >
                            <Camera className="h-4 w-4 text-white" />
                        </button>
                        <div className="absolute -bottom-1 -right-1 p-2 bg-green-500 rounded-full border-4 border-white shadow-lg -z-10">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{formData.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="break-all">{formData.email}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="w-full border-t border-gray-200 pt-6">
                <nav className="flex flex-col gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                aria-pressed={isActive}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                                    isActive
                                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                <span>{tab.name}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* User Info Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                    <div className="p-2 bg-sky-100 rounded-lg">
                        <UserCircle className="h-5 w-5 text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Trạng thái</p>
                        <p className="text-sm font-bold text-sky-700">Đã xác thực</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
