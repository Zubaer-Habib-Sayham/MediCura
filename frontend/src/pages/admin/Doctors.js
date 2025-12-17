import { useEffect, useState } from "react";
import axios from "axios";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  const remove = (id) => {
    axios
      .delete(`http://localhost:5000/admin/doctors/${id}`)
      .then(() =>
        setDoctors(doctors.filter((d) => d.user_id !== id))
      )
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Doctors</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Department</th>
            <th>Qualification</th>
            <th>Experience</th>
            <th>Fee</th>
            <th>Salary</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d.user_id}>
              <td>{d.username}</td>
              <td>{d.email}</td>
              <td>{d.specialization}</td>
              <td>{d.department}</td>
              <td>{d.qualification}</td>
              <td>{d.experience_year}</td>
              <td>{d.consultation_fee}</td>
              <td>{d.salary}</td>
              <td>{d.rating}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => remove(d.user_id)}
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

export default Doctors;
