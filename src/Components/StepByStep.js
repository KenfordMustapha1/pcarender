import React from 'react';
import './StepByStep.css';

const StepByStep = () => {
  return (
    <section className="step-section">
      <div className="step-container">
        <h2 className="step-title">How to Apply: Step-by-Step Guide</h2>
        <div className="step-content">
          <div className="step-text">
            <ol>
              <li><strong>Visit the Registration Page</strong> – Access the online form in the Profile icon to start your application.</li>
              <li><strong>Fill in Your Details</strong> – Enter accurate personal and contact information.</li>
              <li><strong>Review Your Information</strong> – Carefully check your data for accuracy before submitting.</li>
              <li><strong>Review Your Application</strong> – Double-check all data before submission.</li>
              <li><strong>Submit Application</strong> – Click the submit button to send your form.</li>
              <li><strong>Wait for Confirmation</strong> – Receive updates via email or SMS regarding your application status.</li>
            </ol>
          </div>
          <div className="step-image">
            <img src="/images/stepbystepicon.png" alt="Step Guide Visual" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepByStep;
