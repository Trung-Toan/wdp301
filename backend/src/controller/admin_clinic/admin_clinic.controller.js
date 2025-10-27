const {
  createDoctor,
} = require("../../service/admin_clinic/adminClinic.service");

exports.createAccountDoctor = async (req, res, next) => {
  try {
    const data = await createDoctor(req.body);
    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
};
