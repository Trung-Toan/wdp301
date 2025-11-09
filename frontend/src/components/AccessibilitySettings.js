import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { toast } from 'react-toastify';
import {
    Type,
    MousePointer2,
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
    
    // Get accessibility classes for modal - modal sẽ phản ánh settings
    const isLarge = settings.largeFont || settings.elderlyMode;

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
            {/* Floating Button with Pulse Animation - Responsive to settings */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed ${isLarge ? 'bottom-6 right-6' : 'bottom-4 right-4 sm:bottom-6 sm:right-6'} z-50 group`}
                aria-label="Cài đặt trợ năng"
                title="Cài đặt trợ năng"
            >
                <div className="relative">
                    {/* Pulse Ring */}
                    <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
                    {/* Button */}
                    <div className={`relative ${isLarge ? 'p-5 min-w-[64px] min-h-[64px]' : 'p-3 sm:p-4 min-w-[56px] min-h-[56px]'} bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2`}>
                        <Settings className={`${isLarge ? 'h-7 w-7' : 'h-6 w-6'} group-hover:rotate-90 transition-transform duration-300`} />
                        {isLarge && <span className="hidden sm:inline font-semibold text-base">Trợ năng</span>}
                    </div>
                </div>
            </button>

            {/* Modal with Animation - Responsive to accessibility settings */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300"
                    onClick={handleClose}
                >
                    <div 
                        className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'} ${isLarge ? 'text-lg accessibility-large-font' : ''} ${settings.largeButtons ? 'accessibility-large-buttons' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Gradient - Responsive */}
                        <div className={`sticky top-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white ${isLarge ? 'p-6 lg:p-10' : 'p-4 sm:p-6 lg:p-8'} rounded-t-2xl sm:rounded-t-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-lg z-10`}>
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className={`${isLarge ? 'p-4' : 'p-2 sm:p-3'} bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0`}>
                                    <Sparkles className={`${isLarge ? 'h-8 w-8' : 'h-6 w-6 sm:h-7 sm:w-7'} animate-pulse`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className={`${isLarge ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl lg:text-3xl'} font-bold mb-1 break-words`}>
                                        Cài đặt trợ năng
                                    </h2>
                                    <p className={`${isLarge ? 'text-base sm:text-lg' : 'text-xs sm:text-sm lg:text-base'} text-white/90 break-words`}>
                                        Tùy chỉnh giao diện cho dễ sử dụng hơn
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`${isLarge ? 'p-3 min-w-[48px] min-h-[48px]' : 'p-2 sm:p-2.5 min-w-[40px] min-h-[40px]'} hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 active:scale-90 flex-shrink-0 flex items-center justify-center`}
                                aria-label="Đóng"
                            >
                                <X className={`${isLarge ? 'h-7 w-7' : 'h-5 w-5 sm:h-6 sm:w-6'}`} />
                            </button>
                        </div>

                        {/* Content with Scroll - Responsive to accessibility settings */}
                        <div className={`${isLarge ? 'p-4 sm:p-6 lg:p-10' : 'p-4 sm:p-6 lg:p-8'} space-y-4 sm:space-y-6 overflow-y-auto ${isLarge ? 'max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-180px)]' : 'max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-160px)]'}`}>
                            {/* Elderly Mode - Quick Enable with Enhanced Design */}
                            <div className={`relative bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-2 border-pink-300/50 ${isLarge ? 'rounded-2xl p-6 sm:p-8 lg:p-10' : 'rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8'} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-pink-200/30 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-rose-200/30 rounded-full blur-2xl"></div>
                                
                                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                                    <div className="flex items-start lg:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className={`${isLarge ? 'p-4 sm:p-5' : 'p-3 sm:p-4'} bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl sm:rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                                            <UserCircle className={`${isLarge ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-6 w-6 sm:h-7 sm:w-7'} text-white`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`${isLarge ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-xl lg:text-2xl'} font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-2`}>
                                                <span className="break-words">Chế độ dành cho người cao tuổi</span>
                                                <span className={`${isLarge ? 'text-xs sm:text-sm' : 'text-xs'} font-normal bg-pink-100 text-pink-700 px-2 py-1 rounded-full whitespace-nowrap`}>Khuyến nghị</span>
                                            </h3>
                                            <p className={`${isLarge ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-gray-700 leading-relaxed break-words`}>
                                                Bật tất cả các tính năng hỗ trợ (chữ lớn, nút lớn, giao diện đơn giản)
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-start lg:self-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.elderlyMode}
                                            onChange={toggleElderlyMode}
                                            className="sr-only peer"
                                        />
                                        <div className={`${isLarge ? 'w-[72px] h-10' : 'w-16 h-9'} bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full ${isLarge ? 'after:h-8 after:w-8' : 'after:h-7 after:w-7'} after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-600 shadow-inner`}></div>
                                    </label>
                                </div>
                            </div>

                            {/* Individual Settings */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <div className={`${isLarge ? 'h-1.5 w-16' : 'h-1 w-12'} bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full`}></div>
                                    <h3 className={`${isLarge ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold text-gray-900`}>Cài đặt chi tiết</h3>
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
                                            className={`group relative flex flex-col lg:flex-row lg:items-center lg:justify-between ${isLarge ? 'p-5 sm:p-6' : 'p-4 sm:p-5'} bg-gradient-to-br from-gray-50 to-gray-100/50 ${isLarge ? 'rounded-xl sm:rounded-2xl' : 'rounded-lg sm:rounded-xl'} border-2 border-gray-200/50 hover:border-gray-300 hover:shadow-md transition-all duration-300 ${item.disabled ? 'opacity-60' : 'hover:scale-[1.01] sm:hover:scale-[1.02]'}`}
                                        >
                                            <div className="flex items-start lg:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                <div className={`${isLarge ? 'p-3 sm:p-4' : 'p-2.5 sm:p-3'} bg-gradient-to-br ${item.iconBg} ${isLarge ? 'rounded-xl' : 'rounded-lg sm:rounded-xl'} shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200 flex-shrink-0`}>
                                                    <IconComponent className={`${isLarge ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-5 w-5'} text-white`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <div className={`${isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-semibold text-gray-900 break-words`}>{item.title}</div>
                                                        {item.disabled && (
                                                            <span className={`${isLarge ? 'text-xs sm:text-sm' : 'text-xs'} bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap`}>Tự động</span>
                                                        )}
                                                    </div>
                                                    <div className={`${isLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-gray-600 leading-relaxed break-words`}>{item.description}</div>
                                                </div>
                                            </div>
                                            <label className={`relative inline-flex items-center cursor-pointer flex-shrink-0 ${isLarge ? 'mt-4 lg:mt-0 min-w-[60px]' : 'mt-3 sm:mt-4 lg:mt-0'} ${item.disabled ? 'cursor-not-allowed' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                    disabled={item.disabled}
                                                />
                                                <div className={`${isLarge ? 'w-16 h-9' : 'w-14 h-7'} bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full ${isLarge ? 'after:h-7 after:w-7' : 'after:h-6 after:w-6'} after:transition-all after:duration-300 peer-checked:bg-gradient-to-r ${item.iconBg} shadow-inner ${item.disabled ? 'opacity-50' : ''}`}></div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reset Buttons with Enhanced Design - Responsive */}
                            <div className={`${isLarge ? 'pt-6 sm:pt-8' : 'pt-4 sm:pt-6'} border-t-2 border-gray-200/50 space-y-3 sm:space-y-4`}>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            resetGuides();
                                            toast.success('Đã xóa tất cả hướng dẫn. Bạn sẽ thấy lại hướng dẫn khi vào các trang tương ứng.', {
                                                position: "top-center",
                                                autoClose: 3000,
                                            });
                                        }}
                                        className={`group relative ${isLarge ? 'px-6 sm:px-8 py-4 sm:py-4.5 text-base sm:text-lg min-h-[56px]' : 'px-5 sm:px-6 py-3 sm:py-3.5 min-h-[48px]'} bg-gradient-to-r from-green-500 to-emerald-600 text-white ${isLarge ? 'rounded-xl sm:rounded-2xl' : 'rounded-lg sm:rounded-xl'} hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 overflow-hidden`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                                        <HelpCircle className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} relative z-10`} />
                                        <span className="relative z-10 break-words text-center">Xem lại tất cả hướng dẫn</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            resetSettings();
                                            toast.info('Đã đặt lại tất cả cài đặt về mặc định.', {
                                                position: "top-center",
                                                autoClose: 2000,
                                            });
                                        }}
                                        className={`group ${isLarge ? 'px-6 sm:px-8 py-4 sm:py-4.5 text-base sm:text-lg min-h-[56px]' : 'px-5 sm:px-6 py-3 sm:py-3.5 min-h-[48px]'} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 ${isLarge ? 'rounded-xl sm:rounded-2xl' : 'rounded-lg sm:rounded-xl'} hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 border border-gray-300`}
                                    >
                                        <RotateCcw className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} group-hover:rotate-180 transition-transform duration-500`} />
                                        <span className="break-words">Đặt lại mặc định</span>
                                    </button>
                                </div>
                                <div className={`bg-blue-50 border-l-4 border-blue-500 ${isLarge ? 'rounded-r-xl p-4 sm:p-5' : 'rounded-r-lg p-3 sm:p-4'}`}>
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <HelpCircle className={`${isLarge ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-5 w-5'} text-blue-600 flex-shrink-0 mt-0.5`} />
                                        <p className={`${isLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-blue-900 leading-relaxed break-words`}>
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

