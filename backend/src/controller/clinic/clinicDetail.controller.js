const { getClinicDetail, getClinicDoctors, getClinicReviews } = require("../../service/clinic/clinicDetail.service");


exports.getClinicDetail = async (req, res, next) => {
    try {
        const { clinicId } = req.params;

        const data = await getClinicDetail(clinicId);
        return res.json({ success: true, data });
    } catch (err) {
        return next(err);
    }
};


exports.getClinicDoctors = async (req, res, next) => {
    try {
        const { clinicId } = req.params;

        const { specialtyId, limit, page } = req.query;

        const result = await getClinicDoctors(clinicId, {
            specialtyId,
            limit: limit ? Number(limit) : undefined,
            page: page ? Number(page) : undefined,
        });
        return res.json({ success: true, ...result });
    } catch (err) {
        return next(err);
    }
};


exports.getClinicReviews = async (req, res, next) => {
    try {
        const { clinicId } = req.params;

        const { limit, page } = req.query;

        const result = await getClinicReviews(clinicId, {
            limit: limit ? Number(limit) : undefined,
            page: page ? Number(page) : undefined,
        });
        return res.json({ success: true, ...result });
    } catch (err) {
        return next(err);
    }
};

