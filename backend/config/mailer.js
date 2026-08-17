const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transport using SMTP settings
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS,
  },
  pool: true, // Use pooled connections for high volume receipt delivery
  maxConnections: 5,
  maxMessages: 100,
});

/**
 * Verify SMTP Transport Connection on startup
 */
const verifyMailerConnection = async () => {
  try {
    await transporter.verify();
    console.log('[Mailer Config]: SMTP transporter verified successfully.');
  } catch (error) {
    console.error('[Mailer Config Error]: Failed to connect to SMTP server:', error.message);
  }
};

/**
 * Sends a ride receipt email containing route tracking details and trip cost breakdown.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.riderName - Passenger's full name
 * @param {string} options.tripId - Unique ride reference ID
 * @param {string} options.pickupLocation - Pickup address
 * @param {string} options.dropoffLocation - Dropoff address
 * @param {string} options.fare - Formatted fare (e.g., "$24.50" or "₦3,500")
 * @param {string} [options.mapStaticUrl] - Optional URL to static Google Map polyline image
 */
const sendRideReceiptEmail = async ({
  to,
  riderName,
  tripId,
  pickupLocation,
  dropoffLocation,
  fare,
  mapStaticUrl,
}) => {
  const fromName = process.env.FROM_NAME || 'Spleaz Rides';
  const fromEmail = process.env.FROM_EMAIL || 'no-reply@spleaz.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .card { background: #ffffff; max-width: 550px; margin: 0 auto; padding: 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 1px solid #eeeeee; padding-bottom: 16px; }
        .header h2 { color: #111827; margin: 0; }
        .trip-details { margin: 20px 0; }
        .route-point { margin-bottom: 12px; }
        .label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 15px; color: #1f2937; margin-top: 2px; }
        .fare-box { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px; }
        .fare-amount { font-size: 24px; font-weight: bold; color: #059669; }
        .map-img { width: 100%; border-radius: 8px; margin-top: 16px; }
        .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>Thanks for riding with Spleaz!</h2>
          <p style="color: #6b7280; font-size: 13px;">Trip ID: ${tripId}</p>
        </div>
        
        <div class="trip-details">
          <p>Hi <strong>${riderName}</strong>, here is your trip receipt and route overview.</p>
          
          <div class="route-point">
            <div class="label">📍 Pickup Location</div>
            <div class="value">${pickupLocation}</div>
          </div>
          
          <div class="route-point">
            <div class="label">🏁 Dropoff Location</div>
            <div class="value">${dropoffLocation}</div>
          </div>

          ${
            mapStaticUrl
              ? `<img src="${mapStaticUrl}" alt="Route Map" class="map-img" />`
              : ''
          }

          <div class="fare-box">
            <div class="label">Total Fare Paid</div>
            <div class="fare-amount">${fare}</div>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Spleaz Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: `Your Spleaz Trip Receipt [${tripId}]`,
      html: htmlContent,
    });

    console.log(`[Mailer]: Receipt sent successfully to ${to} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Mailer Error]: Failed to send receipt email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = {
  transporter,
  verifyMailerConnection,
  sendRideReceiptEmail,
};