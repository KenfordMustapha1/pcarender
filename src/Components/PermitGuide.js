import React from "react";
import "./PermitGuide.css";
import permitImg from "../images/image3.png"; // Replace with your actual image

const PermitGuide = () => {
  return (
    <section className="permit-guide" id="permit-guide">
      <div className="permit-header-section">
        <div className="permit-image">
          <img src={permitImg} alt="Permit Application Process" />
        </div>
        <div className="permit-content">
          <h2>Permit Application Guide</h2>
          <p>
            Follow these steps to apply for a coconut-related permit through the Philippine Coconut Authority (PCA). This guide is intended to assist farmers, manufacturers, and entrepreneurs in securing the necessary authorization to operate legally and efficiently.
          </p>
        </div>
      </div>

      <div className="permit-steps">
        <h3>Step-by-Step Process</h3>
        <ol>
          <li><strong>Step 1:</strong> Visit your PCA Regional Office or log in to the PCA online portal.</li>
          <li><strong>Step 2:</strong> Fill out the application form with accurate information.</li>
          <li><strong>Step 3:</strong> Prepare and submit the required documents:
            <ul>
              <li>Valid government-issued ID</li>
              <li>Proof of land ownership or tenancy</li>
              <li>Business registration (if applicable)</li>
            </ul>
          </li>
          <li><strong>Step 4:</strong> Submit your application for review.</li>
          <li><strong>Step 5:</strong> Wait for verification and evaluation by PCA personnel.</li>
          <li><strong>Step 6:</strong> Receive your approved permit via email or physical pickup.</li>
        </ol>
      </div>

      <div className="permit-contact">
        <h3>Need Help?</h3>
        <p>
          For further assistance, please contact your nearest PCA office or email us at <a href="mailto:info@pca.gov.ph">info@pca.gov.ph</a>.
        </p>
      </div>
    </section>
  );
};

export default PermitGuide;
