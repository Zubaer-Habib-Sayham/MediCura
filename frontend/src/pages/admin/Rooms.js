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

  /* ================= SAFE AMENITIES PARSER ================= */
  const parseAmenities = (amenities) => {
    if (!amenities) return "-";
    
    // If it's already a string, try to parse it
    if (typeof amenities === 'string') {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(", ") : "-";
      } catch (e) {
        console.error("Parse amenities error:", e);
        return "-";
      }
    }
    
    // If it's already an array
    if (Array.isArray(amenities)) {
      return amenities.length > 0 ? amenities.join(", ") : "-";
    }
    
    return "-";
  };

  /* ================= FETCH ROOMS ================= */
  const fetchRooms = () => {
    axios
      .get("http://localhost:5000/admin/rooms")
      .then((res) => {
        console.log("Fetched rooms:", res.data);
        setRooms(res.data);
      })
      .catch((err) => console.error("Fetch rooms error:", err));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  /* ================= ADD ROOM ================= */
  const add = () => {
    if (!form.price || form.price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    console.log("Sending room data:", form);

    axios
      .post("http://localhost:5000/admin/rooms", form)
      .then((response) => {
        console.log("Room added:", response.data);
        alert("Room added successfully!");
        // Reset form
        setForm({
          price: "",
          room_type: "General",
          capacity: 1,
          amenities: []
        });
        // Refresh room list
        fetchRooms();
      })
      .catch((err) => {
        console.error("Add room error:", err);
        alert("Failed to add room");
      });
  };

  /* ================= DELETE ROOM ================= */
  const remove = (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    axios
      .delete(`http://localhost:5000/admin/rooms/${id}`)
      .then(() => {
        setRooms((prev) => prev.filter((r) => r.room_id !== id));
        alert("Room deleted successfully");
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
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>
        Room Management
      </h2>

      {/* ================= ADD ROOM FORM ================= */}
      <div className="rooms-form">
        <h3>Add New Room</h3>

        <label>Room Type</label>
        <select
          value={form.room_type}
          onChange={(e) =>
            setForm({ ...form, room_type: e.target.value })
          }
        >
          <option value="General">General</option>
          <option value="ICU">ICU</option>
          <option value="VIP">VIP</option>
          <option value="Deluxe">Deluxe</option>
        </select>

        <label>Capacity</label>
        <input
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: Number(e.target.value) })
          }
        />

        <label>Price (per day)</label>
        <input
          type="number"
          min={1}
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          placeholder="Enter price"
        />

        <div className="rooms-amenities">
          <h4>Amenities (Selected: {form.amenities.length})</h4>
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

        <button className="rooms-action" onClick={add}>
          Add Room
        </button>
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
          {rooms.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No rooms available
              </td>
            </tr>
          ) : (
            rooms.map((r) => (
              <tr key={r.room_id}>
                <td>{r.room_id}</td>
                <td>{r.room_type || "-"}</td>
                <td>{r.capacity || "-"}</td>
                <td>${r.price}</td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: r.status === 'Available' ? '#e8f5e9' : '#ffebee',
                    color: r.status === 'Available' ? '#2e7d32' : '#c62828'
                  }}>
                    {r.status}
                  </span>
                </td>
                <td>{r.patient_name || "-"}</td>
                <td>
                  {r.check_in
                    ? new Date(r.check_in).toLocaleString()
                    : "-"}
                </td>
                <td>
                  {r.check_out
                    ? new Date(r.check_out).toLocaleString()
                    : "-"}
                </td>
                <td>{parseAmenities(r.amenities)}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => remove(r.room_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

export default Rooms;