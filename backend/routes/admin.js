const express = require("express");
const db = require("../db.js");

const router = express.Router();

/* ===== DOCTORS (view + delete) ===== */
router.get("/doctors", (req, res) => {
    const q = `
        SELECT u.user_id, u.username, u.email, u.gender, u.date_of_birth, u.age, u.address, u.contact_no,
               d.specialization, d.department, d.qualification, d.experience_year, d.consultation_fee, d.salary, d.rating
        FROM User u
        JOIN Doctor d ON u.user_id = d.doctor_id
    `;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});


router.delete("/doctors/:id", (req, res) => {
    db.query(
        "DELETE FROM User WHERE user_id = ?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json("Doctor deleted");
        }
    );
});

/* ===== PATIENTS (view + delete) ===== */
router.get("/patients", (req, res) => {
    const q = `
        SELECT u.user_id, u.username, u.email, u.gender, u.date_of_birth, u.age, u.address, u.contact_no,
               p.blood_group, p.medical_history
        FROM User u
        JOIN Patient p ON u.user_id = p.patient_id
    `;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

router.delete("/patients/:id", (req, res) => {
    db.query(
        "DELETE FROM User WHERE user_id = ?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json("Patient deleted");
        }
    );
});

/* ===== MEDICINES (view + add + delete) ===== */
router.get("/medicines", (req, res) => {
    db.query("SELECT * FROM Medicine", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

router.post("/medicines", (req, res) => {
    const { name, brand, type, price, stock_quantity, expiry_date } = req.body;

    const q = `
        INSERT INTO Medicine
        (name, brand, type, price, stock_quantity, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
        q,
        [name, brand, type, price, stock_quantity, expiry_date],
        err => {
            if (err) return res.status(500).json(err);
            res.json("Medicine added");
        }
    );
});

router.delete("/medicines/:id", (req, res) => {
    db.query(
        "DELETE FROM Medicine WHERE medicine_id = ?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json("Medicine deleted");
        }
    );
});

/* ===== ROOMS (view + add + delete) ===== */
router.get("/rooms", (req, res) => {
    const q = `
        SELECT r.room_id, r.price, r.status, r.patient_id, u.username AS patient_name
        FROM Room r
        LEFT JOIN Patient p ON r.patient_id = p.patient_id
        LEFT JOIN User u ON p.patient_id = u.user_id
    `;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});


router.post("/rooms", (req, res) => {
    const { price } = req.body;

    db.query(
        "INSERT INTO Room (price) VALUES (?)",
        [price],
        err => {
            if (err) return res.status(500).json(err);
            res.json("Room added");
        }
    );
});

router.delete("/rooms/:id", (req, res) => {
    db.query(
        "DELETE FROM Room WHERE room_id = ?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json("Room deleted");
        }
    );
});

module.exports = router;
