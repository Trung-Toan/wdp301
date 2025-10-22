const Account = require('../../model/auth/Account');
const User = require('../../model/user/User');
const Doctor = require('../../model/doctor/Doctor');
const doctorService = require('../../service/doctor/doctor.service');
const resUltils = require('../../utils/responseUtils');

exports.registerDoctor = async (req, res) => {
    try {
        const { doctor } = doctorService.registerDoctor(req);
        return resUltils.createdResponse(res, { doctor }, "Doctor registered successfully");
    } catch (error) {
        console.error("Error registering doctor:", error);
        return resUltils.serverErrorResponse(res, error, "Failed to register doctor");
    }
};