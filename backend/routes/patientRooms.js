const express = require("express");
const db = require("../db");
const router = express.Router();

/* ===== GET AVAILABLE ROOMS ===== */
router.get("/rooms", (req, res) => {
  const q = `
    SELECT room_id, room_type, capacity, price, amenities
    FROM Room
    WHERE status = 'Available'
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

/* ===== GET PATIENT'S BOOKED ROOMS ===== */
router.get("/my-rooms/:patientId", (req, res) => {
  const q = `
    SELECT r.room_id, r.room_type, r.capacity, r.price, r.amenities, 
           r.check_in, r.check_out, r.status
    FROM Room r
    WHERE r.patient_id = ? AND r.status = 'Occupied'
  `;

  db.query(q, [req.params.patientId], (err, data) => {
    if (err) {
      console.error("Get my rooms error:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

/* ===== BOOK ROOM ===== */
router.post("/rooms/book", (req, res) => {
  const { room_id, patient_id } = req.body;

  const q = `
    UPDATE Room
    SET 
      patient_id = ?, 
      status = 'Occupied',
      check_in = NOW()
    WHERE room_id = ? AND status = 'Available'
  `;

  db.query(q, [patient_id, room_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Room not available" });
    }

    res.json({ message: "Room booked successfully" });
  });
});

/* ===== LEAVE ROOM ===== */
router.post("/rooms/leave", (req, res) => {
  const { room_id, patient_id } = req.body;

  // Verify the room belongs to this patient
  const checkQ = `SELECT * FROM Room WHERE room_id = ? AND patient_id = ?`;
  
  db.query(checkQ, [room_id, patient_id], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.length === 0) {
      return res.status(403).json({ message: "This room is not booked by you" });
    }

    // Update room to Available and clear patient info
    const updateQ = `
      UPDATE Room
      SET 
        patient_id = NULL, 
        status = 'Available',
        check_out = NOW()
      WHERE room_id = ?
    `;

    db.query(updateQ, [room_id], (err, updateResult) => {
      if (err) {
        console.error("Leave room error:", err);
        return res.status(500).json(err);
      }

      res.json({ message: "Room left successfully" });
    });
  });
});

module.exports = router;