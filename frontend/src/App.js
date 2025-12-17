import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Logout from './pages/Logout';
import './styles.css';
import Doctors from "./pages/admin/Doctors";
import Patients from "./pages/admin/Patients";
import Medicines from "./pages/admin/Medicines";
import Rooms from "./pages/admin/Rooms";
import AddMedicineForm from "./pages/admin/AddMedicineForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/medicines/add" element={<AddMedicineForm />}/>
        <Route path="/admin/doctors" element={<Doctors />} />
        <Route path="/admin/patients" element={<Patients />} />
        <Route path="/admin/medicines" element={<Medicines />} />
        <Route path="/admin/rooms" element={<Rooms />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
