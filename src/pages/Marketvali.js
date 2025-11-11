import React, { useState, useEffect } from 'react';
import './Productverification.css'; 

const Marketvali = () => {
  const [verifications, setVerifications] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Dashboard stats
  const [stats, setStats] = useState({
    totalSellers: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    async function fetchVerifications() {
      try {
        const res = await fetch('http://localhost:5000/api/verification');
        if (!res.ok) throw new Error('Failed to fetch verifications');
        const data = await res.json();
        setVerifications(data);
        calculateStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVerifications();
  }, []);

  function calculateStats(sellers) {
    const pending = sellers.filter(s => s.status === 'Pending').length;
    const approved = sellers.filter(s => s.status === 'Approved').length;
    const rejected = sellers.filter(s => s.status === 'Rejected').length;

    setStats({
      totalSellers: sellers.length,
      pending,
      approved,
      rejected
    });
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3500);
  };

  const handleApprove = async (id, name) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/approve-seller/${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Approval failed');
      await res.json();
      setVerifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Approved' } : item))
      );
      setModalData(null);
      showToast(`Approved seller: ${name}`, 'success');
      calculateStats(verifications.map(v => v._id === id ? { ...v, status: 'Approved' } : v));
    } catch {
      showToast('Failed to approve seller.', 'error');
    }
  };

  const handleReject = async (id, name) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/reject-seller/${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Rejection failed');
      await res.json();
      setVerifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Rejected' } : item))
      );
      setModalData(null);
      showToast(`Rejected seller: ${name}`, 'error');
      calculateStats(verifications.map(v => v._id === id ? { ...v, status: 'Rejected' } : v));
    } catch {
      showToast('Failed to reject seller.', 'error');
    }
  };

  const filteredSellers = filter === 'All'
    ? verifications
    : verifications.filter(v => v.status === filter);

  if (loading) return <p className="pv-loading">Loading seller verifications...</p>;
  if (error) return <p className="pv-error-message">Error: {error}</p>;

  return (
    <div className="pv-container">
      <h1 className="pv-title">Seller Verification Dashboard</h1>

      {/* Stats Cards */}
      <div className="pv-stats-container">
        <div className="pv-stat-card pv-stat-total">
          <h3>Total Sellers</h3>
          <p className="pv-stat-number">{stats.totalSellers}</p>
        </div>
        <div className="pv-stat-card pv-stat-pending">
          <h3>Pending</h3>
          <p className="pv-stat-number">{stats.pending}</p>
        </div>
        <div className="pv-stat-card pv-stat-approved">
          <h3>Approved</h3>
          <p className="pv-stat-number">{stats.approved}</p>
        </div>
        <div className="pv-stat-card pv-stat-rejected">
          <h3>Rejected</h3>
          <p className="pv-stat-number">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pv-filter-tabs">
        <button 
          className={`pv-filter-tab ${filter === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilter('Pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`pv-filter-tab ${filter === 'Approved' ? 'active' : ''}`}
          onClick={() => setFilter('Approved')}
        >
          Approved ({stats.approved})
        </button>
        <button 
          className={`pv-filter-tab ${filter === 'Rejected' ? 'active' : ''}`}
          onClick={() => setFilter('Rejected')}
        >
          Rejected ({stats.rejected})
        </button>
        <button 
          className={`pv-filter-tab ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All ({stats.totalSellers})
        </button>
      </div>

      {/* Sellers Table */}
      {filteredSellers.length === 0 ? (
        <p className="pv-empty-message">No {filter.toLowerCase()} sellers found.</p>
      ) : (
        <div className="pv-table-wrapper">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => (
                <tr key={seller._id}>
                  <td>{seller.sellerName}</td>
                  <td>{seller.email}</td>
                  <td>{new Date(seller.submittedAt).toLocaleString()}</td>
                  <td>
                    <span
                      className={`pv-badge ${
                        seller.status === 'Approved'
                          ? 'pv-badge-approved'
                          : seller.status === 'Rejected'
                          ? 'pv-badge-rejected'
                          : 'pv-badge-pending'
                      }`}
                    >
                      {seller.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pv-btn pv-btn-view"
                      onClick={() => setModalData(seller)}
                    >
                      View
                    </button>
                    {seller.status === 'Pending' && (
                      <>
                        <button
                          className="pv-btn pv-btn-accept"
                          onClick={() => handleApprove(seller._id, seller.sellerName)}
                        >
                          Approve
                        </button>
                        <button
                          className="pv-btn pv-btn-reject"
                          onClick={() => handleReject(seller._id, seller.sellerName)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {seller.status === 'Rejected' && (
                      <button
                        className="pv-btn pv-btn-accept"
                        onClick={() => handleApprove(seller._id, seller.sellerName)}
                      >
                        Re-approve
                      </button>
                    )}
                    {seller.status === 'Approved' && (
                      <button
                        className="pv-btn pv-btn-reject"
                        onClick={() => handleReject(seller._id, seller.sellerName)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {modalData && (
        <div className="pv-modal-backdrop" onClick={() => setModalData(null)}>
          <div className="pv-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{modalData.sellerName}</h2>
            <p><strong>Email:</strong> {modalData.email}</p>
            <p><strong>Status:</strong> <span className={`pv-badge pv-badge-${modalData.status.toLowerCase()}`}>{modalData.status}</span></p>

            <div style={{ marginTop: '1.5rem' }}>
              <h3>ID Documents:</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <strong>Front ID:</strong>
                  <img 
                    src={modalData.frontIdUrl} 
                    alt="Front ID" 
                    style={{ width: '100%', marginTop: '8px', borderRadius: '8px', border: '1px solid #eee' }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <strong>Back ID:</strong>
                  <img 
                    src={modalData.backIdUrl} 
                    alt="Back ID" 
                    style={{ width: '100%', marginTop: '8px', borderRadius: '8px', border: '1px solid #eee' }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <strong>Certificate / Selfie:</strong>
                  <img 
                    src={modalData.selfieIdUrl} 
                    alt="Selfie/Registration" 
                    style={{ width: '100%', marginTop: '8px', borderRadius: '8px', border: '1px solid #eee' }} 
                  />
                </div>
              </div>
            </div>

            <button className="pv-btn pv-btn-cancel" onClick={() => setModalData(null)} style={{ marginTop: '1.5rem' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`pv-toast ${
          toast.visible ? 'pv-toast-show' : ''
        } ${toast.type === 'error' ? 'pv-toast-error' : 'pv-toast-success'}`}
      >
        {toast.message}
      </div>
    </div>
  );
};

export default Marketvali;