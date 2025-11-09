import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
    // Load settings from localStorage
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return getDefaultSettings();
            }
        }
        return getDefaultSettings();
    });

    // Auto-detect elderly user based on age (if available in user data)
    useEffect(() => {
        // Only run once on mount and if autoEnabled is not already set
        if (settings.autoEnabled) return;
        
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const patient = JSON.parse(sessionStorage.getItem('patient') || '{}');
        
        // Calculate age from dob
        if (user.dob || patient.dob) {
            const dob = new Date(user.dob || patient.dob);
            const age = new Date().getFullYear() - dob.getFullYear();
            
            // Auto-enable elderly mode for users 60+
            if (age >= 60) {
                setSettings(prev => {
                    const newSettings = {
                        ...prev,
                        elderlyMode: true,
                        largeFont: true,
                        largeButtons: true,
                        highContrast: true,
                        simplifiedUI: true,
                        autoEnabled: true
                    };
                    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
                    return newSettings;
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Apply settings to document
    useEffect(() => {
        const root = document.documentElement;
        
        // Font size
        if (settings.largeFont) {
            root.style.fontSize = '18px';
            root.classList.add('accessibility-large-font');
        } else {
            root.style.fontSize = '';
            root.classList.remove('accessibility-large-font');
        }

        // High contrast
        if (settings.highContrast) {
            root.classList.add('accessibility-high-contrast');
        } else {
            root.classList.remove('accessibility-high-contrast');
        }

        // Simplified UI
        if (settings.simplifiedUI) {
            root.classList.add('accessibility-simplified');
        } else {
            root.classList.remove('accessibility-simplified');
        }

        // Large buttons
        if (settings.largeButtons) {
            root.classList.add('accessibility-large-buttons');
        } else {
            root.classList.remove('accessibility-large-buttons');
        }

        // Elderly mode (enables all features)
        if (settings.elderlyMode) {
            root.classList.add('accessibility-elderly-mode');
        } else {
            root.classList.remove('accessibility-elderly-mode');
        }

        // Reduce motion (for users sensitive to animations)
        if (settings.reduceMotion) {
            root.classList.add('accessibility-reduce-motion');
        } else {
            root.classList.remove('accessibility-reduce-motion');
        }
    }, [settings]);

    const updateSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('accessibilitySettings', JSON.stringify(updated));
    };

    const toggleElderlyMode = () => {
        const newElderlyMode = !settings.elderlyMode;
        updateSettings({
            elderlyMode: newElderlyMode,
            largeFont: newElderlyMode,
            largeButtons: newElderlyMode,
            highContrast: newElderlyMode,
            simplifiedUI: newElderlyMode,
        });
    };

    const resetSettings = () => {
        const defaultSettings = getDefaultSettings();
        setSettings(defaultSettings);
        localStorage.setItem('accessibilitySettings', JSON.stringify(defaultSettings));
    };

    // Reset all first-time guides (xóa tất cả các hướng dẫn đã xem)
    const resetGuides = () => {
        const guideKeys = [
            'firstTimeGuide_home',
            'firstTimeGuide_booking',
            'firstTimeGuide_profile',
            'firstTimeGuide_login',
            'firstTimeGuide_register',
            'firstTimeGuide_forgot_password',
            'firstTimeGuide_doctor_list',
            'firstTimeGuide_doctor_detail',
            'firstTimeGuide_specialty_list',
            'firstTimeGuide_specialty_detail',
            'firstTimeGuide_facility_list',
            'firstTimeGuide_facility_detail',
            'firstTimeGuide_facility_booking',
            'firstTimeGuide_clinic_search',
            'firstTimeGuide_appointments',
            'firstTimeGuide_notifications',
            'firstTimeGuide_record_detail',
        ];
        
        guideKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    };

    return (
        <AccessibilityContext.Provider
            value={{
                settings,
                updateSettings,
                toggleElderlyMode,
                resetSettings,
                resetGuides,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};

function getDefaultSettings() {
    return {
        elderlyMode: false,
        largeFont: false,
        largeButtons: false,
        highContrast: false,
        simplifiedUI: false,
        reduceMotion: false,
        textToSpeech: false,
        autoEnabled: false,
    };
}

