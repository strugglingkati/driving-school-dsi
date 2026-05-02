require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/db');
const { initDatabase } = require('./utils/dbInit');

// استيراد المسارات
const candidateRoutes = require('./routes/candidateRoutes');
const appointmentRoutes = require('./routes/appointments'); // تأكد من الاسم هنا
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// اختبار قاعدة البيانات
db.getConnection()
    .then(connection => {
        console.log('✅ Connected to phpMyAdmin Successfully!');
        connection.release();
        initDatabase(); // Initialize tables
    })
    .catch(err => console.error('❌ Connection Failed:', err.message));
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes); // لاحظ حرف s في candidates
app.use('/api/appointments', appointmentRoutes); 

app.get('/', (req, res) => {
    res.json({ message: "🚀 Backend is Running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Server started on: http://localhost:${PORT}`);
    console.log(`🔗 API Appointments Ready at: http://localhost:${PORT}/api/appointments/all`);
});