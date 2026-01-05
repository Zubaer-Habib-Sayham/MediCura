const express = require('express');
const db = require('../db');
const router = express.Router();

/* ===== GET ALL ORDERS ===== */
router.get('/orders', (req, res) => {
  const sql = `
    SELECT 
        o.order_id, o.status, o.location, o.payment_method, o.total_amount,
        u.user_id AS patient_id, u.username AS patient_name,
        oi.order_item_id, oi.medicine_id, oi.quantity, oi.price,
        m.name AS medicine_name
    FROM Orders o
    LEFT JOIN Patient p ON o.patient_id = p.patient_id
    LEFT JOIN User u ON p.patient_id = u.user_id
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN Medicine m ON oi.medicine_id = m.medicine_id
    ORDER BY o.status ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Admin Orders fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch orders', error: err });
    }

    // Group items by order_id
    const ordersMap = {};
    rows.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          status: row.status,
          location: row.location,
          payment_method: row.payment_method,
          total_amount: row.total_amount,
          patient: {
            patient_id: row.patient_id,
            username: row.patient_name
          },
          items: []
        };
      }

      // Only push item if it exists
      if (row.order_item_id) {
        ordersMap[row.order_id].items.push({
          order_item_id: row.order_item_id,
          medicine_id: row.medicine_id,
          name: row.medicine_name,
          quantity: row.quantity,
          price: row.price
        });
      }
    });

    res.json(Object.values(ordersMap));
  });
});

/* ===== UPDATE ORDER STATUS ===== */
router.patch('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { action } = req.body;

  let newStatus;
  if (action === 'confirm') newStatus = 'Paid'; // or 'Delivered' if you updated ENUM
  else if (action === 'decline') newStatus = 'Canceled';
  else return res.status(400).json({ message: 'Invalid action' });

  db.query(
    `UPDATE Orders SET status = ? WHERE order_id = ?`,
    [newStatus, orderId],
    (err, result) => {
      if (err) {
        console.error('Order status update error:', err.sqlMessage);
        return res.status(500).json({ message: 'Failed to update order', error: err.sqlMessage });
      }

      res.json({ success: true, orderId, newStatus });
    }
  );
});


module.exports = router;
