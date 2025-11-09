import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
    Type, 
    MousePointer2, 
    Eye, 
    Layout, 
    Volume2, 
    RotateCcw, 
    X, 
    Settings,
    UserCircle 
} from 'lucide-react';

export default function AccessibilitySettings() {
    const { settings, updateSettings, toggleElderlyMode, resetSettings } = useAccessibility();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95 flex items-center gap-2 accessibility-button-large"
                aria-label="Cài đặt trợ năng"
                title="Cài đặt trợ năng"
            >
                <Settings className="h-6 w-6" />
                <span className="hidden sm:inline font-semibold">Trợ năng</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Cài đặt trợ năng</h2>
                                    <p className="text-white/90 text-sm">Tùy chỉnh giao diện cho dễ sử dụng hơn</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Đóng"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Elderly Mode - Quick Enable */}
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-300 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-pink-600 rounded-xl">
                                            <UserCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                Chế độ dành cho người cao tuổi
                                            </h3>
                                            <p className="text-gray-700 text-sm">
                                                Bật tất cả các tính năng hỗ trợ (chữ lớn, nút lớn, độ tương phản cao, giao diện đơn giản)
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.elderlyMode}
                                            onChange={toggleElderlyMode}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-pink-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Individual Settings */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Cài đặt chi tiết</h3>

                                {/* Large Font */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Type className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Chữ lớn hơn</div>
                                            <div className="text-sm text-gray-600">Tăng kích thước chữ để dễ đọc hơn</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.largeFont}
                                            onChange={(e) => updateSettings({ largeFont: e.target.checked })}
                                            className="sr-only peer"
                                            disabled={settings.elderlyMode}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                                    </label>
                                </div>

                                {/* Large Buttons */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <MousePointer2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Nút bấm lớn hơn</div>
                                            <div className="text-sm text-gray-600">Tăng kích thước nút để dễ bấm hơn</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.largeButtons}
                                            onChange={(e) => updateSettings({ largeButtons: e.target.checked })}
                                            className="sr-only peer"
                                            disabled={settings.elderlyMode}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                                    </label>
                                </div>

                                {/* High Contrast */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Eye className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Độ tương phản cao</div>
                                            <div className="text-sm text-gray-600">Tăng độ tương phản màu sắc để dễ nhìn hơn</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.highContrast}
                                            onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                                            className="sr-only peer"
                                            disabled={settings.elderlyMode}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                                    </label>
                                </div>

                                {/* Simplified UI */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Layout className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Giao diện đơn giản</div>
                                            <div className="text-sm text-gray-600">Ẩn các phần không cần thiết, chỉ hiện thông tin quan trọng</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.simplifiedUI}
                                            onChange={(e) => updateSettings({ simplifiedUI: e.target.checked })}
                                            className="sr-only peer"
                                            disabled={settings.elderlyMode}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                                    </label>
                                </div>

                                {/* Reduce Motion */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <RotateCcw className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Giảm chuyển động</div>
                                            <div className="text-sm text-gray-600">Tắt các hiệu ứng chuyển động có thể gây khó chịu</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.reduceMotion}
                                            onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <button
                                    onClick={resetSettings}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold flex items-center gap-2"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                    Đặt lại mặc định
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

