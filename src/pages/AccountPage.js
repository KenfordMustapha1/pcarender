import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './AccountPage.css';
import {
  FiUser,
  FiShield,
  FiPlusCircle,
  FiAward,
  FiHome,
  FiBox,
} from 'react-icons/fi';

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);

  // Check verification status
  useEffect(() => {
    const checkVerification = async () => {
      const savedEmail = localStorage.getItem('sellerEmail');
      if (!savedEmail) return;

      try {
        const res = await fetch(`http://localhost:5000/api/seller?email=${encodeURIComponent(savedEmail)}`);
        const data = await res.json();
        if (res.ok && data.exists && data.isApproved) {
          setIsVerified(true);
        }
      } catch (err) {
        console.error('Failed to check verification:', err.message);
      }
    };

    checkVerification();
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="app">
      <aside className="sidebar">
        <ul className="nav-list">
          <li>
            <span
              onClick={() => navigate('/account/my-profile')}
              className={isActive('/account/my-profile') ? 'active' : ''}
            >
              <FiUser className="icon" /> Profile
            </span>
          </li>
          <li>
            <span
              onClick={() => navigate('/account/addresses')}
              className={isActive('/account/addresses') ? 'active' : ''}
            >
              <FiBox className="icon" /> My Order
            </span>
          </li>
          <li>
            <span
              onClick={() => navigate('/account/privacy-settings')}
              className={isActive('/account/privacy-settings') ? 'active' : ''}
            >
              <FiShield className="icon" /> Privacy Settings
            </span>
          </li>
          <li>
            <span
              onClick={() => navigate('/account/sell')}
              className={`danger-item ${isActive('/account/sell') ? 'active' : ''}`}
            >
              <FiPlusCircle className="icon" /> Seller Verification
            </span>
          </li>

          {/* Conditionally render Seller Dashboard if verified */}
          {isVerified && (
            <li>
              <span
                onClick={() => navigate('/account/seller-dashboard')}
                className={isActive('/account/seller-dashboard') ? 'active' : ''}
              >
                <FiHome className="icon" /> Seller Dashboard
              </span>
            </li>
          )}

          <li>
            <span
              onClick={() => navigate('/account/certi')}
              className={`danger-item ${isActive('/account/certi') ? 'active' : ''}`}
            >
              <FiAward className="icon" /> Certificates
            </span>
          </li>
        </ul>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountPage;
