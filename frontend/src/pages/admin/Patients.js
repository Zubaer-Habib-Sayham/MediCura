import { useEffect, useState } from "react";
import axios from "axios";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    gender: "",
    date_of_birth: "",
    age: "",
    address: "",
    contact_no: "",
    blood_group: "",
    medical_history: "",
    password: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/patients")
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  }, []);

  const add = () => {
    axios
      .post("http://localhost:5000/admin/patients", form)
      .then(() => window.location.reload())
      .catch((err) => console.error(err));
  };

  const remove = (id) => {
    axios
      .delete(`http://localhost:5000/admin/patients/${id}`)
      .then(() =>
        setPatients(patients.filter((p) => p.user_id !== id))
      )
      .catch((err) => console.error(err));
  };

  return (
    <>
      <section className = "hero">
                    <div className = "hero-content">
                        <span>Patients List</span>
                    </div>
      </section>
      {/* Patients Table */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Date of Birth</th>
            <th>Age</th>
            <th>Address</th>
            <th>Contact No</th>
            <th>Blood Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.user_id}>
              <td>{p.user_id}</td>
              <td>{p.username}</td>
              <td>{p.email}</td>
              <td>{p.gender}</td>
              <td>{new Date(p.date_of_birth).toLocaleDateString('en-GB')} </td>
              <td>{p.age}</td>
              <td>{p.address}</td>
              <td>{p.contact_no}</td>
              <td>{p.blood_group}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => remove(p.user_id)}
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

export default Patients;
