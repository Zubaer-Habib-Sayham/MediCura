import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function PatientNav() {
    const { user, logoutLocally } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="patient-nav">
            <div className="nav-container">
                <div className="nav-brand">
                    <h2>MediCura</h2>
                </div>

                <ul className="nav-links">
                    <li className={isActive('/patient/dashboard') ? 'active' : ''}>
                        <Link to="/patient/dashboard">Dashboard</Link>
                    </li>
                    <li className={isActive('/patient/profile') ? 'active' : ''}>
                        <Link to="/patient/profile">Profile</Link>
                    </li>
                    <li className={isActive('/patient/doctors') ? 'active' : ''}>
                        <Link to="/patient/doctors">Find Doctors</Link>
                    </li>
                    <li className={isActive('/patient/appointments') ? 'active' : ''}>
                        <Link to="/patient/appointments">Appointments</Link>
                    </li>
                    <li className={isActive('/patient/prescriptions') ? 'active' : ''}>
                        <Link to="/patient/prescriptions">Prescriptions</Link>
                    </li>
                    <li className={isActive('/patient/medical-history') ? 'active' : ''}>
                        <Link to="/patient/medical-history">Medical History</Link>
                    </li>
                    <li className={isActive('/patient/pharmacy') ? 'active' : ''}>
                        <Link to="/patient/pharmacy">Pharmacy</Link>
                    </li>
                    
                </ul>

                <div className="nav-user">
                    <Link to="/logout" className="btn-logout">Logout</Link>
                </div>
            </div>
        </nav>
    );
}

export default PatientNav;
