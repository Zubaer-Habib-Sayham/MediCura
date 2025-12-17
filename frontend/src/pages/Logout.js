import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await axios.post(
                    'http://localhost:5000/api/logout',
                    {},
                    { withCredentials: true }
                );
            } catch (err) {
                console.error("Logout error", err);
            }

            // 🔥 VERY IMPORTANT
            localStorage.clear();

            navigate('/');
        };

        logout();
    }, [navigate]);

    return (
        <main>
            <p>Logging out...</p>
        </main>
    );
}

export default Logout;
