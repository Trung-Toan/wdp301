const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Validation rules cho appointment booking
const validateAppointmentBooking = [

    // Required fields
    body('slot_id')
        .notEmpty()
        .withMessage('slot_id is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid slot_id format');
            }
            return true;
        }),


    body('doctor_id')
        .notEmpty()
        .withMessage('doctor_id is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid doctor_id format');
            }
            return true;
        }),


    body('patient_id')
        .notEmpty()
        .withMessage('patient_id is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid patient_id format');
            }
            return true;
        }),


    body('specialty_id')
        .notEmpty()
        .withMessage('specialty_id is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid specialty_id format');
            }
            return true;
        }),


    // Optional clinic_id
    body('clinic_id')
        .optional()
        .custom((value) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid clinic_id format');
            }
            return true;
        }),


    // Personal information
    body('full_name')
        .notEmpty()
        .withMessage('full_name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('full_name must be between 2 and 100 characters')
        .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
        .withMessage('full_name can only contain letters and spaces'),

    body('phone')
        .notEmpty()
        .withMessage('phone is required')
        .matches(/^[0-9]{10,11}$/)
        .withMessage('phone must be 10-11 digits'),

    body('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),


    // Optional fields
    body('dob')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format for dob'),

    body('gender')
        .optional()
        .isIn(['MALE', 'FEMALE', 'OTHER'])
        .withMessage('gender must be MALE, FEMALE, or OTHER'),

    body('province_code')
        .optional()
        .isLength({ min: 2, max: 3 })
        .withMessage('province_code must be 2-3 characters'),

    body('ward_code')
        .optional()
        .isLength({ min: 5, max: 6 })
        .withMessage('ward_code must be 5-6 characters'),

    body('address_text')
        .optional()
        .isLength({ max: 200 })
        .withMessage('address_text must not exceed 200 characters'),

    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('reason must not exceed 500 characters'),


    // Middleware để xử lý validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateAppointmentBooking
};
