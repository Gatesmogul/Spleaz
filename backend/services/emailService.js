const nodemailer = require('nodemailer');

/**
 * Creates and configures Nodemailer Transporter
 * Utilizes environment variables for secure SMTP configuration
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends a live trip safety tracking link to a customer or emergency contact
 *
 * @param {Object} options
 * @param {string} options.toEmail - Recipient email address
 * @param {string} options.customerName - Name of the customer
 * @param {string} options.trackingUrl - Web tracking URL generated for the ride
 * @param {string} options.pickupAddress - Pickup location address
 * @param {string} options.dropoffAddress - Destination address
 * @param {string} [options.driverName] - Name of the driver (if assigned)
 * @returns {Promise<Object>} Nodemailer send result
 */
const sendTrackingLinkEmail = async ({
  toEmail,
  customerName,
  trackingUrl,
  pickupAddress,
  dropoffAddress,
  driverName = 'Assigned Spleaz Driver',
}) => {
  if (!toEmail || !trackingUrl) {
    throw new Error('Recipient email and tracking URL are required to send tracking link.');
  }

  const transporter = createTransporter();

  const appName = process.env.APP_NAME || 'Spleaz';
  const fromEmail = process.env.FROM_EMAIL || `"Spleaz Safety Team" <no-reply@spleaz-app.onrender.com>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Spleaz Live Trip Tracking Link</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { background-color: #121212; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; color: #38ef7d; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { background-color: #11998e; background-image: linear-gradient(to right, #11998e, #38ef7d); color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(56, 239, 125, 0.3); }
        .route-box { background-color: #f8f9fa; border-left: 4px solid #11998e; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0; }
        .footer { background-color: #f4f6f8; padding: 20px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SPLEAZ SAFETY</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Your ride has been successfully booked! For your safety and peace of mind, you can track your trip in real time or share this live link with friends and family.</p>
          
          <div class="route-box">
            <p style="margin: 0 0 8px 0;"><strong>Pickup:</strong> ${pickupAddress}</p>
            <p style="margin: 0 0 8px 0;"><strong>Destination:</strong> ${dropoffAddress}</p>
            <p style="margin: 0;"><strong>Driver:</strong> ${driverName}</p>
          </div>

          <div class="btn-container">
            <a href="${trackingUrl}" target="_blank" class="btn">Track Live Ride Progress</a>
          </div>

          <p style="font-size: 13px; color: #666666;">If the button above does not work, copy and paste this link into your browser:<br>
          <a href="${trackingUrl}" style="color: #11998e;">${trackingUrl}</a></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>If you did not request this ride, please contact our support immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: `Live Trip Tracking Link - ${appName}`,
    text: `Hello ${customerName},\n\nTrack your Spleaz ride in real time here: ${trackingUrl}\n\nPickup: ${pickupAddress}\nDestination: ${dropoffAddress}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Tracking email sent to ${toEmail} - MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email Service Error]: Failed to send tracking link email:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = {
  sendTrackingLinkEmail,
};
