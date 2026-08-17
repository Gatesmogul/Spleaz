const Ride = require('../models/Ride');
const User = require('../models/User');
const { getDistanceAndDuration } = require('../config/googleMaps');
const { getIO } = require('../config/socket');

// ==========================================
// PRICING ALGORITHM CONFIGURATION
// ==========================================
const PRICING = {
  BASE_FARE: 800,        // Flat base rate (e.g., ₦800)
  PER_KM_RATE: 150,      // Rate per kilometer (e.g., ₦150/km)
  PER_MINUTE_RATE: 30,   // Rate per minute (e.g., ₦30/min)
  SURGE_MULTIPLIER: 1.0, // Dynamic multiplier
  MINIMUM_FARE: 1200,    // Floor price for any trip
  COMMISSION_RATE: 0.15, // 15% platform commission
};

/**
 * @desc    Calculate upfront fare based on pickup and dropoff coordinates
 * @route   POST /api/v1/rides/fare
 * @access  Private (Customer)
 */
const calculateUpfrontFare = async (req, res, next) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        message: 'Both pickup and dropoff coordinates are required.',
      });
    }

    // 1. Fetch exact distance and duration from Google Maps API
    const routeData = await getDistanceAndDuration([pickup], [dropoff]);

    // 2. Convert raw values
    const distanceInKm = routeData.distanceInMeters / 1000;
    const durationInMinutes = routeData.durationInSeconds / 60;

    // 3. Upfront Pricing Algorithm
    let estimatedFare =
      PRICING.BASE_FARE +
      distanceInKm * PRICING.PER_KM_RATE +
      durationInMinutes * PRICING.PER_MINUTE_RATE;

    // 4. Apply Surge and Minimum Fare rules
    estimatedFare = estimatedFare * PRICING.SURGE_MULTIPLIER;
    if (estimatedFare < PRICING.MINIMUM_FARE) {
      estimatedFare = PRICING.MINIMUM_FARE;
    }

    const finalFare = Math.ceil(estimatedFare);

    return res.status(200).json({
      success: true,
      message: 'Fare calculated successfully.',
      data: {
        fare: finalFare,
        distanceText: routeData.distanceText,
        durationText: routeData.durationText,
        distanceInKm: parseFloat(distanceInKm.toFixed(2)),
        durationInMinutes: Math.round(durationInMinutes),
      },
    });
  } catch (error) {
    console.error('[Ride Controller - Calculate Fare Error]:', error);
    next(error);
  }
};

/**
 * @desc    Request a new trip
 * @route   POST /api/v1/rides/request
 * @access  Private (Customer)
 */
const requestTrip = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const {
      pickupLocation,
      dropoffLocation,
      fareAmount,
      distanceText,
      durationText,
    } = req.body;

    if (!pickupLocation || !dropoffLocation || !fareAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required trip details.',
      });
    }

    // Prevent customer from requesting multiple overlapping rides
    const activeRide = await Ride.findOne({
      customer: customerId,
      status: { $in: ['pending', 'accepted', 'arrived', 'in_progress'] },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride request or ongoing trip.',
      });
    }

    // Create Ride Record
    const newRide = await Ride.create({
      customer: customerId,
      pickupLocation,
      dropoffLocation,
      fare: fareAmount,
      distance: distanceText || '0 km',
      duration: durationText || '0 mins',
      status: 'pending',
    });

    // Populate customer info for broadcast payload
    await newRide.populate('customer', 'fullName phone rating profilePictureUrl');

    // Broadcast the new ride request to online drivers via Socket.io
    const io = getIO();
    io.emit('new_ride_request', {
      rideId: newRide._id,
      pickupLocation: newRide.pickupLocation,
      dropoffLocation: newRide.dropoffLocation,
      fare: newRide.fare,
      distance: newRide.distance,
      duration: newRide.duration,
      customer: newRide.customer,
      timestamp: newRide.createdAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Trip requested successfully. Searching for nearby drivers...',
      data: newRide,
    });
  } catch (error) {
    console.error('[Ride Controller - Request Trip Error]:', error);
    next(error);
  }
};

/**
 * @desc    Driver accepts a pending trip
 * @route   PUT /api/v1/rides/:rideId/accept
 * @access  Private (Driver)
 */
