import { useEffect, useState } from "react";
import axios from "axios";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    price: "",
    room_type: "General",
    capacity: 1,
    amenities: []
  });

  const amenityOptions = ["TV", "AC", "Attached Bathroom", "WiFi"];

  /* ================= FETCH ROOMS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error("Fetch rooms error:", err));
  }, []);

  /* ================= ADD ROOM ================= */
  const add = () => {
    if (!form.price) {
      alert("Price is required");
      return;
    }

    axios
      .post("http://localhost:5000/admin/rooms", form)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => console.error("Add room error:", err));
  };

  /* ================= DELETE ROOM ================= */
  const remove = (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    axios
      .delete(`http://localhost:5000/admin/rooms/${id}`)
      .then(() => {
        setRooms(rooms.filter((r) => r.room_id !== id));
      })
      .catch((err) => console.error("Delete room error:", err));
  };

  /* ================= TOGGLE AMENITIES ================= */
  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Rooms</h2>

      {/* ================= ADD ROOM FORM ================= */}
      <div className="rooms-form">
        <h4>Room Type</h4>
        <select
          value={form.room_type}
          onChange={(e) => setForm({ ...form, room_type: e.target.value })}
        >
          <option value="General">General</option>
          <option value="ICU">ICU</option>
          <option value="VIP">VIP</option>
          <option value="Deluxe">Deluxe</option>
        </select>
        <h4>Capacity</h4>
        <input
          type="number"
          min={1}
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        />
        <h4>Price</h4>
        <input
          type="number"
          placeholder="Room Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <div className="rooms-bottom">
          {/* Amenities */}
          <div className="rooms-amenities">
            <h4>Amenities</h4>

            <div className="amenities-grid">
              {amenityOptions.map((a) => (
                <label key={a} className="amenity-item">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Action */}
          <div className="rooms-action">
            <button onClick={add}>Add Room</button>
          </div>
        </div>
      </div>

      {/* ================= ROOMS TABLE ================= */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Price</th>
            <th>Status</th>
            <th>Patient</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Amenities</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rooms.map((r) => (
            <tr key={r.room_id}>
              <td>{r.room_id}</td>
              <td>{r.room_type}</td>
              <td>{r.capacity}</td>
              <td>{r.price}</td>
              <td>{r.status}</td>
              <td>{r.patient_name || "-"}</td>
              <td>{r.check_in ? new Date(r.check_in).toLocaleString() : "-"}</td>
              <td>{r.check_out ? new Date(r.check_out).toLocaleString() : "-"}</td>
              <td>
                {r.amenities ? JSON.parse(r.amenities).join(", ") : "-"}
              </td>
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
