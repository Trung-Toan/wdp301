const Slot = require("../../model/appointment/Slot");
const moment = require("moment-timezone");

/**
 * lấy slot của bác sĩ này tại thời điểm này hoặc  
 * @param {*} doctor_id 
 * @param {*} date 
 * @returns 
 */
exports.getSlotAtDateByDocterId = async (doctor_id, date = new Date()) => {
    try {
        const slot = await Slot.findOne({
            doctor_id,
            status: "AVAILABLE",
            start_time: { $lte: date },
            end_time: { $gt: date }
        }).lean();
        return slot || null;
    } catch (error) {
        console.error("Error in getSlotAtNowByDocterId:", error);
        return null;
    }
};

exports.slotAvaiable = async (doctorId, dateFilter) => {
    return (await exports.getSlotAtDateByDocterId(doctorId, dateFilter)
        || await exports.getFirstAvailableSlotByDoctorId(doctorId, dateFilter));
}

/**
 * Lấy slot AVAILABLE đầu tiên (sớm nhất) trong một ngày cụ thể.
 * @param {*} doctor_id 
 * @param {*} date (Một đối tượng Date. Hàm sẽ tìm slot trong ngày của Date này)
 * @returns {object|null} - Trả về object slot hoặc null nếu không tìm thấy.
 */
exports.getFirstAvailableSlotByDoctorId = async (doctor_id, date = new Date()) => {

    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const slot = await Slot.findOne({
            doctor_id,
            status: "AVAILABLE",
            start_time: { $gte: startOfDay, $lte: endOfDay }
        })
            .sort({ start_time: 1 })
            .lean();

        return slot || null;

    } catch (error) {
        console.error("Error in getFirstAvailableSlotByDoctorId:", error);
        return null;
    }
};

exports.getListSlotsByDoctorId = async (doctor_id, date = new Date()) => {

    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const slots = await Slot.find({
            doctor_id,
            status: "AVAILABLE",
            start_time: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ start_time: 1 }).lean();

        return slots || [];
    } catch (error) {
        console.error("Error in getListSlotsByDoctorId:", error);
        return [];
    }
};

exports.getAllListSlotsByDoctorId = async (doctor_id, date, status) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const query = {
            doctor_id,
            start_time: { $gte: startOfDay, $lte: endOfDay }
        };

        if (status) query.status = status;

        const slots = await Slot.find(query).sort({ start_time: 1 }).lean();
        return slots || [];
    } catch (error) {
        console.error("Error in getListSlotsByDoctorId:", error);
        return [];
    }
};

exports.getSlotById = async (slot_id) => {
    try {
        const slot = await Slot.findById(slot_id).lean();
        return slot || null;
    } catch (error) {
        console.error("Error in getSlotById:", error);
        return null;
    }
};

/**
 * Tạo một slot mới
 * @param {object} slotData - Dữ liệu của slot (ví dụ: { doctor_id, date, start_time, ... })
 */
exports.createSlot = async (slotData) => {
    try {
        const newSlot = new Slot(slotData);
        const savedSlot = await newSlot.save();
        return savedSlot;
    } catch (error) {
        console.error("Error in createSlot:", error);
        throw error;
    }
};


/**
 * Cập nhật một slot bằng ID
 * @param {string} slot_id - ID của slot cần cập nhật
 * @param {object} updateData - Dữ liệu cần cập nhật (ví dụ: { status: "BOOKED" })
 */
exports.updateSlotById = async (slot_id, updateData) => {
    try {
        const updatedSlot = await Slot.findByIdAndUpdate(
            slot_id,
            { $set: updateData },
            { new: true }
        ).lean();

        return updatedSlot;
    } catch (error) {
        console.error("Error in updateSlotById:", error);
        throw error;
    }
};