const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Doctor = require("../../model/doctor/Doctor");
const AdminClinic = require("../../model/user/AdminClinic");
const Clinic = require("../../model/clinic/Clinic");
const Assistant = require("../../model/user/Assistant");
const License = require("../../model/clinic/License");
const Appointment = require("../../model/appointment/Appointment");
const Feedback = require("../../model/patient/Feedback");

const SALT_ROUNDS = 12;

const hashPassword = async (s) => bcrypt.hash(s, SALT_ROUNDS);

const startOfUTCDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addUTCDays = (d, n) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));

exports.findAdminClinicByAccountId = async (accId) => {
  try {
    // 1) Tìm user từ account_id
    const user = await User.findOne({ account_id: accId }).select("_id").lean();
    if (!user) return null;
    // 2) Tìm bản ghi AdminClinic gắn với user đó
    const adminClinic = await AdminClinic.findOne({ user_id: user._id })
      // nếu cần kèm thông tin user thì populate:
      .populate("user_id")
      .lean();
    return adminClinic || null;
  } catch (error) {
    console.error("findAdminClinicByAccountId error:", error);
    return null;
  }
};
/**
 * Tổng hợp số liệu dashboard cho Admin Clinic
 * - Xác định tất cả clinic do admin quản lý
 * - Lấy danh sách doctor thuộc các clinic đó
 * - Đếm trợ lý, license đang chờ duyệt
 * - Thống kê lịch hẹn hôm nay & 7 ngày gần nhất
 * - Tính rating trung bình (feedback) của toàn bộ doctor trong hệ thống của admin
 */
