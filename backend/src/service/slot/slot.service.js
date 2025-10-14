const Slot = require("../../model/appointment/Slot");

exports.getSlotAtNowByDocterId = async (doctor_id) => {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const slot = await Slot.findOne({
        start_time: { $lte: currentMinutes }, 
        end_time: { $gte: currentMinutes },  
        doctor_id: doctor_id,
        status: "AVAIABLE"
    }).lean();

    return slot || null;
};