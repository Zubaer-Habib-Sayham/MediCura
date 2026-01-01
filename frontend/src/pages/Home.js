
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';

function Home() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <main>Loading...</main>;

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

                            <p className='hero-content'>
                                Manage doctors, patients, appointments, and pharmacy operations
                                in one streamlined place.
                            </p>

                            <p className='hero-content'>Please Log In or Sign Up to continue.</p>

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
                <Link to="/doctor/prescriptions"> Prescription</Link>
                <Link to="/doctor/dashboard">Dashboard</Link>
                <Link to="#">Online Consultation</Link>
                <Link to="/logout">Log Out</Link>
            </nav>

            <section className = "hero">
                    <div className = "hero-content">
                        <span>Welcome, Dr. {user.username}</span>
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
                <Link to="/patient/pharmacy">Pharmacy</Link>
                <Link to="/patient/cart">My Cart</Link>
                <Link to="#">Book Room</Link>
                <Link to="#">Dashboard</Link>
                <Link to="/logout">Log Out</Link>
            </nav>
            <section className = "hero">
                    <div className = "hero-content">
                        <span>Welcome, {user.username}</span>
                    </div>
            </section>
            <main>
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
                <Link to="/logout">Log Out</Link>
            </nav>
            <section className = "hero">
                    <div className = "hero-content">
                        <span>Welcome, Admin {user.username}</span>
                    </div>
            </section>
            <main>
                <section className="features">
                    <Link to = "/admin/doctors">
                        <div className="feature-card">
                            <h3>🩺 Doctors</h3>
                        </div>
                    </Link>
                    
                    <Link to = "/admin/patients">
                        <div className="feature-card">
                            <h3>👤 Patients</h3>
                        </div>
                    </Link>

                    <Link to = "/admin/medicines">
                        <div className="feature-card">
                            <h3>💊 Pharmacy Inventory</h3>
                        </div>
                    </Link>
                    <Link to = "/admin/rooms">
                        <div className="feature-card">
                            <h3>🏠 Rooms</h3>
                        </div>
                    </Link>
                    <Link to = "#">
                        <div className="feature-card">
                            <h3>📊 Stats</h3>
                        </div>
                    </Link>
                </section>

            </main>
        </>
    );
}

export default Home;
