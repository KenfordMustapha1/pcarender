// src/pages/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import './Login.css';
import loginImage from '../images/login-pca.jpg';
import axios from 'axios';

function Login() { // ✅ Removed onLogin prop — not needed
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setShowModal(true);
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (res.data.msg === 'Login successful') {
        // ✅ Save user data
        localStorage.setItem('email', email);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userId', res.data.user._id);

        // ✅ Update auth context
        authLogin({
          email: email,
          id: res.data.user._id,
          name: res.data.user.name || email.split('@')[0],
        });

        // ✅ Clean up guest cart (optional but recommended)
        try {
          const allCarts = JSON.parse(localStorage.getItem('allCarts')) || {};
          delete allCarts['guest'];
          localStorage.setItem('allCarts', JSON.stringify(allCarts));
        } catch (e) {
          console.warn('Could not clean guest cart');
        }

        // ✅ SHOW SUCCESS THEN HARD RELOAD
        setShowSuccessPopup(true);
        setTimeout(() => {
          window.location.href = '/'; // 🔥 FULL PAGE RELOAD
        }, 1500);
      } else {
        setErrorMessage('Wrong username or password');
      }
    } catch (err) {
      setErrorMessage('Wrong username or password');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="flex-container">
      <div className="form-wrapper">
        <h1 className="form-title">Welcome Back!</h1>
        <p className="login-subtitle">Please sign in to continue</p>

        <form className="form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || showSuccessPopup}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || showSuccessPopup}
            />
            {errorMessage && (
              <p
                className="error-message"
                style={{ color: 'red', marginTop: '5px', fontSize: '0.9rem' }}
                role="alert"
              >
                {errorMessage}
              </p>
            )}
            <div className="forgot-password-link">
              <Link to="/forgot-password" className="link">Forgot Password?</Link>
            </div>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              disabled={loading || showSuccessPopup}
            />
            <label htmlFor="terms">
              I agree to all <Link to="/terms" className="link">Terms & Conditions</Link>
            </label>
          </div>

          <button type="submit" className="primary-button" disabled={loading || showSuccessPopup}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      {/* Image only shows on desktop, hidden on mobile */}
      <div className="half-section hidden-on-mobile">
        <img src={loginImage} alt="Login Background" className="full-image" />
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <button className="close-button" onClick={closeModal} aria-label="Close modal">
              ×
            </button>
            <h2 className="modal-title">Terms Required</h2>
            <p className="modal-text">You must accept the Terms & Conditions before logging in.</p>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup-backdrop">
          <div className="popup-box">
            <h2>Login Successful</h2>
            <p>Welcome back! Redirecting you shortly...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;