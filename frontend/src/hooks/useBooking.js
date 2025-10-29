import { useState, useCallback } from "react";
import { appointmentApi } from "../api/patients/appointmentApi";

/**
 * Custom hook để quản lý booking flow
 * @returns {Object} - Booking state và methods
 */
export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [appointmentData, setAppointmentData] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    /**
     * Đặt lịch khám
     * @param {Object} bookingData - Dữ liệu đặt lịch
     * @returns {Promise<Object|null>} - Appointment data hoặc null nếu thất bại
     */
    const createBooking = useCallback(async (bookingData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await appointmentApi.createAppointment(bookingData);

            if (response.data.success) {
                setSuccess(true);
                setAppointmentData(response.data.data);
                
                // Show notification created status
                if (response.data.data.notification_created) {
                    console.log("✅ Notification created successfully");
                }
                
                return response.data.data;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Đặt lịch thất bại. Vui lòng thử lại.";
            setError(errorMessage);
            console.error("Error creating booking:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy slots available của bác sĩ
     * @param {string} doctorId - ID của bác sĩ
     * @param {string} date - Ngày (YYYY-MM-DD)
     * @returns {Promise<Array>} - Danh sách slots
     */
    const fetchAvailableSlots = useCallback(async (doctorId, date) => {
        try {
            setLoadingSlots(true);
            setError(null);

            const response = await appointmentApi.getAvailableSlots(doctorId, date);

            if (response.data.success) {
                const slots = response.data.data || [];
                setAvailableSlots(slots);
                return slots;
            }
            
            return [];
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Không thể tải slots. Vui lòng thử lại.";
            setError(errorMessage);
            console.error("Error fetching slots:", err);
            return [];
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    /**
     * Kiểm tra slot availability
     * @param {string} slotId - ID của slot
     * @param {string} scheduledDate - Ngày đặt (YYYY-MM-DD)
     * @param {string} [patientId] - ID của bệnh nhân
     * @returns {Promise<Object|null>} - Availability info hoặc null
     */
    const checkSlotAvailability = useCallback(async (slotId, scheduledDate, patientId) => {
        try {
            const response = await appointmentApi.checkSlotAvailability(slotId, scheduledDate, patientId);

            if (response.data.success) {
                return response.data.data;
            }
            
            return null;
        } catch (err) {
            console.error("Error checking slot availability:", err);
            return null;
        }
    }, []);

    /**
     * Reset booking state
     */
    const resetBooking = useCallback(() => {
        setLoading(false);
        setError(null);
        setSuccess(false);
        setAppointmentData(null);
    }, []);

    /**
     * Clear slots
     */
    const clearSlots = useCallback(() => {
        setAvailableSlots([]);
        setLoadingSlots(false);
    }, []);

    return {
        // State
        loading,
        error,
        success,
        appointmentData,
        availableSlots,
        loadingSlots,
        
        // Methods
        createBooking,
        fetchAvailableSlots,
        checkSlotAvailability,
        resetBooking,
        clearSlots,
        
        // Setters
        setError,
        
        // Computed
        hasSlots: availableSlots.length > 0,
    };
};

