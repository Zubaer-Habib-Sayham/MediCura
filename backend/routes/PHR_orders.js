const express = require('express');
const db = require('../db');
const router = express.Router();

/* ===== CREATE ORDER FROM CART ===== */
router.post('/create', (req, res) => {
  const { patientId, location, paymentMethod } = req.body;

  // 1️⃣ Get cart
  db.query("SELECT * FROM Cart WHERE patient_id = ?", [patientId], (err, cartRows) => {
    if (err) {
      console.error('Cart fetch error:', err);
      return res.status(500).json({ message: err.message });
    }

    if (cartRows.length === 0) return res.status(400).json({ message: "Cart not found" });

    const cartId = cartRows[0].cart_id;

    // 2️⃣ Get cart items
    db.query(
      `SELECT ci.*, m.price, m.stock_quantity, m.name
       FROM CartItems ci
       JOIN Medicine m ON ci.medicine_id = m.medicine_id
       WHERE ci.cart_id = ?`,
      [cartId],
      (err, items) => {
        if (err) {
          console.error('Cart items fetch error:', err);
          return res.status(500).json({ message: err.message });
        }

        if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });

        // 3️⃣ Check stock
        for (let item of items) {
          if (item.stock_quantity < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
          }
        }

        // 4️⃣ Calculate total
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 5️⃣ Create order
        db.query(
          `INSERT INTO Orders (patient_id, status, location, payment_method, total_amount) 
           VALUES (?, 'Pending', ?, ?, ?)`,
          [patientId, location, paymentMethod, totalAmount],
          (err, orderResult) => {
            if (err) {
              console.error('Order creation error:', err);
              return res.status(500).json({ message: err.message });
            }

            const orderId = orderResult.insertId;

            // 6️⃣ Insert order items & reduce stock
            let processed = 0;
            items.forEach(item => {
              // Insert into OrderItems
              db.query(
                `INSERT INTO OrderItems (order_id, medicine_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.medicine_id, item.quantity, item.price],
                (err) => {
                  if (err) {
                    console.error('Insert order item error:', err);
                    return res.status(500).json({ message: err.message });
                  }

                  // Reduce stock
                  db.query(
                    `UPDATE Medicine SET stock_quantity = stock_quantity - ? WHERE medicine_id = ?`,
                    [item.quantity, item.medicine_id],
                    (err) => {
                      if (err) {
                        console.error('Reduce stock error:', err);
                        return res.status(500).json({ message: err.message });
                      }

                      // Check if all items processed
                      processed++;
                      if (processed === items.length) {
                        // 7️⃣ Clear cart
                        db.query("DELETE FROM CartItems WHERE cart_id = ?", [cartId], (err) => {
                          if (err) {
                            console.error('Clear cart error:', err);
                            return res.status(500).json({ message: err.message });
                          }

                          res.json({ success: true, orderId, totalAmount });
                        });
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
  });
});

module.exports = router;
