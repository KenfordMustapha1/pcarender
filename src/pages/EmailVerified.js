import React from 'react';
import { Link } from 'react-router-dom';

function EmailVerified() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Email Verified Successfully!</h2>
      <p>You can now log in to your account.</p>
      <Link to="/login">
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#2e7d32',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>Go to Login</button>
      </Link>
    </div>
  );
}

export default EmailVerified;