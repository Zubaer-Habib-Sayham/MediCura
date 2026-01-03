import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Logout from './pages/Logout';
import Doctors from "./pages/admin/Doctors";
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import Patients from "./pages/admin/Patients";
import Medicines from "./pages/admin/Medicines";
import Rooms from "./pages/admin/Rooms";
import AddMedicineForm from "./pages/admin/AddMedicineForm";
import './styles.css';
import Pharmacy from './pages/patient/Pharmacy';
import Cart from './pages/patient/Cart';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorSelection from './pages/patient/DoctorSelection';
import BookAppointment from './pages/patient/BookAppointment';
import Appointments from './pages/patient/Appointments';
import Payment from './pages/patient/Payment';
import PaymentSuccess from './pages/patient/PaymentSuccess';
import PaymentFailed from './pages/patient/PaymentFailed';
import MedicalHistory from './pages/patient/MedicalHistory';

function App() {
    const { user, loading } = useContext(AuthContext);

    // Protected Route wrapper
    const ProtectedRoute = ({ children }) => {
        if (loading) return <div>Loading...</div>;
        return user ? children : <Navigate to="/login" />;
    };

    return (
        <Routes>
            {/* Patient routes */}
            <Route path="/patient/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
            <Route path="/patient/doctors" element={<ProtectedRoute><DoctorSelection /></ProtectedRoute>} />
            <Route path="/patient/book-appointment/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/patient/payment/:appointmentId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/patient/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/patient/payment-failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
            <Route path="/patient/medical-history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
            <Route path="/patient/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
            <Route path="/patient/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/medicines/add" element={<ProtectedRoute><AddMedicineForm /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/admin/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
            <Route path="/admin/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />

            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute><DoctorPrescriptions /></ProtectedRoute>} />

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}

export default App;
