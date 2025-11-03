const svc = require("../../service/appointment/book.service");

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, err, status = 500) =>
    res.status(status).json({ success: false, error: err?.message || String(err) });

/**
 * Controller để tạo appointment booking tại phòng khám
 * Hỗ trợ auto-assign doctor và slot nếu auto_assign = true
 */
exports.createClinicBooking = async (req, res) => {
    try {
        const result = await svc.clinicBookingAsync(req.body);
        return ok(res, result, 201);
    } catch (err) {
        const msg = String(err?.message || err);

        if (/Missing required fields|Invalid .*_id|Invalid scheduled_date format|doctor_id is required|slot_id is required/i.test(msg)) {
            return fail(res, err, 400);
        }

        if (/Không tìm thấy bác sĩ|No doctors found|No available doctors/i.test(msg)) {
            return fail(res, err, 404);
        }

        if (/Slot is full|Slot is unavailable|Slot not found|Patient not found/i.test(msg)) {
            return fail(res, err, 400);
        }

        if (/duplicate key|Duplicate booking|E11000/i.test(msg)) {
            return fail(res, new Error("Duplicate booking for this slot"), 409);
        }

        if (/connection|timeout|network/i.test(msg)) {
            return fail(res, new Error("Service temporarily unavailable"), 503);
        }

        console.error('Clinic booking creation error:', err);
        return fail(res, new Error("Internal server error"), 500);
    }
};
