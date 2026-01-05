import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function Checkout() {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!location) return alert("Please enter delivery location");

    setLoading(true);
    try {
      const res = await api.post('/orders/create', {
        patientId: user.user_id,
        location,
        paymentMethod
      });

      if (res.data.success) {
        alert("Order placed successfully!");
        navigate(`/patient/cart`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="hero">Checkout</h2>
      <div className="checkout-form">
        <label>Delivery Address:</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Enter your delivery address"
        />

        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="COD">Cash on Delivery (COD)</option>
          <option value="MobileBanking">Mobile Banking</option>
          <option value="CreditCard">Credit Card</option>
        </select>

        <button onClick={handlePlaceOrder} disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
