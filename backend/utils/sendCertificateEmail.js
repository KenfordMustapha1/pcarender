// utils/sendCertificateEmail.js
// This utility function sends an email with the generated certificate PDF as an attachment
// It uses the same transporter configured in server.js

const nodemailer = require('nodemailer');
const fs = require('fs');

/**
 * Sends an email with the certificate PDF attached
 * @param {string} email - Recipient's email address
 * @param {string} businessName - Name of the business for the email
 * @param {string} certificatePath - Path to the generated certificate PDF
 * @param {object} transporter - Nodemailer transporter instance
 * @returns {Promise<boolean>} - Success status of the email sending
 */
async function sendCertificateEmail(email, businessName, certificatePath, transporter) {
  try {
    // Read the certificate file to get its content
    const certificateBuffer = fs.readFileSync(certificatePath);

    // Create the email options object
    const mailOptions = {
      to: email,
      from: '"Philippine Coconut Authority" <pcaphilippinecoconutauthority@gmail.com>',
      subject: `PCA Registration Certificate - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Registration Approved</h2>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear Applicant,</p>
            <p style="font-size: 16px; color: #333;">
              We are pleased to inform you that your registration application for <strong>${businessName}</strong> has been <strong style="color: #28a745;">APPROVED</strong>.
            </p>
            <p style="font-size: 16px; color: #333;">
              Your official PCA Registration Certificate is attached to this email. Please keep it for your records.
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Business Name:</strong> ${businessName}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745;">Approved</span></p>
              <p style="margin: 5px 0;"><strong>Certificate:</strong> Attached to this email</p>
            </div>
            <p style="font-size: 16px; color: #333;">
              Congratulations! You may now proceed with your operations as a registered PCA entity.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br/>
              <strong>Philippine Coconut Authority</strong>
            </p>
          </div>
          <div style="background-color: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `PCA_Certificate_${businessName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          content: certificateBuffer,
        },
      ],
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`✅ Certificate email sent successfully to ${email}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending certificate email:', error);
    return false;
  }
}

module.exports = { sendCertificateEmail };