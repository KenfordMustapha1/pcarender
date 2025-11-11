import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pcaImage from '../images/login-pca.jpg';
import axios from 'axios';
import './Signup.css';

axios.defaults.withCredentials = true;

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'weak';
    const mediumRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (strongRegex.test(pwd)) return 'strong';
    if (mediumRegex.test(pwd)) return 'medium';
    return 'weak';
  };

  const strength = getPasswordStrength(password);
  const strengthColor = {
    weak: '#e74c3c',
    medium: '#f39c12',
    strong: '#27ae60',
  };
  const strengthWidth = {
    weak: '33%',
    medium: '66%',
    strong: '100%',
  };

  const confirmMatch = confirmPassword === password && confirmPassword !== '';

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/signup', {
        name,
        email,
        password
      });

      if (res.data.redirect) {
        navigate(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <div className="signup-image-section">
          <img src={pcaImage} alt="PCA Event" className="signup-image" />
        </div>
        <div className="signup-form-section">
          <h2>Create an account</h2>
          {errorMessage && <p className="signup-error-message">{errorMessage}</p>}
          <form className="signup-form" onSubmit={handleSignup}>
            <div className="signup-form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              {password && (
                <>
                  <div className="signup-strength-bar-container">
                    <div
                      className="signup-strength-bar"
                      style={{
                        width: strengthWidth[strength],
                        backgroundColor: strengthColor[strength],
                      }}
                    />
                  </div>
                  {['weak', 'medium', 'strong'].includes(strength) && (
                    <p style={{ color: strengthColor[strength], marginTop: '5px', fontWeight: 'bold' }}>
                      Password strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="signup-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
              {confirmPassword && (
                <div className="signup-strength-bar-container">
                  <div
                    className="signup-strength-bar"
                    style={{
                      width: confirmMatch ? '100%' : '50%',
                      backgroundColor: confirmMatch ? '#27ae60' : '#e74c3c',
                    }}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
          <div className="signup-login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
