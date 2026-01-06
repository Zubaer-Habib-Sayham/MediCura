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
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import PatientConsultation from './pages/doctor/PatientConsultation';
import Patients from "./pages/admin/Patients";
import Medicines from "./pages/admin/Medicines";
import Rooms from "./pages/admin/Rooms";
import AddMedicineForm from "./pages/admin/AddMedicineForm";
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import AdminSales from './pages/admin/AdminSales';
import './styles.css';
import Pharmacy from './pages/patient/Pharmacy';
import Cart from './pages/patient/Cart';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorSelection from './pages/patient/DoctorSelection';
import BookAppointment from './pages/patient/BookAppointment';
import Appointments from './pages/patient/Appointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import Payment from './pages/patient/Payment';
import PaymentSuccess from './pages/patient/PaymentSuccess';
import PaymentFailed from './pages/patient/PaymentFailed';
import MedicalHistory from './pages/patient/MedicalHistory';
import Checkout from './pages/patient/Checkout';
import PHR_OrderHistory from './pages/patient/PHR_OrderHistory';
import HealthCalculators from './pages/patient/HealthcareCalculators';
import BMICalculator from './pages/patient/HealthcareCalculators/BMICalculator';
import WaterIntake from './pages/patient/HealthcareCalculators/WaterIntake';
import CalorieIntake from './pages/patient/HealthcareCalculators/CalorieIntake';
import RoomBooking from "./pages/patient/RoomBooking";
import MyRooms from './pages/patient/MyRooms';

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
            <Route path="/patient/prescriptions" element={<ProtectedRoute><PatientPrescriptions /></ProtectedRoute>} />
            <Route path="/patient/consultation" element={<ProtectedRoute><PatientConsultation /></ProtectedRoute>} />
            <Route path="/patient/consultation/:doctorId" element={<ProtectedRoute><PatientConsultation /></ProtectedRoute>} />
            
            {/* Pharmacy routes */}
            <Route path="/patient/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
            <Route path="/patient/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/patient/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/patient/orders" element={<ProtectedRoute><PHR_OrderHistory /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/medicines/add" element={<ProtectedRoute><AddMedicineForm /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/admin/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
            <Route path="/admin/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrderManagement /></ProtectedRoute>} />
            <Route path="/admin/sales" element={<ProtectedRoute><AdminSales /></ProtectedRoute>} />
            <Route path="/patient/healthcare-calculators" element={<ProtectedRoute><HealthCalculators /></ProtectedRoute>} />
            <Route path="/patient/healthcare-calculators/bmi" element={<ProtectedRoute><BMICalculator /></ProtectedRoute>} />
            <Route path="/patient/healthcare-calculators/water" element={<ProtectedRoute><WaterIntake /></ProtectedRoute>} />
            <Route path="/patient/healthcare-calculators/calorie" element={<ProtectedRoute><CalorieIntake /></ProtectedRoute>} />
            <Route path="/patient/rooms" element={<ProtectedRoute><RoomBooking /></ProtectedRoute>}/>
            <Route path="/patient/my-rooms" element={<ProtectedRoute><MyRooms /></ProtectedRoute>}/>
            
            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute><DoctorPrescriptions /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/consultations" element={<ProtectedRoute><DoctorConsultations /></ProtectedRoute>} />

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}

export default App;
