const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Doctor = require("../../model/doctor/Doctor");
const AdminClinic = require("../../model/user/AdminClinic");
const Clinic = require("../../model/clinic/Clinic");
const Assistant = require("../../model/user/Assistant");
const License = require("../../model/clinic/License");

const SALT_ROUNDS = 12;

const hashPassword = async (s) => bcrypt.hash(s, SALT_ROUNDS);

//tạo bác sĩ
exports.createDoctor = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      username,
      password,
      phone_number,
      full_name,
      clinic_id,
      specialty_id,
    } = payload;

    //Tạo tài khoản
    const hashedPassword = await hashPassword(password);
    const acc = await Account.create(
      [
        {
          username: username.trim(),
          email: `doc-${username}@example.com`,
          phone_number: phone_number?.trim(),
          password: hashedPassword,
          role: "DOCTOR",
          status: "ACTIVE",
          email_verified: false,
        },
      ],
      { session }
    );

    //Tạo User (liên kết Account)
    const user = await User.create(
      [
        {
          full_name,
          dob: null,
          gender: null,
          address: "",
          account_id: acc[0]._id,
        },
      ],
      { session }
    );

    //Tạo Doctor (liên kết User)
    const doctor = await Doctor.create(
      [
        {
          title: "",
          degree: "",
          description: "",
          experience: "",
          clinic_id,
          specialty_id,
          user_id: user[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      ok: true,
      message: "Tạo bác sĩ thành công",
      data: {
        account: acc[0],
        user: user[0],
        doctor: doctor[0],
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi tạo bác sĩ:", error);
    return {
      ok: false,
      message: "Không thể tạo bác sĩ: " + error.message,
    };
  }
};

//tạo trợ lý
exports.createAssistant = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      username,
      password,
      phone_number,
      full_name,
      note,
      type,
      doctor_id,
      clinic_id,
    } = payload;

    //Tạo tài khoản
    const hashedPassword = await hashPassword(password);
    const acc = await Account.create(
      [
        {
          username: username.trim(),
          email: `assistant-${username}@example.com`,
          phone_number: phone_number?.trim(),
          password: hashedPassword,
          role: "ASSISTANT",
          status: "ACTIVE",
          email_verified: false,
        },
      ],
      { session }
    );

    //Tạo User (liên kết Account)
    const user = await User.create(
      [
        {
          full_name,
          dob: null,
          gender: null,
          address: "",
          account_id: acc[0]._id,
        },
      ],
      { session }
    );

    //Tạo Assistant (liên kết User)
    const assistant = await Assistant.create(
      [
        {
          note,
          type,
          doctor_id,
          clinic_id,
          user_id: user[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      ok: true,
      message: "Tạo trợ lý thành cong",
      data: {
        account: acc[0],
        user: user[0],
        assistant: assistant[0],
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi tạo trợ lý:", error);
    return {
      ok: false,
      message: "Không thể tạo trợ lý: " + error.message,
    };
  }
};

//Lấy danh sách trợ lý theo clinic
exports.getAssistantsByClinic = async (clinicId) => {
  const data = await Assistant.find({ clinic_id: clinicId })
    .populate({
      path: "user_id",
      populate: { path: "account_id", select: "username phone_number status" },
    })
    .populate({
      path: "doctor_id",
      populate: { path: "user_id", select: "full_name" },
    })
    .lean();

  return { ok: true, data };
};

//xoá trợ lý
exports.deleteAssistant = async (assistantId) => {
  const assistant = await Assistant.findById(assistantId);
  if (!assistant) throw new Error("Assistant not found");

  await Assistant.findByIdAndDelete(assistantId);
  return true;
};

//Lấy clinic mà admin clinic hiện tại quản lý
exports.getClinicByAdmin = async (accountId) => {
  try {
    const user = await User.findOne({ account_id: accountId });
    if (!user)
      throw new Error("Không tìm thấy user tương ứng với account này.");

    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic)
      throw new Error("Không tìm thấy admin clinic tương ứng với user này.");

    const clinic = await Clinic.findOne({
      created_by: adminClinic._id,
    }).populate("specialties");
    if (!clinic) throw new Error("Admin clinic này chưa có phòng khám nào.");

    if (clinic.status !== "ACTIVE")
      throw new Error("Phòng khám này chưa đăng ký.");

    return { ok: true, data: clinic };
  } catch (error) {
    console.error("Lỗi khi lấy clinic của admin:", error);
    return { ok: false, message: error.message };
  }
};

//lấy danh sách bác sĩ theo clinic mà admin_clinic đang quản lý
exports.getDoctorsByAdminClinic = async (adminAccountId) => {
  try {
    //Lấy user tương ứng với account id
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) throw new Error("Không tìm thấy user của admin clinic");

    //Tìm bản ghi AdminClinic tương ứng
    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) throw new Error("Không tìm thấy admin clinic");

    //Lấy clinic do admin clinic này tạo
    const clinics = await Clinic.find({ created_by: adminClinic._id });
    if (!clinics.length) return [];

    const clinicIds = clinics.map((c) => c._id);

    //Lấy danh sách bác sĩ thuộc các clinic đó
    const doctors = await Doctor.find({ clinic_id: { $in: clinicIds } })
      .populate({
        path: "user_id",
        populate: { path: "account_id", model: "Account" },
        select: "full_name avatar_url",
      })
      .populate("specialty_id")
      .populate("clinic_id");

    return doctors;
  } catch (err) {
    console.error("Lỗi trong getDoctorsByAdminClinic:", err);
    throw err;
  }
};

// Lấy danh sách chứng chỉ (PENDING)
exports.getPendingDoctorLicenses = async (adminAccountId) => {
  try {
    const clinicData = await exports.getClinicByAdmin(adminAccountId);
    if (!clinicData.ok) {
      throw new Error(
        "Không tìm thấy phòng khám của admin: " + clinicData.message
      );
    }
    const clinicId = clinicData.data._id;

    const doctorsInClinic = await Doctor.find({ clinic_id: clinicId }).select(
      "_id"
    );
    const doctorIds = doctorsInClinic.map((doc) => doc._id);

    if (doctorIds.length === 0) {
      return { ok: true, data: [] };
    }

    const licenses = await License.find({
      doctor_id: { $in: doctorIds },
      status: "PENDING",
    })
      .populate({
        path: "doctor_id",
        select: "user_id",
        populate: {
          path: "user_id",
          select: "full_name avatar_url",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return { ok: true, data: licenses };
  } catch (error) {
    console.error("Lỗi khi lấy chứng chỉ chờ duyệt:", error);
    return { ok: false, message: error.message };
  }
};

//cập nhật trạng thái chứng chỉ
exports.updateLicenseStatus = async (
  adminAccountId,
  licenseId,
  newStatus,
  rejectionReason = ""
) => {
  try {
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) throw new Error("Không tìm thấy user của admin");
    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) throw new Error("Không tìm thấy admin clinic");

    const validStatus = ["APPROVED", "REJECTED"];
    if (!validStatus.includes(newStatus)) {
      throw new Error("Trạng thái mới không hợp lệ.");
    }

    const license = await License.findById(licenseId);
    if (!license) {
      throw new Error("Không tìm thấy chứng chỉ.");
    }

    license.status = newStatus;

    if (newStatus === "APPROVED") {
      license.approved_at = new Date();
      license.approved_by = adminClinic._id;
      license.rejected_reason = null;
    } else if (newStatus === "REJECTED") {
      license.rejected_reason = rejectionReason;
      license.approved_at = null;
      license.approved_by = null;
    }

    await license.save();

    return { ok: true, data: license };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái chứng chỉ:", error);
    return { ok: false, message: error.message };
  }
};

//cập nhật thông tin phòng khám
exports.updateClinicByAdmin = async (adminAccountId, updateData) => {
  try {
    // Lấy clinic của admin
    const clinicResult = await exports.getClinicByAdmin(adminAccountId);
    if (!clinicResult.ok) {
      throw new Error(clinicResult.message || "Không tìm thấy phòng khám");
    }

    const clinic = clinicResult.data;
    const clinicId = clinic._id;

    // Chuẩn bị dữ liệu cập nhật
    const updateFields = {};
    
    // Các trường cơ bản
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.website !== undefined) updateFields.website = updateData.website;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.logo_url !== undefined) updateFields.logo_url = updateData.logo_url;
    if (updateData.banner_url !== undefined) updateFields.banner_url = updateData.banner_url;
    if (updateData.registration_number !== undefined) updateFields.registration_number = updateData.registration_number;
    if (updateData.opening_hours !== undefined) updateFields.opening_hours = updateData.opening_hours;
    if (updateData.closing_hours !== undefined) updateFields.closing_hours = updateData.closing_hours;

    // Cập nhật địa chỉ
    if (updateData.address) {
      updateFields.address = {
        ...clinic.address,
        ...updateData.address,
      };
      // Nếu có province hoặc ward, giữ nguyên format
      if (updateData.address.province) {
        updateFields.address.province = updateData.address.province;
      }
      if (updateData.address.ward) {
        updateFields.address.ward = updateData.address.ward;
      }
    }

    // Cập nhật chuyên khoa
    if (updateData.specialties !== undefined) {
      updateFields.specialties = updateData.specialties;
    }

    // Cập nhật clinic
    const updatedClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("specialties");

    if (!updatedClinic) {
      throw new Error("Không thể cập nhật phòng khám");
    }

    return { ok: true, message: "Cập nhật phòng khám thành công", data: updatedClinic };
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng khám:", error);
    return { ok: false, message: error.message };
  }
};
