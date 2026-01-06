import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { Link } from "react-router-dom";

function MyRooms() {
  const { user } = useContext(AuthContext);
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const fetchMyRooms = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/patient/my-rooms/${user.user_id}`)
      .then(res => {
        console.log("My booked rooms:", res.data);
        setBookedRooms(res.data);
      })
      .catch(err => {
        console.error("Fetch my rooms error:", err);
      })
      .finally(() => setLoading(false));
  };

  const leaveRoom = (roomId) => {
    if (!window.confirm("Are you sure you want to leave this room? This action cannot be undone.")) {
      return;
    }

    axios
      .post("http://localhost:5000/api/patient/rooms/leave", {
        room_id: roomId,
        patient_id: user.user_id
      })
      .then(() => {
        alert("You have successfully left the room!");
        // Remove room from list
        setBookedRooms(bookedRooms.filter(r => r.room_id !== roomId));
      })
      .catch(err => {
        console.error("Leave room error:", err);
        alert(err.response?.data?.message || "Failed to leave room");
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

  const calculateStayDuration = (checkIn) => {
    if (!checkIn) return "N/A";
    const start = new Date(checkIn);
    const now = new Date();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h3>Loading your rooms...</h3>
      </div>
    );
  }

  return (
    <div>
      <nav>
        <div className="logo">MediCura</div>
        <Link to="/patient/dashboard">Dashboard</Link>
        <Link to="/patient/rooms">Book Rooms</Link>
        <Link to="/logout">Logout</Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h2>🏨 My Booked Rooms</h2>
          <p>Manage your current room bookings</p>
        </div>
      </section>

      <main style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        {bookedRooms.length === 0 ? (
          <div className="feature-card" style={{ textAlign: "center" }}>
            <h3>No Active Bookings</h3>
            <p style={{ marginBottom: "20px" }}>You don't have any rooms booked currently.</p>
            <Link to="/patient/rooms">
              <button className="cart-btn">Browse Available Rooms</button>
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "25px"
          }}>
            {bookedRooms.map(room => (
              <div 
                key={room.room_id} 
                className="feature-card"
                style={{
                  border: "2px solid #4CAF50",
                  borderRadius: "12px",
                  padding: "25px",
                  backgroundColor: "#f9fdf9"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px"
                }}>
                  <h3 style={{ 
                    margin: 0,
                    color: "#4CAF50",
                    fontSize: "24px"
                  }}>
                    {room.room_type}
                  </h3>
                  <span style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    Room #{room.room_id}
                  </span>
                </div>

                <div style={{ 
                  marginBottom: "20px", 
                  fontSize: "15px",
                  borderTop: "1px solid #e0e0e0",
                  paddingTop: "15px"
                }}>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>👥 Capacity:</strong> {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>💰 Price:</strong> ${room.price} / day
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>✨ Amenities:</strong> {parseAmenities(room.amenities)}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>📅 Check-in:</strong> {room.check_in ? new Date(room.check_in).toLocaleString() : "N/A"}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>⏱️ Duration:</strong> {calculateStayDuration(room.check_in)}
                  </p>
                  <p style={{ 
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}>
                    💡 <strong>Total Cost:</strong> ${(parseFloat(room.price) * Math.max(1, Math.floor((new Date() - new Date(room.check_in)) / (1000 * 60 * 60 * 24)))).toFixed(2)}
                  </p>
                </div>

                <button 
                  onClick={() => leaveRoom(room.room_id)}
                  className="delete-btn"
                  style={{ 
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  🚪 Leave Room
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyRooms;