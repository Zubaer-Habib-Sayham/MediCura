import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <>
        <nav>
            <div class="logo">MediCura</div>
            {/* <Link to="/">Home</Link> */}
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/logout">Logout</Link>
        </nav>
        <main>
            <div>
                <section className="hero">
                    <div className="hero-content">

                        <h1>Welcome to MediCura</h1>

                        <p>
                            Manage doctors, patients, appointments, and pharmacy operations
                            in one streamlined place.
                        </p>
                        <p>
                            Please Log In or Sign Up to continue.
                        </p>
                        <div>
                            <button><Link to="/login">Login</Link></button>
                            <button><Link to="/signup">Sign Up</Link></button>
                        </div>
                    </div>
                </section>

            </div>
        </main>
        <footer>&copy; 2025 MediCura</footer>
        </>
    );
}

export default Home;