exports.getDashboard = async (adminAccountId) => {
  // 1) Xác định tất cả clinic mà admin quản lý
  const user = await User.findOne({ account_id: adminAccountId });
  if (!user) throw new Error("Không tìm thấy user của admin clinic");

  const adminClinic = await AdminClinic.findOne({ user_id: user._id });
  if (!adminClinic) throw new Error("Không tìm thấy admin clinic");

  const clinics = await Clinic.find({ created_by: adminClinic._id })
    .select("_id name status")
    .lean();

  const clinicIds = clinics.map((c) => c._id);
  const totalClinics = clinicIds.length;

  // 2) Danh sách doctor thuộc các clinic này
  const doctors = await Doctor.find({ clinic_id: { $in: clinicIds } })
    .select("_id clinic_id")
    .lean();
  const doctorIds = doctors.map((d) => d._id);
  const totalDoctors = doctorIds.length;

  // 3) Trợ lý trong các clinic này
  const totalAssistants = await Assistant.countDocuments({ clinic_id: { $in: clinicIds } });

  // 4) License bác sĩ đang PENDING trong phạm vi các clinic này
  const pendingLicenses = doctorIds.length
    ? await License.countDocuments({ doctor_id: { $in: doctorIds }, status: "PENDING" })
    : 0;

  // 5) Mốc thời gian UTC (giống logic dashboard bác sĩ)
  const now = new Date();
  const todayStart = startOfUTCDay(now);
  const todayEnd = addUTCDays(now, 1);
  const weekStart = addUTCDays(now, -6); // 7 ngày gần nhất (bao gồm hôm nay)
  const weekStartUTC = startOfUTCDay(weekStart);

  // 6) Lịch hẹn hôm nay theo trạng thái
  let todayByStatus = {};
  if (doctorIds.length) {
    const todayAgg = await Appointment.aggregate([
      {
        $match: {
          doctor_id: { $in: doctorIds },
          scheduled_date: { $gte: todayStart, $lt: todayEnd },
        }
      },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    todayByStatus = todayAgg.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, {});
  }
  const todayTotal = Object.values(todayByStatus).reduce((a, b) => a + b, 0);

  // 7) Xu hướng đặt lịch 7 ngày gần nhất (group theo YYYY-MM-DD UTC)
  let bookings7d = [];
  if (doctorIds.length) {
    const trendAgg = await Appointment.aggregate([
      {
        $match: {
          doctor_id: { $in: doctorIds },
          scheduled_date: { $gte: weekStartUTC, $lt: todayEnd },
        }
      },
      {
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$scheduled_date", timezone: "UTC" }
          },
          status: 1
        }
      },
      {
        $group: {
          _id: { date: "$date", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    // chuẩn hoá về mảng mỗi ngày { date, total, completed }
    const map = new Map();
    for (const row of trendAgg) {
      const date = row._id.date;
      const prev = map.get(date) || { date, total: 0, completed: 0 };
      prev.total += row.count;
      if (row._id.status === "COMPLETED") prev.completed += row.count;
      map.set(date, prev);
    }
    bookings7d = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  // 8) Lịch hẹn sắp tới 7 ngày (SCHEDULED/APPROVED)
  const upcomingAppointments = doctorIds.length
    ? await Appointment.countDocuments({
      doctor_id: { $in: doctorIds },
      scheduled_date: { $gte: todayStart, $lt: addUTCDays(now, 7) },
      status: { $in: ["SCHEDULED", "APPROVED"] },
    })
    : 0;

  // 9) Điểm rating trung bình của toàn hệ thống (feedback tất cả doctors)
  let avgRating = 0, totalFeedbacks = 0;
  if (doctorIds.length) {
    const fb = await Feedback.aggregate([
      { $match: { doctor_id: { $in: doctorIds } } },
      { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } }
    ]);
    if (fb.length) {
      avgRating = Math.round((fb[0].avg || 0) * 10) / 10;
      totalFeedbacks = fb[0].total || 0;
    }
  }

  return {
    scope: {
      clinics,
      totalClinics,
      totalDoctors,
      totalAssistants,
      pendingLicenses,
    },
    today: {
      total: todayTotal,
      byStatus: todayByStatus,
    },
    bookings7d,
    upcomingAppointments,
    feedback: {
      avgRating,
      totalFeedbacks,
    },
  };
};

// Helper
const toObjectId = (v) => {
  try {
    return new mongoose.Types.ObjectId(String(v));
  } catch {
    return null;
  }
};

const parseDateStart = (s) => {
  if (!s) return null;
  // start: 00:00:00Z
  const dt = new Date(`${s}T00:00:00.000Z`);
  return isNaN(dt.getTime()) ? null : dt;
};

const parseDateEndIncl = (s) => {
  if (!s) return null;
  // end inclusive -> chuyển sang exclusive của ngày hôm sau
  const d = new Date(`${s}T00:00:00.000Z`);
  if (isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
};

/**
 * getFeedback(admin_clinic_id, filters)
 * Hỗ trợ filter + paging + sort. Tất cả bảng/tổng quan đều theo filter:
 * - q: tìm trong comment, tên bác sĩ, tên bệnh nhân, tên cơ sở (regex, case-insensitive)
 * - bucket: positive(4-5) | neutral(3) | negative(1-2)
 * - rating: "4" | "4,5" (ưu tiên hơn bucket nếu truyền cả 2)
 * - doctor_id: 1 ID hoặc nhiều ID (comma)
 * - clinic_id: giới hạn trong 1 cơ sở thuộc admin
 * - start_date, end_date: ngày (UTC), inclusive
 * - page, limit: phân trang cho `recent`
 * - sort: newest | oldest | rating_desc | rating_asc
 *
 * Trả về: { summary, distribution, byDoctor, recent, page, limit, total }
 */
exports.getFeedback = async (admin_clinic_id, filters = {}) => {
  const {
    q,
    bucket,
    rating,
    doctor_id,
    clinic_id,
    start_date,
    end_date,
    page = 1,
    limit = 15,
    sort = "newest",
  } = filters;

  // 1) Clinics thuộc admin này
  const clinics = await Clinic.find({ created_by: admin_clinic_id })
    .select("_id name")
    .lean();

  if (!clinics.length) {
    return {
      summary: { avgRating: 0, totalFeedbacks: 0 },
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      byDoctor: [],
      recent: [],
      page,
      limit,
      total: 0,
    };
  }

  const clinicIds = clinics.map((c) => c._id);
  const clinicNameById = clinics.reduce((m, c) => {
    m[c._id.toString()] = c.name;
    return m;
  }, {});

  // 2) Optional: giới hạn clinic theo clinic_id (nếu được truyền và thuộc quyền admin)
  let scopedClinicIds = clinicIds;
  if (clinic_id) {
    const cid = toObjectId(clinic_id);
    if (!cid || !clinicIds.some((id) => id.toString() === cid.toString())) {
      // không thuộc quyền admin -> trả rỗng
      return {
        summary: { avgRating: 0, totalFeedbacks: 0 },
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        byDoctor: [],
        recent: [],
        page,
        limit,
        total: 0,
      };
    }
    scopedClinicIds = [cid];
  }

  // 3) Lấy doctors trong các clinic scope
  const doctors = await Doctor.find({ clinic_id: { $in: scopedClinicIds } })
    .select("_id clinic_id user_id")
    .lean();

  if (!doctors.length) {
    return {
      summary: { avgRating: 0, totalFeedbacks: 0 },
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      byDoctor: [],
      recent: [],
      page,
      limit,
      total: 0,
    };
  }

  const doctorIdsAll = doctors.map((d) => d._id);

  // Optional: filter theo doctor_id (1 hoặc nhiều id phân cách dấu phẩy)
  let scopedDoctorIds = doctorIdsAll;
  if (doctor_id) {
    const list = String(doctor_id)
      .split(",")
      .map((s) => s.trim())
      .map(toObjectId)
      .filter(Boolean);

    // chỉ giữ lại những doctor thuộc scope
    const set = new Set(doctorIdsAll.map((x) => x.toString()));
    scopedDoctorIds = list.filter((id) => set.has(id.toString()));
    if (!scopedDoctorIds.length) {
      return {
        summary: { avgRating: 0, totalFeedbacks: 0 },
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        byDoctor: [],
        recent: [],
        page,
        limit,
        total: 0,
      };
    }
  }

  // 4) Base match (doctor + date + rating/bucket)
  const match = {
    doctor_id: { $in: scopedDoctorIds },
  };

  // Date range
  const start = parseDateStart(start_date);
  const end = parseDateEndIncl(end_date);
  if (start || end) {
    match.createdAt = {};
    if (start) match.createdAt.$gte = start;
    if (end) match.createdAt.$lt = end;
  }

  // Rating / bucket
  let ratingSet = null;
  if (rating) {
    ratingSet = String(rating)
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => [1, 2, 3, 4, 5].includes(n));
  } else if (bucket) {
    if (bucket === "positive") ratingSet = [4, 5];
    else if (bucket === "neutral") ratingSet = [3];
    else if (bucket === "negative") ratingSet = [1, 2];
  }
  if (ratingSet && ratingSet.length) {
    match.rating = { $in: ratingSet };
  }

  // 5) Sort
  let sortStage = { createdAt: -1 };
  if (sort === "oldest") sortStage = { createdAt: 1 };
  else if (sort === "rating_desc") sortStage = { rating: -1, createdAt: -1 };
  else if (sort === "rating_asc") sortStage = { rating: 1, createdAt: -1 };

  const skip = Math.max(0, (Number(page) - 1) * Number(limit));
  const lim = Math.max(1, Number(limit));

  // 6) Pipeline với $facet để:
  // - áp dụng cùng filter cho summary/distribution/byDoctor/recent/total
  // - áp dụng q trên comment/doctor_name/patient_name/clinic_name
  const pipeline = [
    { $match: match },
    // doctor
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    // clinic của doctor
    {
      $lookup: {
        from: "clinics",
        localField: "doctor.clinic_id",
        foreignField: "_id",
        as: "clinic",
      },
    },
    { $unwind: { path: "$clinic", preserveNullAndEmptyArrays: true } },
    // user (bác sĩ)
    {
      $lookup: {
        from: "users",
        localField: "doctor.user_id",
        foreignField: "_id",
        as: "doc_user",
      },
    },
    { $unwind: { path: "$doc_user", preserveNullAndEmptyArrays: true } },
    // patient
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    // user (bệnh nhân)
    {
      $lookup: {
        from: "users",
        localField: "patient.user_id",
        foreignField: "_id",
        as: "pat_user",
      },
    },
    { $unwind: { path: "$pat_user", preserveNullAndEmptyArrays: true } },
  ];

  // Tìm kiếm q
  if (q && String(q).trim()) {
    const kw = String(q).trim();
    pipeline.push({
      $match: {
        $or: [
          { comment: { $regex: kw, $options: "i" } },
          { "doc_user.full_name": { $regex: kw, $options: "i" } },
          { "pat_user.full_name": { $regex: kw, $options: "i" } },
          { "clinic.name": { $regex: kw, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      summary: [
        { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } },
      ],
      distribution: [
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ],
      byDoctor: [
        {
          $group: {
            _id: "$doctor_id",
            avg: { $avg: "$rating" },
            total: { $sum: 1 },
            doctor_name: { $first: "$doc_user.full_name" },
            clinic_name: { $first: "$clinic.name" },
          },
        },
        { $sort: { avg: -1, total: -1 } },
        { $limit: 20 },
      ],
      recent: [
        { $sort: sortStage },
        { $skip: skip },
        { $limit: lim },
        {
          $project: {
            rating: 1,
            comment: 1,
            is_annonymous: 1,
            createdAt: 1,
            doctor_id: 1,
            doctor_name: "$doc_user.full_name",
            clinic_name: "$clinic.name",
            patient_name: "$pat_user.full_name",
          },
        },
      ],
      totalMatched: [{ $count: "count" }],
    },
  });

  const facetRes = await Feedback.aggregate(pipeline);

  const first = facetRes?.[0] || {};
  const rawSummary = first.summary?.[0] || null;
  const rawDistribution = first.distribution || [];
  const rawByDoctor = first.byDoctor || [];
  const rawRecent = first.recent || [];
  const totalMatched = first.totalMatched?.[0]?.count || 0;

  const summary = {
    avgRating: rawSummary ? Math.round((rawSummary.avg || 0) * 10) / 10 : 0,
    totalFeedbacks: rawSummary ? rawSummary.total || 0 : 0,
  };

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rawDistribution) {
    const k = String(r._id);
    if (distribution[k] != null) distribution[k] = r.count;
  }

  const byDoctor = rawByDoctor.map((r) => ({
    doctor_id: r._id,
    doctor_name: r.doctor_name || "Bác sĩ",
    clinic_name: r.clinic_name || "-",
    avgRating: Math.round((r.avg || 0) * 10) / 10,
    totalReviews: r.total || 0,
  }));

  const recent = rawRecent.map((f) => ({
    id: f._id || undefined, // _id không có trong project ở trên; nếu cần, thêm _id:1 trong $project
    rating: f.rating || 0,
    comment: f.comment || "",
    is_annonymous: !!f.is_annonymous,
    patient_name: f.is_annonymous ? "Ẩn danh" : (f.patient_name || "Bệnh nhân"),
    doctor_id: f.doctor_id || null,
    doctor_name: f.doctor_name || "Bác sĩ",
    clinic_name: f.clinic_name || "-",
    createdAt: f.createdAt,
  }));

  return {
    summary,
    distribution,
    byDoctor,
    recent,
    page: Number(page),
    limit: Number(limit),
    total: totalMatched,
  };
};

/* ======================================
 *               DOCTOR
 * ====================================== */

// tạo bác sĩ
exports.createDoctor = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      username,
      password,
      email,
      phone_number,
      full_name,
      clinic_id,
      specialty_id,
    } = payload;

    // Chuẩn hoá & kiểm tra specialty_id: mảng, unique, không rỗng
    const specRaw = Array.isArray(specialty_id) ? specialty_id : [];
    const spec = [...new Set(specRaw.map(String))].filter(Boolean);
    if (spec.length === 0) {
      throw new Error("Phải chọn ít nhất 1 chuyên khoa");
    }

    // Tạo tài khoản
    const hashedPassword = await hashPassword(password);
    const acc = await Account.create(
      [
        {
          username: username?.trim(),
          email: email?.trim(),
          phone_number: phone_number?.trim(),
          password: hashedPassword,
          role: "DOCTOR",
          status: "ACTIVE",
          email_verified: true,
        },
      ],
      { session }
    );

    // Tạo User (liên kết Account)
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

    // Tạo Doctor (liên kết User)
    const doctor = await Doctor.create(
      [
        {
          title: "",
          degree: "",
          description: "",
          experience: "",
          clinic_id,
          specialty_id: spec, // model đã có validator & dedupe pre-save
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

/* ======================================
 *              ASSISTANT
 * ====================================== */

// tạo trợ lý
exports.createAssistant = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      username,
      email,
      phone_number,
      password,
      full_name,
      note,
      type,        // mong đợi: mảng ["NURSE","RECEPTIONIST"]
      roles,       // (dự phòng) nếu FE lỡ gửi roles[]
      doctor_id,
      clinic_id,
    } = payload;

    // Chuẩn hoá & kiểm tra role: gom từ type/roles → unique + sạch + không rỗng
    const roleRaw = [
      ...(Array.isArray(type) ? type : []),
      ...(Array.isArray(roles) ? roles : []),
    ];
    const roleArr = [...new Set(roleRaw.map(String))].filter(Boolean);
    if (roleArr.length === 0) {
      throw new Error("Phải chọn ít nhất 1 vai trò (type)");
    }

    // Tạo tài khoản
    const hashedPassword = await hashPassword(password);
    const acc = await Account.create(
      [
        {
          username: `${username?.trim()}`,
          email: email?.trim(),
          phone_number: phone_number?.trim(),
          password: hashedPassword,
          role: "ASSISTANT",
          status: "ACTIVE",
          email_verified: true,
        },
      ],
      { session }
    );

    // Tạo User (liên kết Account)
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

    // Tạo Assistant (liên kết User)
    const assistant = await Assistant.create(
      [
        {
          note,
          type: roleArr, // model Assistant: mảng enum + validator + dedupe pre-save
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
      message: "Tạo trợ lý thành công",
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

/* ======================================
 *         ASSISTANTS (READ/DELETE)
 * ====================================== */

// Lấy danh sách trợ lý theo clinic
exports.getAssistantsByClinic = async (clinicId) => {
  const data = await Assistant.find({ clinic_id: clinicId })
    .populate({
      path: "user_id",
      select: "full_name avatar_url account_id",
      populate: { path: "account_id", select: "username email phone_number status" },
    })
    .populate({
      path: "doctor_id",
      select: "user_id",
      populate: { path: "user_id", select: "full_name" },
    })
    .populate({
      path: "clinic_id",
      select: "name",
    })
    .lean();

  return { ok: true, data };
};

// Lấy danh sách trợ lý từ tất cả các phòng khám mà admin quản lý
exports.getAssistantsByAdminClinic = async (adminAccountId) => {
  try {
    // Lấy user tương ứng với account id
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) {
      throw new Error("Không tìm thấy user của admin clinic");
    }

    // Tìm bản ghi AdminClinic tương ứng
    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) {
      throw new Error("Không tìm thấy admin clinic");
    }

    // Lấy TẤT CẢ các clinics mà admin clinic này quản lý
    const clinics = await Clinic.find({ created_by: adminClinic._id }).select("_id");
    if (!clinics.length) {
      return { ok: true, data: [] };
    }

    const clinicIds = clinics.map((c) => c._id);

    // Lấy tất cả assistants từ tất cả các clinics
    const data = await Assistant.find({ clinic_id: { $in: clinicIds } })
      .populate({
        path: "user_id",
        populate: { path: "account_id", select: "username phone_number status" },
      })
      .populate({
        path: "doctor_id",
        populate: { path: "user_id", select: "full_name" },
      })
      .populate({
        path: "clinic_id",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    return { ok: true, data };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách trợ lý:", error);
    return { ok: false, message: error.message };
  }
};

// Xoá trợ lý
exports.deleteAssistant = async (assistantId) => {
  const assistant = await Assistant.findById(assistantId);
  if (!assistant) throw new Error("Assistant not found");

  await Assistant.findByIdAndDelete(assistantId);
  // (tuỳ nghiệp vụ) có thể xoá kèm User/Account trong một transaction
  return true;
};

/* ======================================
 *        DOCTOR (DELETE)
 * ====================================== */

// Xoá bác sĩ (bao gồm Doctor, User, Account)
exports.deleteDoctor = async (doctorId, adminAccountId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Kiểm tra bác sĩ có tồn tại không
    const doctor = await Doctor.findById(doctorId).session(session);
    if (!doctor) {
      throw new Error("Bác sĩ không tồn tại");
    }

    // Kiểm tra bác sĩ có thuộc về admin clinic này không
    const user = await User.findOne({ account_id: adminAccountId }).session(session);
    if (!user) {
      throw new Error("Không tìm thấy user của admin clinic");
    }

    const adminClinic = await AdminClinic.findOne({ user_id: user._id }).session(session);
    if (!adminClinic) {
      throw new Error("Không tìm thấy admin clinic");
    }

    // Lấy danh sách clinics của admin
    const clinics = await Clinic.find({ created_by: adminClinic._id }).session(session);
    const clinicIds = clinics.map((c) => c._id.toString());

    // Kiểm tra bác sĩ có thuộc clinic của admin không
    if (!clinicIds.includes(doctor.clinic_id.toString())) {
      throw new Error("Bác sĩ không thuộc quyền quản lý của bạn");
    }

    // Lấy user_id và account_id từ doctor
    const doctorUser = await User.findById(doctor.user_id).session(session);
    if (!doctorUser) {
      throw new Error("Không tìm thấy user của bác sĩ");
    }

    const accountId = doctorUser.account_id;

    // Xóa Doctor
    await Doctor.findByIdAndDelete(doctorId).session(session);

    // Xóa User
    await User.findByIdAndDelete(doctor.user_id).session(session);

    // Xóa Account
    await Account.findByIdAndDelete(accountId).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      ok: true,
      message: "Xóa bác sĩ thành công",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi xóa bác sĩ:", error);
    return {
      ok: false,
      message: error.message || "Không thể xóa bác sĩ",
    };
  }
};

/* ======================================
 *        CLINIC / ADMIN HELPERS
 * ====================================== */

// Lấy clinic mà admin clinic hiện tại quản lý
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

// Lấy danh sách tất cả clinics mà admin clinic hiện tại quản lý
exports.getAllClinicsByAdmin = async (accountId) => {
  try {
    const user = await User.findOne({ account_id: accountId });
    if (!user)
      throw new Error("Không tìm thấy user tương ứng với account này.");

    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic)
      throw new Error("Không tìm thấy admin clinic tương ứng với user này.");

    const clinics = await Clinic.find({
      created_by: adminClinic._id,
    })
      .populate("specialties")
      .sort({ createdAt: -1 })
      .lean();

    return { ok: true, data: clinics };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách clinics của admin:", error);
    return { ok: false, message: error.message };
  }
};

/* ======================================
 *         DOCTORS (READ LIST)
 * ====================================== */

// Lấy danh sách bác sĩ theo clinic mà admin_clinic đang quản lý
exports.getDoctorsByAdminClinic = async (adminAccountId) => {
  try {
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) throw new Error("Không tìm thấy user của admin clinic");

    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) throw new Error("Không tìm thấy admin clinic");

    const clinics = await Clinic.find({ created_by: adminClinic._id });
    if (!clinics.length) return [];

    const clinicIds = clinics.map((c) => c._id);

    const doctors = await Doctor.find({ clinic_id: { $in: clinicIds } })
      .populate({
        path: "user_id",
        // ✅ chỉ include, KHÔNG kèm -__v
        select: "full_name avatar_url account_id",
        populate: {
          path: "account_id",
          model: "Account",
          select: "email phone_number status username", // chỉ include
        },
      })
      .populate({ path: "specialty_id", select: "name" })
      .populate({ path: "clinic_id", select: "name status" })
      .lean();

    return doctors;
  } catch (err) {
    console.error("Lỗi trong getDoctorsByAdminClinic:", err);
    throw err;
  }
};

/* ======================================
 *               LICENSE
 * ====================================== */

// Lấy danh sách chứng chỉ (PENDING) từ tất cả các phòng khám mà admin quản lý
exports.getPendingDoctorLicenses = async (adminAccountId) => {
  try {
    // Lấy user tương ứng với account id
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) {
      throw new Error("Không tìm thấy user của admin clinic");
    }

    // Tìm bản ghi AdminClinic tương ứng
    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) {
      throw new Error("Không tìm thấy admin clinic");
    }

    // Lấy TẤT CẢ các clinics mà admin clinic này quản lý
    const clinics = await Clinic.find({ created_by: adminClinic._id }).select("_id");
    if (!clinics.length) {
      return { ok: true, data: [] };
    }

    const clinicIds = clinics.map((c) => c._id);

    // Lấy tất cả các doctors từ tất cả các clinics
    const doctorsInClinics = await Doctor.find({ clinic_id: { $in: clinicIds } }).select(
      "_id"
    );
    const doctorIds = doctorsInClinics.map((doc) => doc._id);

    if (doctorIds.length === 0) {
      return { ok: true, data: [] };
    }

    // Lấy tất cả licenses PENDING của các doctors này
    const licenses = await License.find({
      doctor_id: { $in: doctorIds },
      status: "PENDING",
    })
      .populate({
        path: "doctor_id",
        select: "user_id title clinic_id",
        populate: [
          {
            path: "user_id",
            select: "full_name avatar_url",
          },
          {
            path: "clinic_id",
            select: "name",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return { ok: true, data: licenses };
  } catch (error) {
    console.error("Lỗi khi lấy chứng chỉ chờ duyệt:", error);
    return { ok: false, message: error.message };
  }
};

// cập nhật trạng thái chứng chỉ
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
    // Lấy user và admin clinic để verify ownership
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) {
      throw new Error("Không tìm thấy user tương ứng với account này.");
    }

    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) {
      throw new Error("Không tìm thấy admin clinic tương ứng với user này.");
    }

    // Nếu có clinic_id trong updateData, verify ownership và update clinic đó
    let clinicId;
    if (updateData.clinic_id) {
      const clinic = await Clinic.findOne({
        _id: updateData.clinic_id,
        created_by: adminClinic._id,
      });
      if (!clinic) {
        throw new Error("Không tìm thấy phòng khám hoặc bạn không có quyền cập nhật phòng khám này.");
      }
      clinicId = updateData.clinic_id;
    } else {
      // Fallback: lấy clinic đầu tiên của admin
      const clinicResult = await exports.getClinicByAdmin(adminAccountId);
      if (!clinicResult.ok) {
        throw new Error(clinicResult.message || "Không tìm thấy phòng khám");
      }
      clinicId = clinicResult.data._id;
    }

    // Chuẩn bị dữ liệu cập nhật (loại bỏ clinic_id vì không phải field của model)
    const { clinic_id, ...updateFieldsData } = updateData;
    const updateFields = {};

    // Các trường cơ bản
    if (updateFieldsData.name !== undefined) updateFields.name = updateFieldsData.name;
    if (updateFieldsData.phone !== undefined) updateFields.phone = updateFieldsData.phone;
    if (updateFieldsData.email !== undefined) updateFields.email = updateFieldsData.email;
    if (updateFieldsData.website !== undefined) updateFields.website = updateFieldsData.website;
    if (updateFieldsData.description !== undefined) updateFields.description = updateFieldsData.description;
    if (updateFieldsData.logo_url !== undefined) updateFields.logo_url = updateFieldsData.logo_url;
    if (updateFieldsData.banner_url !== undefined) updateFields.banner_url = updateFieldsData.banner_url;
    if (updateFieldsData.registration_number !== undefined) updateFields.registration_number = updateFieldsData.registration_number;
    if (updateFieldsData.opening_hours !== undefined) updateFields.opening_hours = updateFieldsData.opening_hours;
    if (updateFieldsData.closing_hours !== undefined) updateFields.closing_hours = updateFieldsData.closing_hours;

    // Cập nhật địa chỉ
    if (updateFieldsData.address) {
      // Lấy clinic hiện tại để merge address
      const currentClinic = await Clinic.findById(clinicId).lean();
      updateFields.address = {
        ...(currentClinic?.address || {}),
        ...updateFieldsData.address,
      };
      // Nếu có province hoặc ward, giữ nguyên format
      if (updateFieldsData.address.province) {
        updateFields.address.province = updateFieldsData.address.province;
      }
      if (updateFieldsData.address.ward) {
        updateFields.address.ward = updateFieldsData.address.ward;
      }
    }

    // Cập nhật chuyên khoa
    if (updateFieldsData.specialties !== undefined) {
      updateFields.specialties = updateFieldsData.specialties;
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
