const svc = require("../../service/appointment/book.service");
const mongoose = require("mongoose");
const { Types } = mongoose;

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, err, status = 500) =>
    res.status(status).json({ success: false, error: err?.message || String(err) });

exports.create = async (req, res) => {
    try {
        const result = await svc.createAsync(req.body);
        return ok(res, result, 201);
    } catch (err) {
        const msg = String(err?.message || err);

        // Business logic errors (400)
        if (/Slot is full|Slot is unavailable|Slot not found|Patient not found|Missing required fields|Invalid .*_id/i.test(msg)) {
            return fail(res, err, 400);
        }

        // Duplicate booking error (409)
        if (/duplicate key|Duplicate booking|E11000/i.test(msg)) {
            console.log('🔍 Original error message:', msg);
            console.log('🔍 Error stack:', err.stack);
            console.log('🔍 Full error object:', JSON.stringify(err, null, 2));
            return fail(res, new Error("Duplicate booking for this slot"), 409);
        }

        // Database connection errors (503)
        if (/connection|timeout|network/i.test(msg)) {
            return fail(res, new Error("Service temporarily unavailable"), 503);
        }

        // Default server error (500)
        console.error('Appointment creation error:', err);
        return fail(res, new Error("Internal server error"), 500);
    }
};

exports.getById = async (req, res) => {
    try {
        const result = await svc.getByIdAsync(req.params.id);
        return ok(res, result);
    } catch (err) {
        return fail(res, err, 404);
    }
};

exports.getByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return fail(res, new Error("Invalid patientId ObjectId."), 400);
        }

        const { status, page, limit } = req.query;

        const result = await svc.getAppointmentsByPatient(patientId, {
            status,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });

        return ok(res, result);
    } catch (err) {
        return fail(res, err);
    }
};

/**
 * Controller để lấy slots available của bác sĩ trong ngày
 * GET /api/appointments/doctors/:doctorId/slots/available
 */
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return fail(res, new Error("Invalid doctorId ObjectId."), 400);
        }

        if (!date) {
            return fail(res, new Error("Date parameter is required"), 400);
        }

        const targetDate = new Date(date);
        const slots = await svc.getAvailableSlotsForDoctor(doctorId, targetDate);

        return ok(res, slots);
    } catch (err) {
        return fail(res, err);
    }
};

/**
 * Controller để kiểm tra slot availability
 * GET /api/appointments/slots/:slotId/check-availability
 */
exports.checkSlotAvailability = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { scheduledDate, patientId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(slotId)) {
            return fail(res, new Error("Invalid slotId ObjectId."), 400);
        }

        if (!scheduledDate) {
            return fail(res, new Error("scheduledDate parameter is required"), 400);
        }

        const result = await svc.checkSlotAvailability(slotId, new Date(scheduledDate));

        // Kiểm tra bệnh nhân đã có lịch trong slot này chưa
        if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
            const Appointment = require("../../model/appointment/Appointment");
            const existingAppointment = await Appointment.findOne({
                slot_id: new mongoose.Types.ObjectId(slotId),
                patient_id: new mongoose.Types.ObjectId(patientId),
                scheduled_date: {
                    $gte: new Date(scheduledDate).setHours(0, 0, 0, 0),
                    $lte: new Date(scheduledDate).setHours(23, 59, 59, 999)
                },
                status: { $in: ["SCHEDULED", "COMPLETED"] }
            });

            if (existingAppointment) {
                result.isAvailable = false;
                result.reason = "Patient already has an appointment in this slot";
            }
        }

        return ok(res, {
            canBook: result.isAvailable,
            reason: result.reason,
            bookedCount: result.bookedCount,
            maxPatients: result.maxPatients,
            remainingSlots: result.remainingSlots
        });
    } catch (err) {
        return fail(res, err);
    }
};