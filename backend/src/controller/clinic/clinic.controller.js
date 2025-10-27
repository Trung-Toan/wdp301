const { getAllClinic } = require("../../service/clinic/clinic.service");

exports.getAllClinic = async (req, res, next) => {
    try {
        const data = await getAllClinic(req.query);
        res.json({ success: true, total: data.length, data });
    } catch (err) {
        next(err);
    }
}