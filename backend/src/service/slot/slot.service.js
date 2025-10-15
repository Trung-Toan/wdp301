const Slot = require("../../model/appointment/Slot");

exports.getSlotAtNowByDocterId = async (doctor_id) => {
    try {
        const now = new Date();
        let nowMinutes = now.getHours() * 60 + now.getMinutes();
        nowMinutes = 490; // testing 8:10 AM
        const slots = await Slot.find({
            doctor_id,
            status: "AVAILABLE"
        }).lean();

        const slot = slots.find(s => {
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
