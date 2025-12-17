import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const user = JSON.parse(localStorage.getItem("user"));

    // ---------- NOT LOGGED IN (PUBLIC LANDING PAGE) ----------
    if (!user) {
        return (
            <>
                <nav>
                    <div className="logo">MediCura</div>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Sign Up</Link>
                </nav>

                <main>
                    <section className="hero">
                        <div className="hero-content">
                            <h1>Welcome to MediCura</h1>

                            <p>
                                Manage doctors, patients, appointments, and pharmacy operations
                                in one streamlined place.
                            </p>

                            <p>Please Log In or Sign Up to continue.</p>

                            <div>
                                <Link to="/login">Login</Link>
                                <Link to="/signup">Sign Up</Link>
                            </div>
                        </div>
                    </section>
                </main>

                <footer>&copy; 2025 MediCura</footer>
            </>
        );
    }

    // ---------- ROLE BASED UI ----------
    if (user.role === "Doctor") return <DoctorHome user={user} />;
    if (user.role === "Patient") return <PatientHome user={user} />;
    if (user.role === "Admin") return <AdminHome user={user} />;

    return <div>Unauthorized</div>;
}

/* ================= DOCTOR ================= */
function DoctorHome({ user }) {
    return (
        <>
            <nav>
                <div className="logo">MediCura</div>
                <Link to="#">Appointment</Link>
                <Link to="#">Dashboard</Link>
                <Link to="#">Online Consultation</Link>
                <Link to="/logout">Log Out</Link>
            </nav>

            <section className = "hero">
                    <div className = "hero-content">
                        <h2>Welcome, Dr. {user.username}</h2>
                    </div>
            </section>
        </>
    );
}

/* ================= PATIENT ================= */
function PatientHome({ user }) {
    return (
        <>
            <nav>
                <div className="logo">MediCura</div>
                <Link to="#">Book Appointment</Link>
                <Link to="#">Pharmacy</Link>
                <Link to="#">Book Room</Link>
                <Link to="#">Dashboard</Link>
                <Link to="/logout">Log Out</Link>
            </nav>

            <main>
                
                <section className = "hero">
                    <div className = "hero-content">
                        <h2>Welcome, {user.username}</h2>
                    </div>
                </section>
            </main>
        </>
    );
}

/* ================= ADMIN ================= */
function AdminHome({ user }) {
    return (
        <>
            <nav>
                <div className="logo">MediCura</div>
                <Link to="#">Room</Link>
                <Link to="#">Inventory</Link>
                <Link to="#">Stats</Link>
                <Link to="/logout">Log Out</Link>
            </nav>

            <main>
                <section className = "hero">
                    <div className = "hero-content">
                        <h2>Welcome, Admin {user.username}</h2>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Home;
