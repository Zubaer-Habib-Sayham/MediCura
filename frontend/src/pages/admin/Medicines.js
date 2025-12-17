import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function Medicines() {
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    type: "",
    price: "",
    stock_quantity: "",
    expiry_date: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/medicines")
      .then((res) => setMeds(res.data))
      .catch((err) => console.error(err));
  }, []);

  const add = () => {
    axios
      .post("http://localhost:5000/admin/medicines", form)
      .then(() => window.location.reload())
      .catch((err) => console.error(err));
  };

  const remove = (id) => {
    axios
      .delete(`http://localhost:5000/admin/medicines/${id}`)
      .then(() =>
        setMeds(meds.filter((m) => m.medicine_id !== id))
      )
      .catch((err) => console.error(err));
  };

  return (
    <>
      <nav>
                <div className="logo">MediCura</div>
                <Link to="/">Home</Link>
                <Link to="/admin/medicines/add">Add Medicines</Link>
      </nav>
      {/* ===== Medicines List Header ===== */}
      <section className="hero">
        <div className="hero-content">
          <span>Medicines List</span>
        </div>
      </section>

      {/* ===== Medicines Table ===== */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Type</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Expiry Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {meds.map((m) => (
            <tr key={m.medicine_id}>
              <td>{m.medicine_id}</td>
              <td>{m.name}</td>
              <td>{m.brand}</td>
              <td>{m.type}</td>
              <td>{m.price}</td>
              <td>{m.stock_quantity}</td>
              <td>
                {m.expiry_date
                  ? new Date(m.expiry_date)
                      .toISOString()
                      .slice(0, 10)
                  : "N/A"}
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() =>
                    remove(m.medicine_id)
                  }
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

export default Medicines;
