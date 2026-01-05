// index.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const prescriptionRoutes = require('./routes/prescriptions');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/PHR_orders');
const adminOrdersRoutes = require('./routes/adminOrders');
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

// ===== Routes =====
app.use('/api', authRoutes);          // Auth routes
app.use('/admin', adminRoutes);       // Admin routes
app.use('/api/doctor', doctorRoutes); // Doctor routes
app.use('/api', prescriptionRoutes);  // Prescriptions routes
app.use('/api/cart', cartRoutes);     // Pharmacy/cart routes
app.use('/api/patient', patientRoutes); // Patient routes (includes profile picture upload now)
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminOrdersRoutes);

// ===== Error handling =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
