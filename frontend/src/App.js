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
import PatientPrescriptions from './pages/doctor/PatientPrescriptions';
import Patients from "./pages/admin/Patients";
import Medicines from "./pages/admin/Medicines";
import Rooms from "./pages/admin/Rooms";
import AddMedicineForm from "./pages/admin/AddMedicineForm";
import './styles.css';
import Pharmacy from './pages/patient/Pharmacy';
import Cart from './pages/patient/Cart';

function App() {
    const { user, loading } = useContext(AuthContext);

    // Protected Route wrapper
    const ProtectedRoute = ({ children }) => {
        if (loading) return <div>Loading...</div>;
        return user ? children : <Navigate to="/login" />;
    };

    return (
        <Routes>
            {/* Pharmacy routes */}
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

            {/* Patient routes */}
            <Route path="/patient/prescriptions" element={<ProtectedRoute><PatientPrescriptions /></ProtectedRoute>} />

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}

export default App;
