const { getDoctorDetailFull } = require("../../service/doctor/doctor-detail.service");

const ok = (res, data) => res.status(200).json({ success: true, data });
const fail = (res, err, status = 500) =>
    res.status(status).json({ success: false, error: err?.message || String(err) });

exports.getDoctorDetailController = async (req, res) => {
    try {
        const { id } = req.params;
        const { from, to, limitSlot } = req.query;

        const data = await getDoctorDetailFull(id, { from, to, limitSlot });
        if (!data) return fail(res, new Error("Doctor not found"), 404);

        return ok(res, data);
    } catch (err) {
        console.error("❌ Error in getDoctorDetailController:", err);
        return fail(res, err);
    }
};
