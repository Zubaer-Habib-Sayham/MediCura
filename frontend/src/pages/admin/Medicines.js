import { useEffect, useState } from "react";
import axios from "axios";

function Medicines() {
    const [meds, setMeds] = useState([]);
    const [form, setForm] = useState({});

    useEffect(() => {
        axios.get("http://localhost:5000/admin/medicines")
            .then(res => setMeds(res.data));
    }, []);

    const add = () => {
        axios.post("http://localhost:5000/admin/medicines", form)
            .then(() => window.location.reload());
    };

    const remove = id => {
        axios.delete(`http://localhost:5000/admin/medicines/${id}`)
            .then(() =>
                setMeds(meds.filter(m => m.medicine_id !== id))
            );
    };

    return (
        <>
            <h2>Medicines</h2>

            <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})}/>
            <input placeholder="Price" onChange={e => setForm({...form, price:e.target.value})}/>
            <button onClick={add}>Add Medicine</button>

            {meds.map(m => (
                <div key={m.medicine_id}>
                    {m.name} — {m.price}
                    <button onClick={() => remove(m.medicine_id)}>Delete</button>
                </div>
            ))}
        </>
    );
}

export default Medicines;
