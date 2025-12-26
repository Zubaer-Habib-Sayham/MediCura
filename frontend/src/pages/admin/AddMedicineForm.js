import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AddMedicineForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    type: "",
    price: "",
    stock_quantity: "",
    expiry_date: "",
  });

  const add = () => {
    axios
      .post("http://localhost:5000/admin/medicines", form)
      .then(() => {
        navigate("/admin/medicines"); // go back to list
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <nav>
        <div className="logo">MediCura</div>
        <Link to="/">Home</Link>
        <Link to="/admin/medicines">Back to Medicines</Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Add Medicine</h1>
        </div>
      </section>

      <main>
        <div className="form-container auth">
          <input
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <input
            placeholder="Brand"
            onChange={(e) =>
              setForm({ ...form, brand: e.target.value })
            }
          />
          <input
            placeholder="Type"
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Stock Quantity"
            onChange={(e) =>
              setForm({
                ...form,
                stock_quantity: e.target.value,
              })
            }
          />
          <input
            type="date"
            onChange={(e) =>
              setForm({
                ...form,
                expiry_date: e.target.value,
              })
            }
          />
          <button onClick={add}>Add Medicine</button>
        </div>
      </main>
    </>
  );
}

export default AddMedicineForm;
