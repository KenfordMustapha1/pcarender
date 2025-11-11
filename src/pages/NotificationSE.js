import { useState } from "react";
import "./PrivacySetting.css";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: false,
    productNews: false,
    appAlerts: true,
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const toggleSetting = (key, label) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    // Show the alert message
    setAlertMessage(`${label} notifications are turned ${newValue ? "ON" : "OFF"}.`);
    setShowAlert(true);

    // Hide the alert after 3 seconds
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="privacy-container">
      <h2 className="privacy-title">My Notification Settings</h2>
      <p className="privacy-description">
        Choose how you'd like to receive updates and alerts.
      </p>

      <div className="privacy-options">
        {[
          { key: "orderUpdates", label: "Order Updates" },
          { key: "promotions", label: "Promotional Offers" },
          { key: "productNews", label: "Product News" },
          { key: "appAlerts", label: "In-App Alerts" },
        ].map(({ key, label }) => (
          <div key={key} className="privacy-option">
            <label>{label}</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={() => toggleSetting(key, label)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        ))}
      </div>

      <p className="privacy-note">
        You can modify these settings anytime. We recommend enabling at least Order Updates to stay informed.
      </p>

      {showAlert && (
        <div className="custom-alert">
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
