import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { toast } from 'react-toastify';
import {
    Type,
    MousePointer2,
    Eye,
    Layout,
    RotateCcw,
    X,
    Settings,
    UserCircle,
    Sparkles,
    HelpCircle
} from 'lucide-react';

export default function AccessibilitySettings() {
    const { settings, updateSettings, toggleElderlyMode, resetSettings, resetGuides } = useAccessibility();
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle modal animation
    useEffect(() => {
        if (isOpen) {
            // Small delay to trigger animation
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => setIsOpen(false), 300);
    };

    return (
        <>
            {/* Floating Button with Pulse Animation */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Cài đặt trợ năng"
                title="Cài đặt trợ năng"
            >
                <div className="relative">
                    {/* Pulse Ring */}
                    <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
                    {/* Button */}
                    <div className="relative p-4 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center gap-2 accessibility-button-large">
                        <Settings className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden sm:inline font-semibold">Trợ năng</span>
                    </div>
                </div>
            </button>

            {/* Modal with Animation */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-opacity duration-300"
                    onClick={handleClose}
                >
                    <div 
                        className={`bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Gradient */}
                        <div className="sticky top-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-6 lg:p-8 rounded-t-3xl flex items-center justify-between shadow-lg z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                                    <Sparkles className="h-7 w-7 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-bold mb-1">Cài đặt trợ năng</h2>
                                    <p className="text-white/90 text-sm lg:text-base">Tùy chỉnh giao diện cho dễ sử dụng hơn</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 active:scale-90"
                                aria-label="Đóng"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content with Scroll */}
                        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Elderly Mode - Quick Enable with Enhanced Design */}
                            <div className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-2 border-pink-300/50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl"></div>
                                
                                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex items-start lg:items-center gap-4">
                                        <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200">
                                            <UserCircle className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                Chế độ dành cho người cao tuổi
                                                <span className="text-xs lg:text-sm font-normal bg-pink-100 text-pink-700 px-2 py-1 rounded-full">Khuyến nghị</span>
                                            </h3>
                                            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
                                                Bật tất cả các tính năng hỗ trợ (chữ lớn, nút lớn, độ tương phản cao, giao diện đơn giản)
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={settings.elderlyMode}
                                            onChange={toggleElderlyMode}
                                            className="sr-only peer"
                                        />
                                        <div className="w-16 h-9 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-7 after:w-7 after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-600 shadow-inner"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Individual Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">Cài đặt chi tiết</h3>
                                </div>

                                {/* Setting Item Component */}
                                {[
                                    {
                                        key: 'largeFont',
                                        icon: Type,
                                        iconColor: 'text-blue-600',
                                        iconBg: 'from-blue-500 to-cyan-500',
                                        title: 'Chữ lớn hơn',
                                        description: 'Tăng kích thước chữ để dễ đọc hơn',
                                        checked: settings.largeFont,
                                        disabled: settings.elderlyMode
                                    },
                                    {
                                        key: 'largeButtons',
                                        icon: MousePointer2,
                                        iconColor: 'text-purple-600',
                                        iconBg: 'from-purple-500 to-pink-500',
                                        title: 'Nút bấm lớn hơn',
                                        description: 'Tăng kích thước nút để dễ bấm hơn',
                                        checked: settings.largeButtons,
                                        disabled: settings.elderlyMode
                                    },
                                    {
                                        key: 'highContrast',
                                        icon: Eye,
                                        iconColor: 'text-amber-600',
                                        iconBg: 'from-amber-500 to-orange-500',
                                        title: 'Độ tương phản cao',
                                        description: 'Tăng độ tương phản màu sắc để dễ nhìn hơn',
                                        checked: settings.highContrast,
                                        disabled: settings.elderlyMode
                                    },
                                    {
                                        key: 'simplifiedUI',
                                        icon: Layout,
                                        iconColor: 'text-green-600',
                                        iconBg: 'from-green-500 to-emerald-500',
                                        title: 'Giao diện đơn giản',
                                        description: 'Ẩn các phần không cần thiết, chỉ hiện thông tin quan trọng',
                                        checked: settings.simplifiedUI,
                                        disabled: settings.elderlyMode
                                    },
                                    {
                                        key: 'reduceMotion',
                                        icon: RotateCcw,
                                        iconColor: 'text-indigo-600',
                                        iconBg: 'from-indigo-500 to-purple-500',
                                        title: 'Giảm chuyển động',
                                        description: 'Tắt các hiệu ứng chuyển động có thể gây khó chịu',
                                        checked: settings.reduceMotion,
                                        disabled: false
                                    }
                                ].map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div 
                                            key={item.key}
                                            className={`group relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200/50 hover:border-gray-300 hover:shadow-md transition-all duration-300 ${item.disabled ? 'opacity-60' : 'hover:scale-[1.02]'}`}
                                        >
                                            <div className="flex items-start lg:items-center gap-4 flex-1">
                                                <div className={`p-3 bg-gradient-to-br ${item.iconBg} rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200 flex-shrink-0`}>
                                                    <IconComponent className={`h-5 w-5 text-white`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="font-semibold text-gray-900 text-base lg:text-lg">{item.title}</div>
                                                        {item.disabled && (
                                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Tự động</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 leading-relaxed">{item.description}</div>
                                                </div>
                                            </div>
                                            <label className={`relative inline-flex items-center cursor-pointer flex-shrink-0 mt-4 lg:mt-0 ${item.disabled ? 'cursor-not-allowed' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                    disabled={item.disabled}
                                                />
                                                <div className={`w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 peer-checked:bg-gradient-to-r ${item.iconBg} shadow-inner ${item.disabled ? 'opacity-50' : ''}`}></div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reset Buttons with Enhanced Design */}
                            <div className="pt-6 border-t-2 border-gray-200/50 space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            resetGuides();
                                            toast.success('Đã xóa tất cả hướng dẫn. Bạn sẽ thấy lại hướng dẫn khi vào các trang tương ứng.', {
                                                position: "top-center",
                                                autoClose: 3000,
                                            });
                                        }}
                                        className="group relative px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                                        <HelpCircle className="h-5 w-5 relative z-10" />
                                        <span className="relative z-10">Xem lại tất cả hướng dẫn</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            resetSettings();
                                            toast.info('Đã đặt lại tất cả cài đặt về mặc định.', {
                                                position: "top-center",
                                                autoClose: 2000,
                                            });
                                        }}
                                        className="group px-6 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 border border-gray-300"
                                    >
                                        <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                                        Đặt lại mặc định
                                    </button>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-900 leading-relaxed">
                                            <strong className="font-semibold">Mẹo:</strong> Nhấn "Xem lại tất cả hướng dẫn" để xóa lịch sử và xem lại hướng dẫn cho tất cả các trang. Cài đặt trợ năng sẽ được lưu tự động.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

