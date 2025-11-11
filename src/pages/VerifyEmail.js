import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

axios.defaults.withCredentials = true;

function VerifyEmail() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMsg('Missing email address.');
      return;
    }

    if (timeLeft <= 0) {
      setMsg('⏰ Code expired. Please request a new code.');
      return;
    }

    if (attempts >= 3) {
      setMsg('❌ Too many incorrect attempts. Please request a new code.');
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setMsg('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const res = await axios.post('http://localhost:5000/verify-code', { email, code });

      if (res.data.success) {
        setMsg('✅ Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          setMsg('❌ Too many incorrect attempts. Please request a new code.');
        } else {
          setMsg(`Incorrect code. Attempts left: ${3 - newAttempts}`);
        }
      }
    } catch (err) {
      console.error(err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setMsg('❌ Too many incorrect attempts. Please request a new code.');
      } else {
        setMsg(`Incorrect code. Attempts left: ${3 - newAttempts}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    try {
      await axios.post('http://localhost:5000/resend-code', { email });
      setMsg('📩 A new verification code has been sent to your email.');
      setAttempts(0);
      setTimeLeft(60); // reset timer
      setCode('');
    } catch (error) {
      console.error(error);
      setMsg('Failed to resend verification code. Try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Email Verification</h2>
        <p style={styles.subtext}>
          A 6-digit code was sent to <b>{email}</b>. Please enter it below:
        </p>

        {timeLeft > 0 ? (
          <p style={{ color: '#555', marginBottom: '15px' }}>
            ⏱ Code expires in <b>{timeLeft}s</b>
          </p>
        ) : (
          <p style={{ color: 'red', marginBottom: '15px' }}>
            ⏰ Code expired. Please request a new one.
          </p>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            style={styles.input}
            placeholder="Enter code"
            required
            disabled={attempts >= 3 || timeLeft <= 0}
          />
          <button
            type="submit"
            style={{
              ...styles.button,
              background:
                attempts >= 3 || timeLeft <= 0 ? '#9ca3af' : '#26df29ff',
              cursor:
                attempts >= 3 || timeLeft <= 0 ? 'not-allowed' : 'pointer',
            }}
            disabled={loading || attempts >= 3 || timeLeft <= 0}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {msg && (
          <p
            style={{
              ...styles.message,
              color: msg.includes('✅') ? 'green' : 'red',
            }}
          >
            {msg}
          </p>
        )}

        {(attempts >= 3 || timeLeft <= 0) && (
          <button onClick={handleRequestNewCode} style={styles.resendButton}>
            🔁 Request New Code
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  card: {
    background: '#fff',
    padding: '40px 30px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    textAlign: 'center',
  },
  heading: {
    marginBottom: '15px',
    color: '#333',
  },
  subtext: {
    marginBottom: '15px',
    fontSize: '15px',
    color: '#555',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    fontSize: '18px',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '6px',
    letterSpacing: '5px',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    background: '#26df29ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
  },
  resendButton: {
    marginTop: '20px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  message: {
    marginTop: '20px',
    fontWeight: '500',
  },
};

export default VerifyEmail;
