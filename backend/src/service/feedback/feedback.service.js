// services/feedbackService.js
const mongoose = require("mongoose");
const Feedback = require("../../model/patient/Feedback");

/**
 * Lấy danh sách feedback của 1 bác sĩ, có:
 * - pagination (page, limit)
 * - sort (vd: "-createdAt" hoặc "rating")
 * - filter: q (search comment), minRating, maxRating, isAnonymous, from, to (createdAt range)
 * - summary: avgRating + breakdown 1..5
 *
 * @param {ObjectId|String} doctorId
 * @param {Object} options query options (optional)
 */
exports.getAllFeedbackByDoctor = async (doctorId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    q,                 // search theo comment
    minRating,         // >=
    maxRating,         // <=
    isAnonymous,       // true/false
    from,              // ISO date
    to,                // ISO date
  } = options;

  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

  // ----- match cơ bản -----
  const match = { doctor_id: doctorObjectId };

  // search comment
  if (q && String(q).trim()) {
    match.comment = { $regex: String(q).trim(), $options: "i" };
  }

  // rating range
  if (minRating != null || maxRating != null) {
    match.rating = {};
    if (minRating != null) match.rating.$gte = Number(minRating);
    if (maxRating != null) match.rating.$lte = Number(maxRating);
  }

  // filter anonymous: coalesce schema cũ `is_annonymous` và mới `is_anonymous`
  if (typeof isAnonymous !== "undefined") {
    const boolVal = isAnonymous === true || isAnonymous === "true";
    // dùng $expr để đánh giá dựa trên coalesce
    match.$expr = {
      $eq: [
        { $ifNull: [{ $ifNull: ["$is_anonymous", "$is_annonymous"] }, false] },
        boolVal,
      ],
    };
  }

  // date range theo createdAt
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  // ----- sort object -----
  const sortObj = {};
  if (typeof sort === "string" && sort.length) {
    const field = sort.startsWith("-") ? sort.slice(1) : sort;
    const direction = sort.startsWith("-") ? -1 : 1;
    sortObj[field] = direction;
  } else {
    sortObj.createdAt = -1;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
  const skipNum = (pageNum - 1) * limitNum;

  // ----- aggregate -----
  const pipeline = [
    { $match: match },

    {
      $facet: {
        meta: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgRating: { $avg: "$rating" },
              r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
              r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
              r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
              r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
              r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            },
          },
        ],

        items: [
          { $sort: sortObj },
          { $skip: skipNum },
          { $limit: limitNum },

          // join Patient
          {
            $lookup: {
              from: "patients",
              localField: "patient_id",
              foreignField: "_id",
              as: "patient",
            },
          },
          { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },

          // join User để lấy tên/avatar
          {
            $lookup: {
              from: "users",
              localField: "patient.user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

          {
            $project: {
              rating: 1,
              comment: 1,
              createdAt: 1,
              doctor_id: 1,
              patient_id: 1,
              // hỗ trợ cả 2 field anonymous
              anonymous: {
                $ifNull: [{ $ifNull: ["$is_anonymous", "$is_annonymous"] }, false],
              },
              patient: {
                _id: "$patient._id",
                user_id: "$patient.user_id",
              },
              patient_name: "$user.full_name",
              patient_avatar: "$user.avatar_url",
            },
          },
        ],
      },
    },
  ];

  const [agg] = await Feedback.aggregate(pipeline);
  const meta = agg?.meta?.[0] || {
    total: 0,
    avgRating: null,
    r1: 0,
    r2: 0,
    r3: 0,
    r4: 0,
    r5: 0,
  };

  const total = meta.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limitNum));

  return {
    items: agg?.items || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    summary: {
      avgRating: meta.avgRating ? Number(meta.avgRating.toFixed(2)) : 0,
      countsByRating: {
        1: meta.r1 || 0,
        2: meta.r2 || 0,
        3: meta.r3 || 0,
        4: meta.r4 || 0,
        5: meta.r5 || 0,
      },
    },
  };
};