const acceptTrip = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This ride is no longer available.',
      });
    }

    // Assign driver and update status
    ride.driver = driverId;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();

    await ride.populate([
      { path: 'customer', select: 'fullName phone rating profilePictureUrl' },
      { path: 'driver', select: 'fullName phone vehicle rating profilePictureUrl' },
    ]);

    // Notify ride room via Socket.io
    const io = getIO();
    const room = `ride_${rideId}`;

    io.in(room).emit('ride_accepted', {
      rideId,
      status: 'accepted',
      driver: ride.driver,
      timestamp: ride.acceptedAt,
    });

    return res.status(200).json({
      success: true,
      message: 'Trip accepted successfully.',
      data: ride,
    });
  } catch (error) {
    console.error('[Ride Controller - Accept Trip Error]:', error);
    next(error);
  }
};

/**
 * @desc    Update trip status (arrived, in_progress, completed)
 * @route   PUT /api/v1/rides/:rideId/status
 * @access  Private (Driver)
 */
const updateTripStatus = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;
    const { status } = req.body;

    const validStatuses = ['arrived', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You are not assigned to this ride.',
      });
    }

    ride.status = status;

    // Track state timestamps and calculate earnings upon completion
    if (status === 'arrived') {
      ride.arrivedAt = new Date();
    } else if (status === 'in_progress') {
      ride.startedAt = new Date();
    } else if (status === 'completed') {
      ride.completedAt = new Date();

      // Calculate commission & net driver earnings
      const commission = Math.round(ride.fare * PRICING.COMMISSION_RATE);
      const earnings = ride.fare - commission;

      ride.commissionAmount = commission;
      ride.driverEarnings = earnings;

      // Update Driver Profile metrics
      await User.findByIdAndUpdate(driverId, {
        $inc: {
          totalRides: 1,
          totalEarnings: earnings,
          unpaidCommission: commission,
        },
      });
    }

    await ride.save();

    // Broadcast status change
    const io = getIO();
    const room = `ride_${rideId}`;

    io.in(room).emit('ride_status_updated', {
      rideId,
      status: ride.status,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `Trip status updated to '${status}'.`,
      data: ride,
    });
  } catch (error) {
    console.error('[Ride Controller - Update Status Error]:', error);
    next(error);
  }
};

/**
 * @desc    Cancel an active or pending trip
 * @route   POST /api/v1/rides/:rideId/cancel
 * @access  Private (Customer or Driver)
 */
const cancelTrip = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    // Authorization Check
    if (userRole === 'customer' && ride.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this ride.',
      });
    }
    if (userRole === 'driver' && ride.driver && ride.driver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this ride.',
      });
    }

    // Status Validation
    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: `Ride cannot be cancelled because it is already ${ride.status}.`,
      });
    }

    ride.status = 'cancelled';
    ride.cancellationReason = reason || 'No reason provided';
    ride.cancelledBy = userId;
    await ride.save();

    // Notify room via Socket.io
    const io = getIO();
    const room = `ride_${rideId}`;

    io.in(room).emit('ride_status_updated', {
      rideId,
      status: 'cancelled',
      cancelledBy: userRole,
      reason: ride.cancellationReason,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully.',
      data: ride,
    });
  } catch (error) {
    console.error('[Ride Controller - Cancel Trip Error]:', error);
    next(error);
  }
};

const getRideById = async (req,res,next) => { try { const ride=await Ride.findById(req.params.id).populate('customer','fullName phone rating profilePictureUrl').populate('driver','fullName phone rating vehicle profilePictureUrl location heading'); if(!ride)return res.status(404).json({success:false,message:'Ride not found.'}); const uid=String(req.user.id); if(String(ride.customer?._id||ride.customer)!==uid && String(ride.driver?._id||ride.driver)!==uid)return res.status(403).json({success:false,message:'Unauthorized.'}); res.json({success:true,data:ride}); } catch(e){next(e);} };
const getUserRides = async (req,res,next) => { try { const query=req.user.role==='driver'?{driver:req.user.id}:{customer:req.user.id}; const rides=await Ride.find(query).populate('customer','fullName phone rating profilePictureUrl').populate('driver','fullName phone rating vehicle profilePictureUrl').sort({createdAt:-1}); res.json({success:true,data:rides}); } catch(e){next(e);} };

module.exports = {
  calculateUpfrontFare,
  requestTrip,
  acceptTrip,
  updateTripStatus,
  cancelTrip,
  getRideById,
  getUserRides,
};