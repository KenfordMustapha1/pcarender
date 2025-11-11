import { useState } from "react";

// Independent Alert Component
const AlertComponent = ({ message, show }) => {
  if (!show) return null;
  
  return (
    <div className="alert-top-right">
      {message}
      <style jsx global>{`
        .alert-top-right {
          position: fixed;
          top: 120px; /* Further below the top */
          right: 20px;
          background-color: transparent;
          color: #27ae60;
          padding: 18px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          z-index: 9999;
          box-shadow: 0 8px 20px rgba(39, 174, 96, 0.25);
          animation: fadeInOut 4s ease-out forwards;
          white-space: nowrap;
          min-width: 280px;
          max-width: 360px;
          overflow: hidden;
          text-overflow: ellipsis;
          border-left: 6px solid #27ae60;
          backdrop-filter: blur(6px);
          background-color: rgba(255, 255, 255, 0.99);
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

const Privacy = () => {
  const [settings, setSettings] = useState({
    profileVisible: true,
    allowContact: true,
    shareWithVendors: true,
    promoEmails: false,
    trackUsage: false,
    saveFormData: true,
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Toggle setting with alert message
  const toggleSetting = (key, label) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    // Show alert message for toggles
    setAlertMessage(`${label} ${newValue ? "enabled" : "disabled"}`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  return (
    <div className="privacy-container">
      <h2 className="privacy-title">My Privacy Settings</h2>
      <p className="privacy-description">
        Control how your information is used, shared, and stored.
      </p>

      <div className="privacy-options">
        <div className="privacy-option">
          <label>Notification</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.allowContact}
              onChange={() => toggleSetting("allowContact", "Notifications")}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="privacy-option">
          <label>Message Notification</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.shareWithVendors}
              onChange={() =>
                toggleSetting("shareWithVendors", "Message Notifications")
              }
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="privacy-option">
          <label>Receive promotional emails</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.promoEmails}
              onChange={() => toggleSetting("promoEmails", "Promotional emails")}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="privacy-option">
          <label>Allow usage tracking for analytics</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.trackUsage}
              onChange={() => toggleSetting("trackUsage", "Usage tracking")}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="privacy-option">
          <label>Save my form data for future use</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.saveFormData}
              onChange={() => toggleSetting("saveFormData", "Form data saving")}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <p className="privacy-note">
        Note: We do not process payments. Your data is shared only with vendors
        involved in your order. You can update these preferences anytime.
      </p>

      {/* Independent Alert Component */}
      <AlertComponent message={alertMessage} show={showAlert} />
      
      <style jsx>{`
        .privacy-container {
          max-width: 1300px;
          margin: 40px auto;
          padding: 32px;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
        }

        .privacy-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #2c3e50;
        }

        .privacy-description {
          font-size: 16px;
          color: #7f8c8d;
          margin-bottom: 24px;
        }

        .privacy-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .privacy-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 70px;
          height: 38px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 38px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 30px;
          width: 30px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #28a745;
        }

        input:checked + .slider:before {
          transform: translateX(32px);
        }

        .privacy-note {
          margin-top: 32px;
          font-size: 14px;
          color: #7f8c8d;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default Privacy;