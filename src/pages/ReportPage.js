import React, { useEffect, useState } from 'react';
import './Report.css';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const MarketvaliReport = () => {
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const [products, setProducts] = useState([]);
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{ label: 'Verifications', data: [], backgroundColor: '#3B82F6' }],
  });
  const [verifications, setVerifications] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const verificationRes = await axios.get('http://localhost:5000/api/verification');
        processVerifications(verificationRes.data);
      } catch (error) {
        console.error('Failed to fetch verifications:', error);
      }

      try {
        const productRes = await axios.get('http://localhost:5000/api/products');
        setProducts(productRes.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchData();
  }, []);

  const processVerifications = (data) => {
    const approved = data.filter((v) => v.status === 'Approved').length;
    const rejected = data.filter((v) => v.status === 'Rejected').length;
    const pending = data.length - approved - rejected;

    setSummary({ total: data.length, approved, rejected, pending });

    const monthlyData = {};
    data.forEach((v) => {
      if (v.submittedAt) {
        const date = new Date(v.submittedAt);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort(
      (a, b) => new Date(`${a} 1`) - new Date(`${b} 1`)
    );

    setBarChartData({
      labels: sortedMonths,
      datasets: [
        {
          label: 'Verifications',
          data: sortedMonths.map((m) => monthlyData[m]),
          backgroundColor: '#3B82F6',
          borderRadius: 6,
        },
      ],
    });

    const recent = [...data]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
      .map((v) => ({
        name: v.sellerName,
        date: v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : 'N/A',
        status: v.status || 'Pending',
      }));

    setVerifications(recent);
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div className="report-container enhanced">
      <h1 className="report-title">📊 Seller Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        {[
          { title: 'Total Verifications', value: summary.total, color: 'blue' },
          { title: 'Approved', value: summary.approved, color: 'green' },
          { title: 'Rejected', value: summary.rejected, color: 'red' },
          { title: 'Pending', value: summary.pending, color: 'yellow' },
        ].map((item, index) => (
          <div key={index} className={`summary-card summary-${item.color}`}>
            <p>{item.title}</p>
            <h2>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-flex-container">
        <div className="chart-container">
          <h2 className="chart-title">📈 Monthly Verifications</h2>
          <Bar data={barChartData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2 className="chart-title">📋 Status Distribution</h2>
          <Pie
            data={{
              labels: ['Approved', 'Rejected', 'Pending'],
              datasets: [
                {
                  data: [summary.approved, summary.rejected, summary.pending],
                  backgroundColor: ['#22c55e', '#ef4444', '#facc15'],
                  hoverBackgroundColor: ['#16a34a', '#dc2626', '#ca8a04'],
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Recent Verifications */}
      <div className="table-container fade-in">
        <h2 className="table-title">🕒 Recent Seller Verifications</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {verifications.length > 0 ? (
              verifications.map((app, idx) => (
                <tr key={idx}>
                  <td>{app.name}</td>
                  <td>{app.date}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        app.status === 'Approved'
                          ? 'status-approved'
                          : app.status === 'Rejected'
                          ? 'status-rejected'
                          : 'status-pending'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No recent verifications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Table */}
      <div className="table-container fade-in" style={{ marginTop: '40px' }}>
        <h2 className="table-title">🛒 Product List</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5">No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.store}</td>
                  <td>{product.quantity}</td>
                  <td>₱{Object.values(product.sizes)[0]?.toFixed(2) || '0.00'}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>×</button>
            <div className="modal-header">
              <h2>{selectedProduct.name}</h2>
            </div>
            <div className="modal-body">
              {selectedProduct.image && (
                <img
                  src={`http://localhost:5000/uploads/${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  className="modal-image-large"
                />
              )}
              <div className="modal-details">
                <p><strong>Seller:</strong> {selectedProduct.store}</p>
                <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
                <p><strong>Price:</strong> ₱{Object.values(selectedProduct.sizes)[0]?.toFixed(2) || '0.00'}</p>
                <p><strong>Description:</strong></p>
                <p className="product-description">
                  {selectedProduct.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketvaliReport;
