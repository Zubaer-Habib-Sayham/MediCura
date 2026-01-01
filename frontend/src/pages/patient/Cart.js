import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function Cart() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await api.get(`/cart/${user.user_id}`);
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/remove/${cartItemId}`);
      fetchCart(); // refresh cart
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <h2 className = "hero">Your Cart</h2>
      {items.length === 0 ? <p className="feature-card">Cart is empty</p> :
      <table className='table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Type</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Expiry Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.cart_item_id}>
              <td>{item.name}</td>
              <td>{item.brand}</td>
              <td>{item.type}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{new Date(item.expiry_date).toLocaleDateString('en-GB')}</td>
              <td>
                <button className="delete-btn" onClick={() => removeItem(item.cart_item_id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <h3 className = "hero">Total: ${totalPrice.toFixed(2)}</h3>
    </div>
  );
}

export default Cart;
