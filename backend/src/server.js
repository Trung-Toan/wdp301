require('dotenv').config();
require('./model')
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./router/auth/auth.routes');
const locationRoutes = require('./router/address/location.routes');
const clinicRoutes = require('./router/clinic/clinic.route');
const clinicRegistrationRoutes = require('./router/clinic/clinicRegistration.routes');
const appointmentRoutes = require('./router/appointment/appointment.route');
const patientRoutes = require('./router/patient/patient.routes');
const medicalRecordRoutes = require('./router/patient/medicalRecord.routes');
const userRoutes = require('./router/user/user.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();


app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: { persistAuthorization: true },
}));

app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/doctor', require('./router/doctor/doctor.routes'));
app.use('/api/assistant', require('./router/assistance/assistance.routes'));
app.use('/api/locations', locationRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/clinic-registration', clinicRegistrationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/patient', medicalRecordRoutes);
app.use('/api/user', userRoutes);

app.get('/', (_req, res) => res.json({ message: 'Welcome to WDP301!' }));

const PORT = process.env.PORT || 5000;
(async () => {
  const ok = await connectDB();
  if (!ok) {
    console.error('⚠️ DB chưa kết nối — vẫn start server để xem Swagger.');
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger UI → http://localhost:${PORT}/docs`);
  });
})();
