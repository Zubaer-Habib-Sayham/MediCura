import React,{useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout(){
    const navigate=useNavigate();
    useEffect(()=>{
        const logout=async()=>{
            await axios.post('http://localhost:5000/api/logout', {}, { withCredentials:true });
            navigate('/');
        }
        logout();
    },[navigate]);
    return <main><p>Logging out...</p></main>;
}

export default Logout;
