import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
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

export default function HelpButton() {
    const [showGuide, setShowGuide] = useState(false);
    const [currentPage, setCurrentPage] = useState(null);
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
    
    return (
        <>
            {/* Floating Help Button */}
            <button
                onClick={handleShowGuide}
                className={`fixed bottom-24 right-6 z-40 p-3 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 transition-all transform hover:scale-110 active:scale-95 flex items-center gap-2 ${isLarge ? 'p-4' : ''}`}
                aria-label="Xem lại hướng dẫn"
                title="Xem lại hướng dẫn sử dụng trang này"
            >
                <HelpCircle className={`${isLarge ? 'h-7 w-7' : 'h-6 w-6'}`} />
                {isLarge && <span className="font-semibold text-base">Hướng dẫn</span>}
            </button>
            
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

