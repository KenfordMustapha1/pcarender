import React, { useState } from "react";

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@example.com" && password === "admin123") {
      onLogin({ email });
      setError("");
    } else {
      setError("Invalid email or password");
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const getInputStyle = (focused) => ({
    padding: "0.5rem 0",
    marginBottom: "1.1rem",
    border: "none",
    borderBottom: `2px solid ${focused ? "#018844" : "#ccc"}`, // green on focus
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    outline: "none",
    backgroundColor: "transparent",
  });

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            style={getInputStyle(emailFocused)}
            autoComplete="username"
            autoFocus
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />

          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={getInputStyle(passwordFocused)}
            autoComplete="current-password"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />

          {error && (
            <div role="alert" style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isFormValid ? 1 : 0.6,
              cursor: isFormValid ? "pointer" : "not-allowed",
            }}
            disabled={!isFormValid}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2.5rem 3rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "1.5rem",
    fontWeight: "600",
    fontSize: "1.8rem",
    color: "#333",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "0.4rem",
    fontWeight: "500",
    fontSize: "0.9rem",
    color: "#555",
  },
  input: {
    padding: "0.75rem 1rem",
    marginBottom: "1.2rem",
    borderRadius: "5px",
    border: "1.5px solid #ccc",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    width: "100%",  // <-- This makes input width match button width
    boxSizing: "border-box",  // ensures padding included in width
  },
  error: {
    color: "#d93025",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  button: {
    padding: "0.85rem",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#018844", // green color
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    width: "100%",  // button full width too
  },
};

export default AdminLogin;
