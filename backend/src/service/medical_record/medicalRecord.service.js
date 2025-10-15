// medicalRecord.service.js
const doctorService = require("../doctor/doctor.service");
const MedicalRecord = require("../../model/patient/MedicalRecord");

/**
 * Gửi yêu cầu xem tất cả hồ sơ bệnh án của 1 bệnh nhân
 * @param {Object} req - Express request (có req.user và req.params.patientId)
 */
exports.requestViewMedicalRecord = async (req) => {
  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    const doctorId = doctor._id;
    const patientId = req.params.patientId;

    const records = await MedicalRecord.find({ patient_id: patientId });

    if (!records || records.length === 0) {
      return null;
    }

    const updatePromises = records.map(async (record) => {
      // THAY ĐỔI LOGIC NẰM Ở ĐÂY
      const existingRequest = record.access_requests.find(
        (r) =>
          r.doctor_id.toString() === doctorId.toString() &&
          ["PENDING", "APPROVED"].includes(r.status) // Kiểm tra nếu status là PENDING hoặc APPROVED
      );
      // KẾT THÚC THAY ĐỔI

      // Nếu đã tồn tại yêu cầu PENDING hoặc APPROVED, bỏ qua
      if (existingRequest) {
        return null;
      }

      const newRequest = {
        doctor_id: doctorId,
        status: "PENDING",
        requested_at: new Date(),
      };

      record.access_requests.push(newRequest);
      await record.save();

      return {
        record_id: record._id,
        ...newRequest,
      };
    });

    const results = await Promise.all(updatePromises);
    const updatedRequests = results.filter(Boolean);

    if (updatedRequests.length === 0) {
      throw new Error(
        "Bạn đã gửi yêu cầu hoặc đã được cấp quyền truy cập hồ sơ của bệnh nhân này."
      );
    }

    return updatedRequests;
  } catch (error) {
    console.error("Error in requestViewMedicalRecord:", error);
    throw error;
  }
};


exports.requestViewMedicalRecordById = async (req) => {
  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    const doctorId = doctor._id;
    const patientId = req.params.patientId;
    const medicalRecordId = req.params.medicalRecordId;

    console.log("doctorId, patientId, medicalRecordId", doctorId, patientId, medicalRecordId);


    const record = await MedicalRecord.findOne({ _id: medicalRecordId, patient_id: patientId });

    if (!record) {
      return null;
    }

    // THAY ĐỔI LOGIC NẰM Ở ĐÂY
    const existingRequest = record.access_requests.find(
      (r) =>
        r.doctor_id.toString() === doctorId.toString() &&
        ["PENDING", "APPROVED"].includes(r.status) // Kiểm tra nếu status là PENDING hoặc APPROVED
    );
    // KẾT THÚC THAY ĐỔI

    // Nếu đã tồn tại yêu cầu PENDING hoặc APPROVED, bỏ qua
    if (existingRequest) {
      throw new Error(
        "Bạn đã gửi yêu cầu hoặc đã được cấp quyền truy cập hồ sơ của bệnh nhân này."
      );
    }

    const newRequest = {
      doctor_id: doctorId,
      status: "PENDING",
      requested_at: new Date(),
    };

    record.access_requests.push(newRequest);
    await record.save();

    return {
      record_id: record._id,
      ...newRequest,
    };
  } catch (error) {
    console.error("Error in requestViewMedicalRecordById:", error);
    throw error;
  }
}


/**
 * Lấy lịch sử yêu cầu truy cập hồ sơ của một bác sĩ (đã tối ưu và sửa lỗi sắp xếp)
 */
exports.getHistoryMedicalRecordRequests = async (req) => {
  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    const doctorIdAsObjectId = doctor._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sử dụng Aggregation Pipeline để xử lý tất cả trong một truy vấn
    const results = await MedicalRecord.aggregate([
      // Giai đoạn 1: Tách các yêu cầu trong mảng ra
      { $unwind: "$access_requests" },

      // Giai đoạn 2: Lọc các yêu cầu của đúng bác sĩ
      { $match: { "access_requests.doctor_id": doctorIdAsObjectId } },

      // Giai đoạn 3: Dùng $facet để chạy 2 pipeline con: 1 để đếm, 1 để lấy data
      {
        $facet: {
          // Pipeline con 1: Lấy metadata (tổng số mục)
          metadata: [{ $count: "totalItems" }],
          // Pipeline con 2: Lấy dữ liệu đã được sắp xếp và phân trang
          data: [
            // Sắp xếp các yêu cầu theo ngày (mới nhất trước)
            { $sort: { "access_requests.requested_at": -1 } },
            // Phân trang
            { $skip: skip },
            { $limit: limit },
            // Định dạng lại output cho giống yêu cầu
            {
              $project: {
                _id: 0, // Bỏ trường _id của MedicalRecord
                record_id: "$_id",
                patient_id: "$patient_id",
                status: "$access_requests.status",
                requested_at: "$access_requests.requested_at",
                reviewed_at: { $ifNull: ["$access_requests.reviewed_at", null] },
                reviewed_by: { $ifNull: ["$access_requests.reviewed_by", null] },
              }
            }
          ]
        }
      }
    ]);

    console.log("results", results);

    // Trích xuất kết quả từ $facet
    const requests = results[0].data;
    const totalItems = results[0].metadata[0] ? results[0].metadata[0].totalItems : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      requests,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    console.error("Error in getHistoryMedicalRecordRequests:", error);
    throw error;
  }
};

