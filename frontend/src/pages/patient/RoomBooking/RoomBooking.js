import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../AuthContext";
import { Link } from "react-router-dom";

function RoomBooking() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/patient/rooms")
      .then(res => {
        console.log("Available rooms:", res.data);
        setRooms(res.data);
      })
      .catch(err => {
        console.error("Fetch rooms error:", err);
        alert("Failed to load rooms");
      })
      .finally(() => setLoading(false));
  };

  const bookRoom = (roomId) => {
    if (!window.confirm("Are you sure you want to book this room?")) {
      return;
    }

    axios
      .post("http://localhost:5000/api/patient/rooms/book", {
        room_id: roomId,
        patient_id: user.user_id
      })
      .then(() => {
        alert("Room booked successfully!");
        // Remove booked room from list
        setRooms(rooms.filter(r => r.room_id !== roomId));
      })
      .catch(err => {
        console.error("Book room error:", err);
        alert(err.response?.data?.message || "Room booking failed");
      });
  };

  const parseAmenities = (amenities) => {
    if (!amenities) return "None";
    try {
      const parsed = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      return Array.isArray(parsed) && parsed.length > 0 
        ? parsed.join(", ") 
        : "None";
    } catch (e) {
      return "None";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h3>Loading available rooms...</h3>
      </div>
    );
  }

  return (
    <div>
      <nav>
        <div className="logo">MediCura</div>
        <Link to="/patient/dashboard">Dashboard</Link>
        <Link to="/patient/my-rooms">My Rooms</Link>
        <Link to="/logout">Logout</Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h2>🏨 Available Rooms</h2>
          <p>Book a room for your hospital stay</p>
        </div>
      </section>

      <main style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        {rooms.length === 0 ? (
          <div className="feature-card" style={{ textAlign: "center" }}>
            <h3>No Rooms Available</h3>
            <p>All rooms are currently occupied. Please check back later.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {rooms.map(room => (
              <div 
                key={room.room_id} 
                className="feature-card"
                style={{
                  border: "2px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "20px"
                }}
              >
                <h3 style={{ 
                  marginBottom: "15px", 
                  color: "#4CAF50",
                  fontSize: "22px"
                }}>
                  {room.room_type}
                </h3>
                
                <div style={{ marginBottom: "15px", fontSize: "15px" }}>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>👥 Capacity:</strong> {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>💰 Price:</strong> ${room.price} / day
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>✨ Amenities:</strong> {parseAmenities(room.amenities)}
                  </p>
                </div>

                <button 
                  onClick={() => bookRoom(room.room_id)}
                  className="cart-btn"
                  style={{ 
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px"
                  }}
                >
                  Book Room
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default RoomBooking;