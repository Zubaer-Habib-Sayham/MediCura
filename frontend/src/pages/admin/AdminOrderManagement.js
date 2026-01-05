import React, { useEffect, useState } from 'react';
import api from '../../api';

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All'); // New state for filter

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId, action) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}`, { action });
      if (res.data.success) {
        fetchOrders(); // refresh list
      }
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Failed to update order status');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (orders.length === 0) return <div>No orders found.</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Delivered': return 'green';
      case 'Canceled': return 'red';
      default: return 'gray';
    }
  };

  // Filter orders based on selected status
  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="admin-orders">
      <h2>📦 Order Management</h2>

      {/* ===== Status Filter Dropdown ===== */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="statusFilter"><strong>Filter by Status: </strong></label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Confirmed</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      {filteredOrders.length === 0 && <p>No orders found for this status.</p>}

      {filteredOrders.map(order => (
        <div key={order.order_id} className="order-card">
          <div className="order-header">
            <h3>Order #{order.order_id}</h3>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {order.status}
            </span>
          </div>

          <p><strong>Patient:</strong> {order.patient.username}</p>
          <p><strong>Delivery Address:</strong> {order.location || 'N/A'}</p>
          <p><strong>Payment:</strong> {order.payment_method} | Total: ${order.total_amount}</p>

          {order.items.length > 0 ? (
            <ul className="order-items">
              {order.items.map(item => (
                <li key={item.order_item_id}>
                  {item.name} — {item.quantity} × ${item.price}
                </li>
              ))}
            </ul>
          ) : (
            <p><em>No items in this order</em></p>
          )}

          {order.status === 'Pending' && (
            <div className="order-actions">
              <button
                className="confirm-btn"
                onClick={() => handleAction(order.order_id, 'confirm')}
              >
                ✅ Confirm
              </button>
              <button
                className="decline-btn"
                onClick={() => handleAction(order.order_id, 'decline')}
              >
                ❌ Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminOrderManagement;
