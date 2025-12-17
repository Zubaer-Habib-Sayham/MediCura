import { useEffect, useState } from "react";
import axios from "axios";

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [price, setPrice] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/admin/rooms")
            .then(res => setRooms(res.data));
    }, []);

    const add = () => {
        axios.post("http://localhost:5000/admin/rooms", { price })
            .then(() => window.location.reload());
    };

    const remove = id => {
        axios.delete(`http://localhost:5000/admin/rooms/${id}`)
            .then(() =>
                setRooms(rooms.filter(r => r.room_id !== id))
            );
    };

    return (
        <>
            <h2>Rooms</h2>

            <input placeholder="Price" onChange={e => setPrice(e.target.value)} />
            <button onClick={add}>Add Room</button>

            {rooms.map(r => (
                <div key={r.room_id}>
                    Room #{r.room_id} — {r.status}
                    <button onClick={() => remove(r.room_id)}>Delete</button>
                </div>
            ))}
        </>
    );
}

export default Rooms;
