const crypto = require('crypto');
const Ride = require('../models/Ride'); // Adjust path to your Ride Mongoose model
const { transporter } = require('../config/mailer');

/**
 * Generates a secure, temporary tracking token for a ride.
 * @returns {string} 32-character random hex string
 */
const generateTrackingToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * @desc    Generate or retrieve a live web tracking link for an active trip
 * @route   POST /api/tracking/:rideId/generate-link
 * @access  Private (Customer or Driver)
 */
const generateTrackingLink = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    // 1. Fetch Ride
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    // 2. Authorization Check (Must be the customer or driver associated with the ride)
    const isCustomer = ride.customer && ride.customer.toString() === userId;
    const isDriver = ride.driver && ride.driver.toString() === userId;

    if (!isCustomer && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only generate tracking links for your active trips.',
      });
    }

    // 3. Ensure ride is in an trackable state
    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot generate tracking link for a ride that is already ${ride.status}.`,
      });
    }

    // 4. Generate or re-use existing tracking token
    if (!ride.trackingToken) {
      ride.trackingToken = generateTrackingToken();
      await ride.save();
    }

    const baseUrl = process.env.CLIENT_URL || 'https://spleaz.com';
    const trackingUrl = `${baseUrl}/track/${ride.trackingToken}`;

    return res.status(200).json({
      success: true,
      message: 'Tracking link generated successfully.',
      data: {
        rideId: ride._id,
        trackingToken: ride.trackingToken,
        trackingUrl,
        status: ride.status,
      },
    });
  } catch (error) {
    console.error('[Tracking Controller - Generate Link Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate tracking link.',
      error: error.message,
    });
  }
};

/**
 * @desc    Send live tracking link via email to emergency contact or friend
 * @route   POST /api/tracking/:rideId/share-email
 * @access  Private (Customer)
 */
const sendTrackingEmail = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;
    const { recipientEmail, recipientName } = req.body;

    // 1. Validation
    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email address is required.',
      });
    }

    // 2. Fetch Ride with customer details populated
    const ride = await Ride.findById(rideId).populate('customer', 'fullName phone');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    if (ride.customer?._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the rider can share live trip tracking via email.',
      });
    }

    // 3. Ensure tracking token exists
    if (!ride.trackingToken) {
      ride.trackingToken = generateTrackingToken();
      await ride.save();
    }

    const baseUrl = process.env.CLIENT_URL || 'https://spleaz.com';
    const trackingUrl = `${baseUrl}/track/${ride.trackingToken}`;
    const senderName = ride.customer.fullName || 'A Spleaz User';
    const contactName = recipientName ? recipientName.trim() : 'Friend';

    const fromName = process.env.FROM_NAME || 'Spleaz Safety';
    const fromEmail = process.env.FROM_EMAIL || 'no-reply@spleaz.com';

    // 4. Build Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
          .card { background: #ffffff; max-width: 520px; margin: 0 auto; padding: 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 1px solid #eeeeee; padding-bottom: 16px; }
          .header h2 { color: #111827; margin: 0; }
          .content { margin: 20px 0; color: #374151; line-height: 1.5; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; }
          .details { background: #f9fafb; padding: 14px; border-radius: 8px; font-size: 14px; margin-top: 16px; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>🚗 Live Trip Safety Tracking</h2>
          </div>
          
          <div class="content">
            <p>Hello <strong>${contactName}</strong>,</p>
            <p><strong>${senderName}</strong> has shared their real-time Spleaz ride status and live GPS location with you for safety tracking.</p>
            
            <div class="details">
              <p><strong>📍 Pickup:</strong> ${ride.pickupLocation?.address || 'Pickup Point'}</p>
              <p><strong>🏁 Destination:</strong> ${ride.dropoffLocation?.address || 'Destination'}</p>
              <p><strong>Status:</strong> ${ride.status.toUpperCase()}</p>
            </div>

            <div class="btn-container">
              <a href="${trackingUrl}" class="btn" target="_blank">Track Live Location</a>
            </div>

            <p style="font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${trackingUrl}" style="color: #2563eb;">${trackingUrl}</a></p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Spleaz Safety Team. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 5. Send Email
    const mailInfo = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      subject: `${senderName} shared a live Spleaz trip location with you`,
      html: htmlContent,
    });

    console.log(`[Tracking Controller]: Tracking email sent to ${recipientEmail} (ID: ${mailInfo.messageId})`);

    return res.status(200).json({
      success: true,
      message: `Live tracking email sent successfully to ${recipientEmail}.`,
      data: {
        recipientEmail,
        trackingUrl,
      },
    });
  } catch (error) {
    console.error('[Tracking Controller - Share Email Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send live tracking email.',
      error: error.message,
    });
  }
};

/**
 * @desc    Public access route to fetch live ride status using tracking token
 * @route   GET /api/tracking/public/:trackingToken
 * @access  Public
 */
const getPublicTripDetails = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const ride = await Ride.findOne({ trackingToken })
      .populate('customer', 'fullName')
      .populate('driver', 'fullName vehicle location heading rating');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired tracking link.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: ride.status,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        riderName: ride.customer?.fullName || 'Passenger',
        driver: ride.driver
          ? {
              fullName: ride.driver.fullName,
              vehicle: ride.driver.vehicle,
              location: ride.driver.location,
              heading: ride.driver.heading,
              rating: ride.driver.rating,
            }
          : null,
        updatedAt: ride.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Tracking Controller - Public Details Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracking details.',
      error: error.message,
    });
  }
};

const getRideLocation = async (req,res,next) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate('driver','location heading');
    if (!ride) return res.status(404).json({success:false,message:'Ride not found.'});
    const userId=String(req.user.id);
    if (String(ride.customer)!==userId && String(ride.driver?._id||ride.driver)!==userId) return res.status(403).json({success:false,message:'Unauthorized.'});
    const coords=ride.driver?.location?.coordinates || [0,0];
    return res.json({success:true,data:{rideId:String(ride._id),driverId:ride.driver?._id?String(ride.driver._id):'',latitude:Number(coords[1]||0),longitude:Number(coords[0]||0),heading:Number(ride.driver?.heading||0),estimatedArrivalMinutes:0}});
  } catch(error){ next(error); }
};

module.exports = {
  generateTrackingLink,
  sendTrackingEmail,
  getPublicTripDetails,
  getRideLocation,
};