const { getAllSpecialties, getSpecialtyById } = require("../../service/clinic/specialty.service");

exports.getAllSpecialties = async (req, res, next) => {
    try {
        const data = await getAllSpecialties(req.query);
        res.json({ success: true, total: data.length, data });
    } catch (err) {
        next(err);
    }
};

exports.getSpecialtyById = async (req, res, next) => {
    try {
        const { specialtyId } = req.params;
        const data = await getSpecialtyById(specialtyId);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
