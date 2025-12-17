import { useEffect, useState } from "react";
import axios from "axios";

function Patients() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/admin/patients")
            .then(res => setPatients(res.data));
    }, []);

    const remove = id => {
        axios.delete(`http://localhost:5000/admin/patients/${id}`)
            .then(() =>
                setPatients(patients.filter(p => p.user_id !== id))
            );
    };

    return (
        <>
            <h2>Patients</h2>
            {patients.map(p => (
                <div key={p.user_id}>
                    {p.username} — {p.blood_group}
                    <button onClick={() => remove(p.user_id)}>Delete</button>
                </div>
            ))}
        </>
    );
}

export default Patients;