exports.getListMedicalRecordsByIdPatient = async (req) => {
  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    const doctorId = doctor._id;
    const patientId = req.params.patientId;

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Lấy tổng số hồ sơ bệnh án của bệnh nhân
    const totalRecords = await MedicalRecord.countDocuments({ patient_id: patientId, doctor_id: doctorId });

    if (totalRecords === 0) {
      return { records: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit: limitNumber } };
    }
    // Lấy danh sách hồ sơ bệnh án với phân trang
    const records = await MedicalRecord.find({ patient_id: patientId, doctor_id: doctorId })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalRecords / limitNumber);

    return {
      records,
      pagination: {
        totalItems: totalRecords,
        totalPages: totalPages,
        currentPage: pageNumber,
        limit: limitNumber
      }
    };
  } catch (error) {
    console.error("Error in getListMedicalRecordsByIdPatient:", error);
    throw error;
  }
}

exports.getListMedicalRecords = async (req) => {
  try {
    const doctor = await doctorService.findDoctorByAccountId(req.user.sub);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    const doctorId = doctor._id;

    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.max(parseInt(limit) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    // --- Bắt đầu xây dựng Aggregation Pipeline ---

    // 1. Điều kiện $match ban đầu để lọc quyền truy cập
    const accessControlMatch = {
      $or: [
        { doctor_id: doctorId },
        { status: "PUBLIC" },
        {
          status: "PRIVATE",
          access_requests: {
            $elemMatch: {
              doctor_id: doctorId,
              status: "APPROVED",
            },
          },
        },
      ],
    };

    // 2. Tạo pipeline cơ sở
    let pipeline = [
      { $match: accessControlMatch },
      // Liên kết với collection 'patients' để lấy patient_code
      {
        $lookup: {
          from: "patients", // Tên collection của Patient, thường là số nhiều
          localField: "patient_id",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      { $unwind: "$patientInfo" },
      // Liên kết với collection 'users' để lấy full_name
      {
        $lookup: {
          from: "users", // Tên collection của User, thường là số nhiều
          localField: "patientInfo.user_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
    ];

    // 3. Thêm điều kiện $match cho tìm kiếm nếu có `search` query
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "patientInfo.patient_code": { $regex: search, $options: "i" } },
            { "userInfo.full_name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // --- Thực thi Pipeline ---

    // 4. Pipeline để đếm tổng số bản ghi khớp điều kiện
    const countPipeline = [...pipeline, { $count: "totalRecords" }];
    const totalResult = await MedicalRecord.aggregate(countPipeline);
    const totalRecords = totalResult.length > 0 ? totalResult[0].totalRecords : 0;

    if (totalRecords === 0) {
      return {
        records: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: pageNumber,
          limit: limitNumber,
        },
      };
    }

    // 5. Pipeline để lấy dữ liệu đã phân trang và định dạng lại
    const dataPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNumber },
      // Định dạng lại output cuối cùng
      {
        $project: {
          _id: 0,
          medical_record_id: "$_id",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          prescription_status: "$prescription.status",
          diagnosis: "$diagnosis",
          patient_id: "$patientInfo._id",
          doctor_id: "$doctor_id",
          patient_code: "$patientInfo.patient_code",
          patient_name: "$userInfo.full_name",
        },
      },
    ];

    const records = await MedicalRecord.aggregate(dataPipeline);
    const totalPages = Math.ceil(totalRecords / limitNumber);

    return {
      records: records,
      pagination: {
        totalItems: totalRecords,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
    };
  } catch (error) {
    console.error("Error in getListMedicalRecords:", error);
    throw error;
  }
};


