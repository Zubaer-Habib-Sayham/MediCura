import React, { useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Logout() {
    const navigate = useNavigate();
    const { logoutLocally } = useContext(AuthContext);

    useEffect(() => {
        const logout = async () => {
            try {
                await api.post('/logout'); // uses cookie
            } catch (err) {
                console.error("Logout error", err);
            }

            // Update AuthContext
            logoutLocally();

            navigate('/'); // redirect to login page
        };

        logout();
    }, [navigate, logoutLocally]);

    return (
        <main>
            <p>Logging out...</p>
        </main>
    );
}

export default Logout;
