const { getAllSpecialties } = require("../../service/clinic/specialty.service");

exports.getAllSpecialties = async (req, res, next) => {
    try {
        const data = await getAllSpecialties(req.query);
        res.json({ success: true, total: data.length, data });
    } catch (err) {
        next(err);
    }
};
