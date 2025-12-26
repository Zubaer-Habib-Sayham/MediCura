
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');
const prescriptionRoutes = require('./routes/prescriptions');
const db = require('./db')
const app = express();


// Allow frontend to communicate with backend
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ===== Test route =====
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ===== Auth routes =====
app.use('/api', authRoutes);

// ===== Admin routes =====
app.use("/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use('/api', prescriptionRoutes);


// Start server
app.listen(5000, () => console.log('Backend running on port 5000'));
