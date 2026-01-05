import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminSales() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const res = await api.get('/admin/sales');
      setSalesData(res.data);
    } catch (err) {
      console.error('Failed to fetch sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) return <div>Loading sales analytics...</div>;
  if (!salesData) return <div>No sales data found.</div>;

  const { totalRevenue, totalOrders, ordersByStatus, dailyRevenue } = salesData;

  // Chart Data using dailyRevenue
  const chartData = {
    labels: salesData.dailyRevenue.map(o => {
      const dateObj = new Date(o.date);
      return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue ($)',
        data: salesData.dailyRevenue.map(o => parseFloat(o.revenue)),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };



  return (
    <div className="admin-sales">
      <h2>📊 Sales Analytics</h2>

      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Revenue</h3>
          <p>${Number(totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="analytics-card">
          <h3>Canceled Orders</h3>
          <p>{ordersByStatus.find(s => s.status === 'Canceled')?.count || 0}</p>
        </div>
      </div>

      <div className="chart-container">
        <Bar data={chartData} />
      </div>

      <table className="sales-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {ordersByStatus.map(status => (
            <tr key={status.status}>
              <td>{status.status}</td>
              <td>{status.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminSales;
