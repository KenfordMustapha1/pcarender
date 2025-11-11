// export default App;
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from './Components/Navbar';
import Navbar2 from './Components/Navbar2';
import LandingPage from './Components/Landingpage';
import MarketPage from './Components/MarketPage';
import Marketconti from './Components/Marketconti';
import Storepage from './Components/Storepage';
import SignupPage from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

import { CartProvider } from './Components/CartContext';
import CartPage from './Components/CartPage';
import { AuthProvider } from './Components/AuthContext';

import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import AchievementDetail from './pages/AchievementDetail'; // Added import

import Permits from "./pages/Permits";

import RegistrationPage from "./pages/RegistrationPage";

import AccountPage from "./pages/AccountPage";
import Profile from './pages/Profile';
import Address from "./pages/Address";
import Privacy from "./pages/PrivacySetting";

import Notification from "./pages/NotificationSE";
import Sell from "./pages/Sell";
import Certi from "./pages/Certi"
import SellerDashboard from "./pages/SellerDashboard"
import SellerInbox from './Components/SellerInbox';


import AdminLogin from './pages/AdminLogin';  // New admin login page

import Marketvali from "./pages/Marketvali";
import Productverification from "./pages/Productverification";

import EmailVerified from "./pages/EmailVerified";
import VerifyEmail from "./pages/VerifyEmail.js";

import Report from "./pages/Report.js";
import ReportPage from "./pages/ReportPage.js";


import AllPermits from "./pages/AllPermits";
import PermitApplicationPage from "./pages/PermitApplicationPage";




function AppContent() {
  // State for normal user login (outside admin)
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('loggedIn') === 'true');

  // State for admin login
  const [adminUser, setAdminUser] = useState(null);

  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  // Sync normal user login with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('loggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handlers for normal user login/logout
  const handleLogin = () => {
    localStorage.setItem('loggedIn', 'true');
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
  };

  // Handlers for admin login/logout
  const handleAdminLogin = (user) => {
    setAdminUser(user);
    // Optional: persist admin login state, e.g.
    // localStorage.setItem('adminUser', JSON.stringify(user));
  };
  const handleAdminLogout = () => {
    setAdminUser(null);
    // Optional: clear persisted admin login
    // localStorage.removeItem('adminUser');
  };

  return (
    <>
      {/* Show Navbar or Navbar2 only on non-dashboard routes */}
      {!isDashboardRoute && (isLoggedIn ? <Navbar2 onLogout={handleLogout} /> : <Navbar />)}

      <Routes>
        {/* Public & normal user routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/marketconti" element={<Marketconti />} />
        <Route path="/store/:storeName" element={<Storepage />} />
        <Route path="/seller/inbox" element={<SellerInbox />} />
        <Route path="/cartpage" element={<CartPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/achievement/:id" element={<AchievementDetail />} /> {/* New route added */}

        <Route path="/account" element={<AccountPage />}>
          <Route path="my-profile" element={<Profile />} />
          <Route path="addresses" element={<Address />} />
          <Route path="privacy-settings" element={<Privacy />} />
          <Route path="notification-settings" element={<Notification/>} />
         <Route path="sell" element={<Sell />} />
        <Route path="certi" element={<Certi />} />
        <Route path="seller-dashboard" element={<SellerDashboard />} />

        </Route>

        <Route path="/registrationpage" element={<RegistrationPage />} />
        <Route path="/permit-application" element={<PermitApplicationPage />} />

        {/* Admin dashboard route with login check */}
        <Route path="/dashboard/*" element={
          adminUser ? (
            <Layout loggedInUser={adminUser} onLogout={handleAdminLogout} />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        }>
          {adminUser && (
            <>
              <Route index element={<Dashboard />} />
              <Route path="activities" element={<Activities />} />
             
              <Route path="permits" element={<Permits />} />
              <Route path="allpermits" element={<AllPermits />} />
              <Route path="report" element={<Report />} />
              <Route path="reportpage" element={<ReportPage />} />
              
              <Route path="marketvali" element={<Marketvali />} /> 
              <Route path="productverification" element={<Productverification />} />
            </>
          )}
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;