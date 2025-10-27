const {
  createDoctor,
} = require("../../service/admin_clinic/createDoctor.service");

exports.createAccountDoctor = async (req, res, next) => {
  try {
    const data = await createDoctor(req.query);
    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
};
