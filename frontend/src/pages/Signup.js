import React,{useState} from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup(){
    const [username,setUsername]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [gender,setGender]=useState('Male');
    const [dateOfBirth,setDateOfBirth]=useState('');
    const [age,setAge]=useState('');
    const [address,setAddress]=useState('');
    const [contactNo,setContactNo]=useState('');
    const [role,setRole]=useState('Patient');
    const navigate=useNavigate();

    const handleSignup=async(e)=>{
        e.preventDefault();
        try{
            const res=await axios.post('http://localhost:5000/api/signup',{
                username,
                email,
                password,
                gender,
                date_of_birth: dateOfBirth,
                age,
                address,
                contact_no: contactNo,
                role
            });
            if(res.data.success){ alert('Signup successful'); navigate('/login'); }
            else alert(res.data.message);
        }catch(err){ alert('Signup failed'); }
    }

    return(
        <main>
        <div className="form-container auth">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
                <select value={gender} onChange={e=>setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input type="date" value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)} required />
                <input type="number" placeholder="Age" value={age} onChange={e=>setAge(e.target.value)} required />
                <input type="text" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
                <input type="text" placeholder="Contact No" value={contactNo} onChange={e=>setContactNo(e.target.value)} />
                <select value={role} onChange={e=>setRole(e.target.value)}>
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
        </main>
    );
}

export default Signup;
