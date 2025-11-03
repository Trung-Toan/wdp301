const mongoose = require("mongoose");
const Feedback = require("../../model/patient/Feedback");
const Patient = require("../../model/patient/Patient");
const userService = require("../user/user.service");

/**
 * Tạo feedback mới
 */
exports.createFeedback = async (accountId, { doctorId, rating, comment, isAnonymous = false }) => {
    try {
        // Tìm patient từ accountId
        const patient = await Patient.findOne({ user_id: (await userService.findUserByAccountId(accountId))?._id });
        if (!patient) {
            throw new Error("Patient not found");
        }

        // Kiểm tra xem đã có feedback chưa (tùy chọn - có thể cho phép nhiều feedback)
        // const existingFeedback = await Feedback.findOne({ 
        //     patient_id: patient._id, 
        //     doctor_id: doctorId 
        // });
        // if (existingFeedback) {
        //     throw new Error("You have already submitted feedback for this doctor");
        // }

        // Tạo feedback mới
        const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId) 
            ? new mongoose.Types.ObjectId(doctorId) 
            : doctorId;
        
        const feedback = new Feedback({
            rating,
            comment,
            is_annonymous: isAnonymous,
            patient_id: patient._id,
            doctor_id: doctorObjectId
        });

        await feedback.save();
        return feedback;
    } catch (error) {
        console.error("Error creating feedback:", error);
        throw error;
    }
};

/**
 * Lấy danh sách feedback của một doctor
 */
exports.getFeedbacksByDoctorId = async (doctorId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId) 
            ? new mongoose.Types.ObjectId(doctorId) 
            : doctorId;
        
        const feedbacks = await Feedback.find({ doctor_id: doctorObjectId })
            .populate({
                path: "patient_id",
                select: "patient_code user_id",
                populate: {
                    path: "user_id",
                    select: "full_name avatar_url"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Feedback.countDocuments({ doctor_id: doctorObjectId });

        return {
            feedbacks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error getting feedbacks:", error);
        throw error;
    }
};

/**
 * Lấy rating trung bình và tổng số feedback của doctor
 */
exports.getDoctorRating = async (doctorId) => {
    try {
        const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId) 
            ? new mongoose.Types.ObjectId(doctorId) 
            : doctorId;
        const stats = await Feedback.aggregate([
            { $match: { doctor_id: doctorObjectId } },
            {
                $group: {
                    _id: null,
                    average: { $avg: "$rating" },
                    total: { $sum: 1 },
                    ratings: { $push: "$rating" }
                }
            }
        ]);

        if (stats.length === 0) {
            return {
                average: 0,
                total: 0
            };
        }

        return {
            average: Math.round(stats[0].average * 10) / 10, // Làm tròn 1 chữ số thập phân
            total: stats[0].total
        };
    } catch (error) {
        console.error("Error getting doctor rating:", error);
        throw error;
    }
};

/**
 * Xóa feedback (chỉ cho phép patient xóa feedback của chính mình)
 */
exports.deleteFeedback = async (accountId, feedbackId) => {
    try {
        const patient = await Patient.findOne({ user_id: (await userService.findUserByAccountId(accountId))?._id });
        if (!patient) {
            throw new Error("Patient not found");
        }

        const feedback = await Feedback.findOne({ _id: feedbackId, patient_id: patient._id });
        if (!feedback) {
            throw new Error("Feedback not found or you don't have permission to delete it");
        }

        await Feedback.findByIdAndDelete(feedbackId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting feedback:", error);
        throw error;
    }
};

