import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function PHR_OrderHistory() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // ✅ Correct endpoint
      const res = await api.get(`/orders/patient/${user.user_id}`);

      // ✅ Group rows by order_id
      const grouped = {};

      res.data.forEach(row => {
        if (!grouped[row.order_id]) {
          grouped[row.order_id] = {
            order_id: row.order_id,
            status: row.status,
            location: row.location,
            payment_method: row.payment_method,
            total_amount: row.total_amount,
            items: []
          };
        }

        grouped[row.order_id].items.push({
          name: row.medicine_name,
          quantity: row.quantity,
          price: row.price
        });
      });

      setOrders(Object.values(grouped));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      alert('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (loading) return <div>Loading your orders...</div>;
  if (orders.length === 0) return <div className="order-card">You have no orders yet.</div>;

  return (
    <div className="order-history-container">
      <h2 className="hero">Your Order History</h2>

      {orders.map(order => (
        <div key={order.order_id} className="order-card">
          <h3>Order #{order.order_id}</h3>

          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ৳{order.total_amount}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
          <p><strong>Delivery Address:</strong> {order.location}</p>

          <hr />

          <strong>Items:</strong>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} — {item.quantity} × ৳{item.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default PHR_OrderHistory;
