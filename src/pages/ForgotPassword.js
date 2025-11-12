import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse Login.css for consistent styling
import loginImage from '../images/login-pca.jpg';
import axios from 'axios';

// Set the base URL for axios based on environment
// In development, you might set REACT_APP_BACKEND_URL=http://localhost:5000 in your .env file
// In production, you would set it to your deployed backend URL, or leave it empty if backend is on the same domain
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Timer for code expiry
  React.useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      // Use the dynamic BACKEND_URL
      const res = await axios.post(`${BACKEND_URL}/forgot-password`, { email });
      setMessage(res.data.msg);
      setStep(2);
      setCountdown(600); // Reset countdown
      setCanResend(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Use the dynamic BACKEND_URL
      const res = await axios.post(`${BACKEND_URL}/verify-reset-code`, { email, code });
      if (res.data.success) {
        setStep(3);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Use the dynamic BACKEND_URL
      const res = await axios.post(`${BACKEND_URL}/reset-password`, {
        email,
        code,
        newPassword
      });
      
      if (res.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      // Use the dynamic BACKEND_URL
      await axios.post(`${BACKEND_URL}/resend-reset-code`, { email });
      setMessage('New code sent to your email!');
      setCountdown(600);
      setCanResend(false);
    } catch (err) {
      setErrorMessage('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-container">
      <div className="form-wrapper">
        <h1 className="form-title">
          {step === 1 && 'Forgot Password?'}
          {step === 2 && 'Enter Reset Code'}
          {step === 3 && 'Create New Password'}
        </h1>
        <p className="login-subtitle">
          {step === 1 && 'Enter your email to receive a reset code'}
          {step === 2 && 'Check your email for the 6-digit code'}
          {step === 3 && 'Enter your new password'}
        </p>

        {/* Step 1: Request Reset Code */}
        {step === 1 && (
          <form className="form" onSubmit={handleRequestReset}>
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
                disabled={loading}
              />
            </div>

            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <Link to="/login" className="link">Back to Login</Link>
            </div>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form className="form" onSubmit={handleVerifyCode}>
            <div className="input-group">
              <label htmlFor="code" className="input-label">6-Digit Code</label>
              <input
                type="text"
                id="code"
                className="input-field"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength="6"
                disabled={loading}
                style={{ letterSpacing: '5px', fontSize: '18px', textAlign: 'center' }}
              />
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                Code expires in: <strong>{formatTime(countdown)}</strong>
              </p>
            </div>

            {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}

            <button type="submit" className="primary-button" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  disabled={loading}
                >
                  Resend Code
                </button>
              ) : (
                <span style={{ color: '#999' }}>Resend available after expiry</span>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form className="form" onSubmit={handleResetPassword}>
            <div className="input-group">
              <label htmlFor="newPassword" className="input-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="input-field"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                disabled={loading}
              />
            </div>

            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>

      {/* Image only shows on desktop, hidden on mobile */}
      <div className="half-section hidden-on-mobile">
        <img src={loginImage} alt="Forgot Password Background" className="full-image" />
      </div>
    </div>
  );
}

export default ForgotPassword;
