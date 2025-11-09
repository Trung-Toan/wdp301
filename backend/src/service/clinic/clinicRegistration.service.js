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
      status: "PENDING",
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

// Lấy danh sách yêu cầu đăng ký phòng khám chờ duyệt
exports.getPendingClinics = async () => {
  try {
    const clinics = await Clinic.find({ status: "PENDING" })
      .populate("created_by", "_id")
      .populate("specialties", "name")
      .sort({ createdAt: -1 })
      .lean();

    return clinics.map((clinic) => ({
      _id: clinic._id,
      name: clinic.name,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website,
      description: clinic.description,
      logo_url: clinic.logo_url,
      banner_url: clinic.banner_url,
      registration_number: clinic.registration_number,
      opening_hours: clinic.opening_hours,
      closing_hours: clinic.closing_hours,
      address: clinic.address,
      specialties: clinic.specialties,
      created_by: clinic.created_by,
      status: clinic.status,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    }));
  } catch (error) {
    throw error;
  }
};

exports.approveClinic = async ({ clinic_id, admin_system_id, review_notes }) => {
  try {
    const clinic = await Clinic.findById(clinic_id);
    if (!clinic) {
      throw new Error("Không tìm thấy phòng khám");
    }

    if (clinic.status !== "PENDING") {
      throw new Error("Phòng khám này không ở trạng thái chờ duyệt");
    }

    clinic.status = "ACTIVE";
    clinic.review_info = {
      reviewed_by: admin_system_id,
      reviewed_at: new Date(),
      review_notes: review_notes || "",
      rejection_reason: null,
    };

    await clinic.save();
    return clinic;
  } catch (error) {
    throw error;
  }
};

exports.rejectClinic = async ({ clinic_id, admin_system_id, rejection_reason }) => {
  try {
    const clinic = await Clinic.findById(clinic_id);
    if (!clinic) {
      throw new Error("Không tìm thấy phòng khám");
    }

    if (clinic.status !== "PENDING") {
      throw new Error("Phòng khám này không ở trạng thái chờ duyệt");
    }

    clinic.status = "REJECTED";
    clinic.review_info = {
      reviewed_by: admin_system_id,
      reviewed_at: new Date(),
      review_notes: null,
      rejection_reason: rejection_reason || "",
    };

    await clinic.save();
    return clinic;
  } catch (error) {
    throw error;
  }
};
