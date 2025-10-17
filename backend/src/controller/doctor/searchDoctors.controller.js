const { searchDoctors } = require("../../service/doctor/searchDoctor.service");

const ok = (res, data) => res.status(200).json({ success: true, data });
const fail = (res, err, status = 500) =>
    res.status(status).json({ success: false, error: err?.message || String(err) });

exports.searchDoctorController = async (req, res) => {
    try {
        const {
            q,
            clinicId,
            specialtyId,
            page = "1",
            limit = "20",
            sort = "-createdAt",
        } = req.query;

        const result = await searchDoctors({
            q,
            clinicId,
            specialtyId,
            page: Number(page),
            limit: Number(limit),
            sort,
        });

        return ok(res, result);
    } catch (err) {
        console.error(" Error in searchDoctorController:", err);
        return fail(res, err);
    }
};
