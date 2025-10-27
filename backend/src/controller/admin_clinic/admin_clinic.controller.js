const {
  createDoctor,
  getClinicByAdmin
} = require("../../service/admin_clinic/adminClinic.service");

exports.createAccountDoctor = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;

    const clinicResult = await getClinicByAdmin(accountId);
    if (!clinicResult.ok) return res.status(400).json(clinicResult);

    const clinic = clinicResult.data;

    const payload = { ...req.body, clinic_id: clinic._id };

    const result = await createDoctor(payload);
    res.status(result.ok ? 200 : 400).json(result);
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