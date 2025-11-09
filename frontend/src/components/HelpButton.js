import React, { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, Sparkles } from 'lucide-react';
import FirstTimeGuide from './FirstTimeGuide';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Map từ pathname sang page identifier
const getPageFromPath = (pathname) => {
    if (pathname === '/home' || pathname === '/') return 'home';
    if (pathname.includes('/booking')) return 'booking';
    if (pathname.includes('/patient/profile') || pathname.includes('/profile')) return 'profile';
    if (pathname === '/login') return 'login';
    if (pathname === '/register') return 'register';
    if (pathname.includes('/forgot_password')) return 'forgot_password';
    if (pathname.includes('/home/doctorlist') || pathname.includes('/doctorlist')) return 'doctor_list';
    if (pathname.includes('/doctordetail') || pathname.includes('/doctor/')) return 'doctor_detail';
    if (pathname.includes('/home/specialty') && !pathname.includes('/specialty/')) return 'specialty_list';
    if (pathname.includes('/specialty/')) return 'specialty_detail';
    if (pathname.includes('/home/facility') && !pathname.includes('/facility/')) return 'facility_list';
    if (pathname.includes('/facility/') && !pathname.includes('/booking')) return 'facility_detail';
    if (pathname.includes('/facility/booking')) return 'facility_booking';
    if (pathname.includes('/clinic/search')) return 'clinic_search';
    if (pathname.includes('/patient/appointments') || pathname.includes('/appointments')) return 'appointments';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/record/') || pathname.includes('/record-detail')) return 'record_detail';
    return null;
};

// Get page title for tooltip
const getPageTitle = (page) => {
    const titles = {
        'home': 'Trang chủ',
        'booking': 'Đặt lịch khám',
        'profile': 'Trang cá nhân',
        'login': 'Đăng nhập',
        'register': 'Đăng ký',
        'forgot_password': 'Quên mật khẩu',
        'doctor_list': 'Danh sách bác sĩ',
        'doctor_detail': 'Thông tin bác sĩ',
        'specialty_list': 'Danh sách chuyên khoa',
        'specialty_detail': 'Chi tiết chuyên khoa',
        'facility_list': 'Danh sách cơ sở y tế',
        'facility_detail': 'Thông tin phòng khám',
        'facility_booking': 'Đặt lịch tại phòng khám',
        'clinic_search': 'Tìm kiếm phòng khám',
        'appointments': 'Lịch hẹn của tôi',
        'notifications': 'Thông báo',
        'record_detail': 'Chi tiết hồ sơ bệnh án'
    };
    return titles[page] || 'Trang này';
};

export default function HelpButton() {
    const [showGuide, setShowGuide] = useState(false);
    const [currentPage, setCurrentPage] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const { settings } = useAccessibility();
    const isLarge = settings.largeFont || settings.elderlyMode;
    
    // Update current page when location changes
    useEffect(() => {
        const page = getPageFromPath(location.pathname);
        setCurrentPage(page);
        setShowGuide(false); // Reset guide state when page changes
    }, [location.pathname]);
    
    // Kiểm tra role - chỉ hiển thị cho PATIENT và user thường
    const account = JSON.parse(sessionStorage.getItem('account') || '{}');
    const userRole = account.role;
    
    // KHÔNG hiển thị cho admin, assistant, doctor
    if (userRole === 'ADMIN_SYSTEM' || userRole === 'ADMIN_CLINIC' || 
        userRole === 'ASSISTANT' || userRole === 'DOCTOR') {
        return null;
    }
    
    // Nếu không có page tương ứng, không hiển thị nút
    if (!currentPage) return null;
    
    const handleShowGuide = () => {
        setShowGuide(true);
    };
    
    const pageTitle = getPageTitle(currentPage);
    
    return (
        <>
            {/* Floating Help Button with Enhanced Design */}
            <div className="fixed bottom-24 right-4 sm:right-6 z-40 group">
                {/* Tooltip - Hidden on mobile, shown on desktop */}
                <div 
                    className={`hidden md:block absolute bottom-full right-0 mb-3 px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm rounded-xl shadow-2xl whitespace-nowrap transition-all duration-300 transform ${
                        isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <BookOpen className="h-4 w-4 text-green-300" />
                        <span className="font-medium">Hướng dẫn: {pageTitle}</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full right-6 border-4 border-transparent border-t-gray-900"></div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-green-400/10 blur-xl -z-10"></div>
                </div>
                
                {/* Button with Pulse Animation */}
                <button
                    onClick={handleShowGuide}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="relative group/btn"
                    aria-label="Xem lại hướng dẫn"
                >
                    <div className="relative">
                        {/* Pulse Ring 1 */}
                        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30"></div>
                        {/* Pulse Ring 2 */}
                        <div className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                        
                        {/* Button */}
                        <div className={`relative p-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 ${isLarge ? 'p-5 min-w-[64px] min-h-[64px]' : 'min-w-[56px] min-h-[56px]'} group-hover/btn:from-green-600 group-hover/btn:via-emerald-600 group-hover/btn:to-teal-700`}>
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-full bg-green-400/30 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10"></div>
                            
                            {/* Sparkle effect on hover */}
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <Sparkles className="absolute top-1.5 right-1.5 h-3 w-3 text-white/90 animate-pulse" />
                                <Sparkles className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 text-white/70 animate-pulse" style={{ animationDelay: '0.3s' }} />
                                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 text-white/50 animate-pulse" style={{ animationDelay: '0.6s' }} />
                            </div>
                            
                            {/* Icon */}
                            <HelpCircle className={`${isLarge ? 'h-7 w-7' : 'h-6 w-6'} relative z-10 group-hover/btn:rotate-12 transition-transform duration-300 drop-shadow-lg`} />
                            
                            {/* Text for large font mode - hidden on mobile */}
                            {isLarge && (
                                <span className="font-semibold text-base relative z-10 hidden lg:inline">
                                    Hướng dẫn
                                </span>
                            )}
                        </div>
                    </div>
                </button>
            </div>
            
            {/* Show Guide when button is clicked */}
            {showGuide && currentPage && (
                <FirstTimeGuide 
                    key={`help-${currentPage}-${Date.now()}`} 
                    page={currentPage} 
                    forceShow={true}
                    onComplete={() => setShowGuide(false)}
                />
            )}
        </>
    );
}

