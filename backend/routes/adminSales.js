const express = require('express');
const db = require('../db');
const router = express.Router();

// GET Sales Analytics
router.get('/sales', async (req, res) => {
  try {
    // Total revenue
    const [revenueRows] = await db.promise().query(`
      SELECT SUM(total_amount) AS total_revenue, COUNT(*) AS total_orders
      FROM Orders
      WHERE status = 'Paid'
    `);

    // Orders by status
    const [statusRows] = await db.promise().query(`
      SELECT status, COUNT(*) AS count
      FROM Orders
      GROUP BY status
    `);

    // Revenue by day (last 7 days)
    const [dailyRevenue] = await db.promise().query(`
      SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue
      FROM Orders
      WHERE status = 'Paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    res.json({
      totalRevenue: revenueRows[0].total_revenue || 0,
      totalOrders: revenueRows[0].total_orders || 0,
      ordersByStatus: statusRows,
      dailyRevenue
    });

  } catch (err) {
    console.error('Sales Analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch sales analytics', error: err });
  }
});

module.exports = router;
