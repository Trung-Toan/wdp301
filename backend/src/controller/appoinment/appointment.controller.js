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