import { useEffect, useState } from "react";
import axios from "axios";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ price: "" });

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err));
  }, []);

  const add = () => {
    axios
      .post("http://localhost:5000/admin/rooms", form)
      .then(() => window.location.reload())
      .catch((err) => console.error(err));
  };

  const remove = (id) => {
    axios
      .delete(`http://localhost:5000/admin/rooms/${id}`)
      .then(() => setRooms(rooms.filter((r) => r.room_id !== id)))
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Rooms</h2>

      {/* Add Room Form */}
      <div className="form-container auth">
        <input
          placeholder="Price"
          type="number"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <button onClick={add}> Add Room </button>
      </div>
      
      <section className = "hero">
                    <div className = "hero-content">
                        <span>Rooms List</span>
                    </div>
      </section>
      {/* Rooms Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Room ID</th>
            <th>Patient ID</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.room_id}>
              <td>{r.room_id}</td>
              <td>{r.patient_id || "-"}</td>
              <td>{r.price}</td>
              <td>{r.status}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => remove(r.room_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Rooms;
