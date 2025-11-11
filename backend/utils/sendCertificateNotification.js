// utils/sendCertificateNotification.js
// This utility function combines the original notification with certificate generation and sending
// It uses the generateCertificate and sendCertificateEmail utilities

const { generateCertificate } = require('./generateCertificate');
const { sendCertificateEmail } = require('./sendCertificateEmail');

/**
 * Sends an email notification with certificate attachment when application is accepted
 * For rejections, sends the original notification without certificate
 * @param {string} email - Recipient's email address
 * @param {string} businessName - Name of the business
 * @param {string} status - 'accepted' or 'rejected'
 * @param {string} applicationType - Type of application
 * @param {object} registrationData - Full registration object (needed for certificate generation)
 * @param {object} transporter - Nodemailer transporter instance
 * @param {string} certificateDir - Directory to save certificates (optional)
 * @returns {Promise<boolean>} - Success status
 */
async function sendCertificateNotification(email, businessName, status, applicationType, registrationData, transporter, certificateDir = './certificates') {
  try {
    if (status === 'accepted') {
      // Generate the certificate PDF
      const certificatePath = await generateCertificate(registrationData, certificateDir);

      // Send the email with the certificate attached
      const emailSent = await sendCertificateEmail(email, businessName, certificatePath, transporter);

      // Clean up the certificate file after sending (optional - you might want to keep them for records)
      // const fs = require('fs');
      // if (fs.existsSync(certificatePath)) {
      //   fs.unlinkSync(certificatePath);
      //   console.log(`Certificate file deleted after sending: ${certificatePath}`);
      // }

      return emailSent;
    } else if (status === 'rejected') {
      // For rejections, use the original notification logic without certificate
      const statusText = 'Rejected';
      const statusColor = '#dc3545';

      const mailOptions = {
        to: email,
        from: '"Philippine Coconut Authority" <pcaphilippinecoconutauthority@gmail.com>',
        subject: `Application ${statusText} - PCA Registration`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Application ${statusText}</h2>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
              <p style="font-size: 16px; color: #333;">Dear Applicant,</p>
              <p style="font-size: 16px; color: #333;">
                We are writing to inform you that your <strong>${applicationType}</strong> application for <strong>${businessName}</strong> has been <strong style="color: ${statusColor};">${statusText}</strong>.
              </p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Business Name:</strong> ${businessName}</p>
                <p style="margin: 5px 0;"><strong>Application Type:</strong> ${applicationType}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
              </div>
              <p style="font-size: 16px; color: #333;">If you have any questions regarding this decision, please contact our office.</p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br/>
                <strong>Philippine Coconut Authority</strong>
              </p>
            </div>
            <div style="background-color: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Rejection notification email sent to ${email}`);
      return true;
    } else {
      console.error('Invalid status provided to sendCertificateNotification:', status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in sendCertificateNotification:', error);
    return false;
  }
}

module.exports = { sendCertificateNotification };