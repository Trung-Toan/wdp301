const mongoose = require('mongoose');
const { createAsync } = require('./src/service/appointment/book.service');

// Test data
const testPayload = {
    slot_id: "507f1f77bcf86cd799439011", // Thay bằng slot_id thực tế
    doctor_id: "507f1f77bcf86cd799439012", // Thay bằng doctor_id thực tế  
    patient_id: "507f1f77bcf86cd799439013", // Thay bằng patient_id thực tế
    specialty_id: "507f1f77bcf86cd799439014", // Thay bằng specialty_id thực tế
    clinic_id: "507f1f77bcf86cd799439015", // Thay bằng clinic_id thực tế
    full_name: "Nguyễn Văn Test",
    phone: "0987654321",
    email: "test@example.com",
    dob: "1990-01-01",
    gender: "MALE",
    province_code: "01",
    ward_code: "00004",
    address_text: "Số 123, Đường ABC",
    reason: "Khám sức khỏe định kỳ"
};

async function testBooking() {
    try {
        console.log('🧪 Testing appointment booking...');

        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wdp301');
        console.log('✅ Connected to database');

        // Test booking
        const result = await createAsync(testPayload);
        console.log('✅ Booking successful:', result);

    } catch (error) {
        console.error('❌ Booking failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Chạy test
testBooking();
