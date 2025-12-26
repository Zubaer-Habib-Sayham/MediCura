import React, { useState, useContext } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            if (res.data.success) {
                setUser(res.data.user); // update AuthContext
                alert('Login successful!');
                
                // Redirect based on role
                if (res.data.user.role === 'Doctor') navigate('/doctor/dashboard');
                else if (res.data.user.role === 'Admin') navigate('/admin/doctors'); // or another admin page
                else navigate('/'); // patient or general user
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Login failed! Please try again.');
        }
    };

    return (
        <main>
            <div className="form-container auth">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
        </main>
    );
}

export default Login;
