import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <>
        <header><h1>MediCura</h1></header>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/logout">Logout</Link>
        </nav>
        <main>
            <div>
                <h2>Welcome to MediCura</h2>
                <p>Minimalistic hospital system</p>
            </div>
        </main>
        <footer>&copy; 2025 MediCura</footer>
        </>
    );
}

export default Home;
