const Clinic = require("../../model/clinic/Clinic");
const Specialty = require("../../model/clinic/Specialty");
const AdminClinic = require("../../model/user/AdminClinic");

// Tạo yêu cầu đăng ký phòng khám mới
exports.createRegistrationRequest = async ({
    admin_clinic_id,
    clinic_info,
}) => {
    try {
        // Kiểm tra admin clinic có tồn tại không
        const adminClinic = await AdminClinic.findById(admin_clinic_id);
        if (!adminClinic) {
            throw new Error("Admin clinic không tồn tại");
        }

        // Kiểm tra xem admin clinic đã có yêu cầu đang chờ phê duyệt chưa
        const existingRequest = await Clinic.findOne({
            created_by: admin_clinic_id,
            status: { $in: ["PENDING"] },
        });

        if (existingRequest) {
            throw new Error("Bạn đã có yêu cầu đang chờ phê duyệt");
        }

        // Tạo clinic mới với trạng thái chờ duyệt
        const clinic = new Clinic({
            name: clinic_info.name,
            phone: clinic_info.phone,
            email: clinic_info.email,
            website: clinic_info.website,
            description: clinic_info.description,
            logo_url: clinic_info.logo_url,
            banner_url: clinic_info.banner_url,
            registration_number: clinic_info.registration_number,
            opening_hours: clinic_info.opening_hours,
            closing_hours: clinic_info.closing_hours,
            address: clinic_info.address,
            specialties: clinic_info.specialties,
            created_by: admin_clinic_id,
            status: "PENDING", // Chờ phê duyệt
        });

        await clinic.save();
        return clinic;
    } catch (error) {
        throw error;
    }
};

// Lấy danh sách chuyên khoa
exports.getSpecialties = async () => {
    try {
        return await Specialty.find({}).lean();
    } catch (error) {
        throw error;
    }
};
