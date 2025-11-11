import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css'; // Update this import
import image3 from '../images/image3.png';
import { FiHome, FiActivity, FiFileText, FiClipboard, FiLogOut, FiUsers, FiSettings } from 'react-icons/fi';

const Layout = ({ loggedInUser, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!loggedInUser) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <img src={image3} alt="PCA Admin" className={styles.logoImg} />
          <h2 className={styles.logoTitle}>PCA Admin Panel</h2>
        </div>
        
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard" 
                end 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiHome className={styles.navIcon} /> 
                <span className={styles.navText}>Dashboard</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/activities" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiActivity className={styles.navIcon} /> 
                <span className={styles.navText}>Activities</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/permits" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiFileText className={styles.navIcon} /> 
                <span className={styles.navText}>Permits</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/allpermits" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiFileText className={styles.navIcon} /> 
                <span className={styles.navText}>All Permits</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/report" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiClipboard className={styles.navIcon} /> 
                <span className={styles.navText}>Report</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/marketvali" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiUsers className={styles.navIcon} /> 
                <span className={styles.navText}>Seller Verification</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/productverification" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiSettings className={styles.navIcon} /> 
                <span className={styles.navText}>Product Verification</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink 
                to="/dashboard/reportpage" 
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <FiActivity className={styles.navIcon} /> 
                <span className={styles.navText}>Seller Report</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <p className={styles.userText}>
              <span className={styles.greeting}>Welcome,</span><br />
              <span className={styles.username}>{loggedInUser.username}</span><br />
              <span className={styles.role}>({loggedInUser.role})</span>
            </p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <FiLogOut className={styles.logoutIcon} /> 
            <span className={styles.logoutText}>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;