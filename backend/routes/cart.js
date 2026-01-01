const express = require('express');
const db = require('../db');
const router = express.Router();

/* ===== Get or create cart for a patient ===== */
router.get('/:patientId', async (req, res) => {
    const patientId = req.params.patientId;

    try {
        // Check if cart exists
        const [cartRows] = await db.promise().query(
            "SELECT * FROM Cart WHERE patient_id = ?",
            [patientId]
        );

        let cartId;

        if (cartRows.length === 0) {
            // Create new cart
            const [result] = await db.promise().query(
                "INSERT INTO Cart (patient_id) VALUES (?)",
                [patientId]
            );
            cartId = result.insertId;
        } else {
            cartId = cartRows[0].cart_id;
        }

        // Fetch items in cart
        const [items] = await db.promise().query(
            `SELECT ci.cart_item_id, ci.quantity, m.medicine_id, m.name, m.brand, m.type, m.price, m.expiry_date
             FROM CartItems ci
             JOIN Medicine m ON ci.medicine_id = m.medicine_id
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        res.json({ cartId, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get cart" });
    }
});

/* ===== Add medicine to cart ===== */
router.post('/add', async (req, res) => {
    const { patientId, medicineId, quantity } = req.body;

    try {
        // Check if cart exists
        const [cartRows] = await db.promise().query(
            "SELECT * FROM Cart WHERE patient_id = ?",
            [patientId]
        );

        let cartId;

        if (cartRows.length === 0) {
            // Create cart
            const [result] = await db.promise().query(
                "INSERT INTO Cart (patient_id) VALUES (?)",
                [patientId]
            );
            cartId = result.insertId;
        } else {
            cartId = cartRows[0].cart_id;
        }

        // Check if item already in cart
        const [itemRows] = await db.promise().query(
            "SELECT * FROM CartItems WHERE cart_id = ? AND medicine_id = ?",
            [cartId, medicineId]
        );

        if (itemRows.length > 0) {
            // Update quantity
            await db.promise().query(
                "UPDATE CartItems SET quantity = quantity + ? WHERE cart_id = ? AND medicine_id = ?",
                [quantity, cartId, medicineId]
            );
        } else {
            // Insert new item
            await db.promise().query(
                "INSERT INTO CartItems (cart_id, medicine_id, quantity) VALUES (?, ?, ?)",
                [cartId, medicineId, quantity]
            );
        }

        res.json({ message: "Medicine added to cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add to cart" });
    }
});

/* ===== Remove item from cart ===== */
router.delete('/remove/:cartItemId', async (req, res) => {
    try {
        await db.promise().query(
            "DELETE FROM CartItems WHERE cart_item_id = ?",
            [req.params.cartItemId]
        );
        res.json({ message: "Item removed from cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove item" });
    }
});

module.exports = router;
