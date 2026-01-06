const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const conn = db.promise();

// GET notifications for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await conn.query(
            "SELECT * FROM Notification WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [req.user.user_id]
        );
        res.json({ success: true, notifications: rows });
    } catch (err) {
        console.error("Fetch notifications error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
});

// PUT mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        await conn.query(
            "UPDATE Notification SET is_read = TRUE WHERE notification_id = ? AND user_id = ?",
            [req.params.id, req.user.user_id]
        );
        res.json({ success: true, message: "Marked as read" });
    } catch (err) {
        console.error("Update notification error:", err);
        res.status(500).json({ success: false, message: "Failed to update notification" });
    }
});

// Helper to create notification (internal use mostly, but exposed if needed)
// Usage in other files: await createNotification(userId, "Message", "Type");
// We can also expose a POST route for testing or admin
router.post('/', auth, async (req, res) => {
    // Only allow system/admin or maybe self? Let's restrict to testing for now or admin
    // For now, simplify: anyone can "test" create a notification for themselves
    const { message, type } = req.body;
    try {
        await conn.query(
            "INSERT INTO Notification (user_id, message, type) VALUES (?, ?, ?)",
            [req.user.user_id, message, type || 'General']
        );
        res.json({ success: true, message: "Notification created" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
