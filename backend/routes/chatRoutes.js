const express=require('express');
const router=express.Router();
const {getChatHistory,saveChatMessage}=require('../controllers/chatController');
const {protect}=require('../middleware/authMiddleware');
router.use(protect);
router.get('/:rideId',getChatHistory);
router.post('/:rideId',saveChatMessage);
module.exports=router;
