const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'secretkey'; // JWT secret

// SIGNUP
router.post('/signup', async (req, res) => {
    const { username, email, password, gender, date_of_birth, age, address, contact_no, role } = req.body;

    // Check if email already exists
    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) return res.json({ success: false, message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO User (username,email,password,gender,date_of_birth,age,address,contact_no,role) VALUES (?,?,?,?,?,?,?,?,?)',
            [username, email, hashedPassword, gender, date_of_birth, age, address, contact_no, role],
            (err, results) => {
                if (err) return res.status(500).send(err);
                res.json({ success: true, message: 'Signup successful' });
            }
        );
    });
});

// LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.json({ success: false, message: 'User not found' });

        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
            const token = jwt.sign({ user_id: results[0].user_id }, SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            res.json({ success: true, user: { username: results[0].username, role: results[0].role } });
        } else {
            res.json({ success: false, message: 'Wrong password' });
        }
    });
});

// LOGOUT
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

module.exports = router;
