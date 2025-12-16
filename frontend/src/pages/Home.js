import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <>
        <nav>
            <div class="logo">MediCura</div>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/logout">Logout</Link>
        </nav>
        <main>
            <div>
                <h3>Welcome to MediCura</h3>
                <h3>Please <Link to="/login">Login</Link> to continue.</h3>
            </div>
        </main>
        <footer>&copy; 2025 MediCura</footer>
        </>
    );
}

export default Home;
