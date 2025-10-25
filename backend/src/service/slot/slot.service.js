const Slot = require("../../model/appointment/Slot");

exports.getSlotAtNowByDocterId = async (doctor_id) => {
  try {
    const now = new Date();
    let nowMinutes = now.getHours() * 60 + now.getMinutes();
    const slots = await Slot.find({
      doctor_id,
      status: "AVAILABLE",
    }).lean();

    const slot = slots.find((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    });

    return slot || null;
  } catch (error) {
    console.error("Error in getSlotAtNowByDocterId:", error);
    return null;
  }
};

exports.getFirtAvailableSlotByDoctorId = async (doctor_id) => {
    try {
        const slot = await Slot.findOne({
            doctor_id,
            status: "AVAILABLE",
        }).sort({ start_time: 1 }).lean();
        
        return slot || null;
    } catch (error) {
        console.error("Error in getFirtAvailableSlotByDoctorId:", error);
        return null;
    }
};

exports.getListSlotsByDoctorId = async (doctor_id) => {
    try {
        const slots = await Slot.find({
            doctor_id,
            status: "AVAILABLE",
        }).sort({ start_time: 1 }).lean();
        
        return slots || [];
    } catch (error) {
        console.error("Error in getListSlotsByDoctorId:", error);
        return [];
    }
};

exports.getAllListSlotsByDoctorId = async (doctor_id, status = "") => {
    try {
        const slots = await Slot.find({
            doctor_id,
            ...(status && { status: status })
        }).sort({ start_time: 1 }).lean();
        
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