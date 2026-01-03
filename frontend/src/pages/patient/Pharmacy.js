// Imports must be at the top
import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Pharmacy() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    api.get('http://localhost:5000/admin/medicines')
      .then(res => setMedicines(res.data))
      .catch(err => console.error(err));
  }, []);

  const addToCart = async (medicine) => {
    try {
      await api.post('/cart/add', {
        patientId: user.user_id,
        medicineId: medicine.medicine_id,
        quantity: 1
      });
      alert(`${medicine.name} added to your cart`);
    } catch (err) {
      console.error(err);
      alert("Failed to add medicine to cart");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <nav>
        <div className="logo">MediCura</div>
        <Link to="/patient/dashboard">Portal</Link>
        <Link to="/patient/cart">My Cart</Link>
        <Link to="/logout">Logout</Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h2>Pharmacy</h2>
          <p className = "hero-content">Browse medicines and add them to your cart</p>
        </div>
      </section>

      <main>
        {medicines.length === 0 ? (
          <p>No medicines available at the moment.</p>
        ) : (
          <table className='table'>
            <thead>
              <tr>
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
              {medicines.map((med) => (
                <tr key={med.medicine_id}>
                  <td>{med.name}</td>
                  <td>{med.brand}</td>
                  <td>{med.type}</td>
                  <td>${med.price}</td>
                  <td>{med.stock_quantity}</td>
                  <td>{new Date(med.expiry_date).toLocaleDateString('en-GB')}</td>
                  <td>
                    <button
                      className="cart-btn"
                      onClick={() => addToCart(med)}
                      disabled={med.stock_quantity === 0}
                    >
                      {med.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default Pharmacy;
