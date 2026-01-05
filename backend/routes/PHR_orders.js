const express = require('express');
const db = require('../db');
const router = express.Router();

/* ===============================
   CREATE ORDER FROM CART
================================ */
router.post('/create', (req, res) => {
  const { patientId, location, paymentMethod } = req.body;

  if (!patientId || !location || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // 1️⃣ Get cart
  db.query(
    'SELECT cart_id FROM Cart WHERE patient_id = ?',
    [patientId],
    (err, cartRows) => {
      if (err) {
        console.error('Cart fetch error:', err);
        return res.status(500).json({ message: 'Failed to fetch cart' });
      }

      if (cartRows.length === 0) {
        return res.status(400).json({ message: 'Cart not found' });
      }

      const cartId = cartRows[0].cart_id;

      // 2️⃣ Get cart items
      db.query(
        `
        SELECT 
          ci.medicine_id,
          ci.quantity,
          m.name,
          m.price,
          m.stock_quantity
        FROM CartItems ci
        JOIN Medicine m ON ci.medicine_id = m.medicine_id
        WHERE ci.cart_id = ?
        `,
        [cartId],
        (err, items) => {
          if (err) {
            console.error('Cart items fetch error:', err);
            return res.status(500).json({ message: 'Failed to fetch cart items' });
          }

          if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
          }

          // 3️⃣ Check stock
          for (let item of items) {
            if (item.stock_quantity < item.quantity) {
              return res
                .status(400)
                .json({ message: `Insufficient stock for ${item.name}` });
            }
          }

          // 4️⃣ Calculate total
          const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          // 5️⃣ Create order
          db.query(
            `
            INSERT INTO Orders 
            (patient_id, status, location, payment_method, total_amount)
            VALUES (?, 'Pending', ?, ?, ?)
            `,
            [patientId, location, paymentMethod, totalAmount],
            (err, orderResult) => {
              if (err) {
                console.error('Order creation error:', err);
                return res.status(500).json({ message: 'Failed to create order' });
              }

              const orderId = orderResult.insertId;
              let processed = 0;

              // 6️⃣ Insert order items & reduce stock
              items.forEach(item => {
                db.query(
                  `
                  INSERT INTO OrderItems 
                  (order_id, medicine_id, quantity, price)
                  VALUES (?, ?, ?, ?)
                  `,
                  [orderId, item.medicine_id, item.quantity, item.price],
                  (err) => {
                    if (err) {
                      console.error('Insert order item error:', err);
                      return res.status(500).json({ message: 'Failed to add order item' });
                    }

                    db.query(
                      `
                      UPDATE Medicine 
                      SET stock_quantity = stock_quantity - ?
                      WHERE medicine_id = ?
                      `,
                      [item.quantity, item.medicine_id],
                      (err) => {
                        if (err) {
                          console.error('Stock update error:', err);
                          return res.status(500).json({ message: 'Failed to update stock' });
                        }

                        processed++;

                        // 7️⃣ Clear cart after all items processed
                        if (processed === items.length) {
                          db.query(
                            'DELETE FROM CartItems WHERE cart_id = ?',
                            [cartId],
                            (err) => {
                              if (err) {
                                console.error('Clear cart error:', err);
                                return res
                                  .status(500)
                                  .json({ message: 'Failed to clear cart' });
                              }

                              res.json({
                                success: true,
                                orderId,
                                totalAmount
                              });
                            }
                          );
                        }
                      }
                    );
                  }
                );
              });
            }
          );
        }
      );
    }
  );
});

/* ===============================
   GET ORDER HISTORY (PATIENT)
================================ */
router.get('/patient/:patientId', (req, res) => {
  const { patientId } = req.params;

  const sql = `
    SELECT
      o.order_id,
      o.status,
      o.location,
      o.payment_method,
      o.total_amount,
      oi.quantity,
      oi.price,
      m.name AS medicine_name
    FROM Orders o
    JOIN OrderItems oi ON o.order_id = oi.order_id
    JOIN Medicine m ON oi.medicine_id = m.medicine_id
    WHERE o.patient_id = ?
    ORDER BY o.order_id DESC
  `;

  db.query(sql, [patientId], (err, rows) => {
    if (err) {
      console.error('Order history fetch error:', err);
      return res.status(500).json({ message: 'Failed to load order history' });
    }

    res.json(rows);
  });
});

module.exports = router;
