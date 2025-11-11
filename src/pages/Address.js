import React, { useState } from 'react';
import './Address.css';

const Address = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Sample transaction data
  const transactions = [
    { id: 'ORD-2024-001', date: '2024-10-25', amount: '$129.99', status: 'delivered' },
    { id: 'ORD-2024-002', date: '2024-10-24', amount: '$49.99', status: 'shipped' },
    { id: 'ORD-2024-003', date: '2024-10-23', amount: '$299.99', status: 'processing' },
    { id: 'ORD-2024-004', date: '2024-10-22', amount: '$79.99', status: 'delivered' },
    { id: 'ORD-2024-005', date: '2024-10-20', amount: '$159.99', status: 'cancelled' },
    { id: 'ORD-2024-006', date: '2024-10-19', amount: '$89.99', status: 'delivered' },
    { id: 'ORD-2024-007', date: '2024-10-18', amount: '$199.99', status: 'delivered' },
    { id: 'ORD-2024-008', date: '2024-10-17', amount: '$39.99', status: 'processing' },
  ];

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="address-container">
      <div className="order-tracking-section">
        <div className="section-header">
          <h1 className="section-title">Order History</h1>
          <button className="transaction-history-btn" onClick={() => setShowModal(true)}>
            <svg className="transaction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            Transaction History
          </button>
        </div>
        
        {/* Order Status Steps - Updated to show Received/Not Received */}
        <div className="status-tracker">
          <div className="status-step completed">
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3z"/>
                <path d="M9 9h6v6H9z"/>
              </svg>
            </div>
            <div className="step-label">Ordered</div>
            <div className="step-date">Oct 25, 2024</div>
          </div>

          <div className="status-line completed"></div>

          <div className="status-step completed">
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <path d="M16 8l5 3-5 3"/>
              </svg>
            </div>
            <div className="step-label">Shipped</div>
            <div className="step-date">Oct 26, 2024</div>
          </div>

          <div className="status-line completed"></div>

          <div className="status-step completed">
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 6h15l3 6v6H1V6z"/>
                <circle cx="6" cy="19" r="2"/>
                <circle cx="16" cy="19" r="2"/>
              </svg>
            </div>
            <div className="step-label">Received</div>
            <div className="step-date">Oct 30, 2024</div>
          </div>
        </div>

        {/* Current Order Info - Removed order details */}
        <div className="current-order-info">
          <div className="order-detail">
            <span className="detail-label">Current Status:</span>
            <span className="detail-value received">Received</span>
          </div>
        </div>
      </div>

      {/* Transaction History Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="section-title">Transaction History</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            
            {/* Filters */}
            <div className="filter-controls">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="status-filters">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('processing')}
                >
                  Processing
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('shipped')}
                >
                  Shipped
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('delivered')}
                >
                  Delivered
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Transaction List */}
            <div className="transaction-list">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-header">
                      <span className="transaction-id">{transaction.id}</span>
                      <span className={`transaction-status ${getStatusClass(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                    <div className="transaction-body">
                      <div className="transaction-meta">
                        <span className="transaction-date">{transaction.date}</span>
                        <span className="transaction-amount">{transaction.amount}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No transactions found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;