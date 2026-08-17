const Ride = require('../models/Ride'); // Adjust path to your Ride model
const Message = require('../models/Message'); // Adjust path to your Message model

/**
 * @desc    Get full chat history / message logs for a specific ride
 * @route   GET /api/chats/:rideId
 * @access  Private (Customer or Driver assigned to the ride)
 */
const getChatHistory = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // 'customer' or 'driver'

    // 1. Verify Ride Existence
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    // 2. Authorization Check: Ensure user is part of this ride
    const isCustomer = userRole === 'customer' && ride.customer.toString() === userId;
    const isDriver = userRole === 'driver' && ride.driver && ride.driver.toString() === userId;

    if (!isCustomer && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. You are not a participant in this trip chat.',
      });
    }

    // 3. Fetch messages sorted chronologically (oldest to newest)
    const messages = await Message.find({ ride: rideId })
      .populate('sender', 'fullName')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('[Chat Controller - Get History Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history logs.',
      error: error.message,
    });
  }
};

/**
 * @desc    Save a chat message to the database (REST fallback or persistence helper)
 * @route   POST /api/chats/:rideId
 * @access  Private (Customer or Driver)
 */
const saveChatMessage = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    // 1. Verify Ride Existence & Active Status
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send messages for a trip that has ended or been cancelled.',
      });
    }

    // 2. Authorization Check
    const isCustomer = userRole === 'customer' && ride.customer.toString() === userId;
    const isDriver = userRole === 'driver' && ride.driver && ride.driver.toString() === userId;

    if (!isCustomer && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot send messages for this ride.',
      });
    }

    // 3. Create and Save Message Record
    const recipientId = isCustomer ? ride.driver : ride.customer;
    if (!recipientId) return res.status(400).json({ success:false, message:'The other ride participant is not assigned yet.' });
    const newMessage = await Message.create({
      ride: rideId,
      sender: userId,
      recipient: recipientId,
      senderRole: userRole,
      text: text.trim(),
    });

    // Populate sender details before returning
    await newMessage.populate('sender', 'fullName');

    return res.status(201).json({
      success: true,
      message: 'Message saved successfully.',
      data: newMessage,
    });
  } catch (error) {
    console.error('[Chat Controller - Save Message Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save chat message.',
      error: error.message,
    });
  }
};

module.exports = {
  getChatHistory,
  saveChatMessage,
};