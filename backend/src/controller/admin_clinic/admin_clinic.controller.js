const {
  createDoctor,
  getClinicByAdmin
} = require("../../service/admin_clinic/adminClinic.service");

exports.createAccountDoctor = async (req, res, next) => {
  try {
    const data = await createDoctor(req.body);
    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
};

exports.getClinicByAdmin = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const result = await getClinicByAdmin(accountId);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
};