const feedbackService = require("../../service/patient/feedback.service");

/**
 * Tạo feedback mới
 */
async function createFeedback(req, res) {
    try {
        const accountId = req.user?.sub;
        if (!accountId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { doctorId, rating, comment, isAnonymous } = req.body;

        // Validation
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId is required" });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "rating must be between 1 and 5" });
        }
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: "comment is required" });
        }

        const feedback = await feedbackService.createFeedback(accountId, {
            doctorId,
            rating: parseInt(rating),
            comment: comment.trim(),
            isAnonymous: isAnonymous || false
        });

        // Populate để trả về thông tin đầy đủ
        await feedback.populate({
            path: "patient_id",
            select: "patient_code user_id",
            populate: {
                path: "user_id",
                select: "full_name avatar_url"
            }
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: feedback
        });
    } catch (error) {
        console.error("createFeedback error:", error);
        const message = error.message || "Server error";
        
        if (message.includes("not found")) {
            return res.status(404).json({ success: false, message });
        }
        if (message.includes("already submitted")) {
            return res.status(409).json({ success: false, message });
        }
        
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

/**
 * Lấy danh sách feedback của một doctor
 */
async function getFeedbacksByDoctorId(req, res) {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId is required" });
        }

        const result = await feedbackService.getFeedbacksByDoctorId(doctorId, page, limit);

        return res.json({
            success: true,
            data: result.feedbacks,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("getFeedbacksByDoctorId error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

/**
 * Lấy rating trung bình của doctor
 */
async function getDoctorRating(req, res) {
    try {
        const { doctorId } = req.params;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId is required" });
        }

        const rating = await feedbackService.getDoctorRating(doctorId);

        return res.json({
            success: true,
            data: rating
        });
    } catch (error) {
        console.error("getDoctorRating error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

/**
 * Xóa feedback
 */
async function deleteFeedback(req, res) {
    try {
        const accountId = req.user?.sub;
        if (!accountId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { feedbackId } = req.params;

        if (!feedbackId) {
            return res.status(400).json({ success: false, message: "feedbackId is required" });
        }

        await feedbackService.deleteFeedback(accountId, feedbackId);

        return res.json({
            success: true,
            message: "Feedback deleted successfully"
        });
    } catch (error) {
        console.error("deleteFeedback error:", error);
        const message = error.message || "Server error";
        
        if (message.includes("not found") || message.includes("permission")) {
            return res.status(404).json({ success: false, message });
        }
        
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = {
    createFeedback,
    getFeedbacksByDoctorId,
    getDoctorRating,
    deleteFeedback
};

