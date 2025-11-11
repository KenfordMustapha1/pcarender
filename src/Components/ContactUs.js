// src/components/ContactUs.js
import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-us">
      <div className="contact-info">
        <h2>Contact Info</h2>
        <p>We are always happy to assist you</p>
      </div>
      <div className="contact-details">
        <div className="contact-column">
          <h3>Email Address</h3>
          <p>pca@gmail.com</p>
        </div>
        <div className="contact-column">
          <h3>Number</h3>
          <p>(808) 998-34256</p>
        </div>
        <div className="contact-column">
          <h3>Assistance hours:</h3>
          <p>Monday - Friday 6 am to 8 pm EST</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;