const express=require('express');
const router=express.Router();
const {calculateUpfrontFare,requestTrip,acceptTrip,updateTripStatus,cancelTrip,getRideById,getUserRides}=require('../controllers/rideController');
const {protect,authorize}=require('../middleware/authMiddleware');
router.use(protect);
router.post('/fare',calculateUpfrontFare);
router.post('/fare-estimates',calculateUpfrontFare);
router.post('/request',authorize('customer'),requestTrip);
router.post('/request-ride',authorize('customer'),requestTrip);
router.get('/history',getUserRides || ((req,res)=>res.json({success:true,data:[]})));
router.get('/:id',getRideById || ((req,res)=>res.status(404).json({success:false,message:'Ride details endpoint unavailable.'})));
router.put('/:rideId/accept',authorize('driver'),acceptTrip);
router.post('/accept-ride',authorize('driver'),(req,res,next)=>{req.params.rideId=req.body.rideId; return acceptTrip(req,res,next);});
router.put('/:rideId/status',authorize('driver'),updateTripStatus);
router.patch('/:rideId/status',authorize('driver'),updateTripStatus);
router.put('/:rideId/cancel',cancelTrip);
router.post('/cancel-ride',cancelTripAlias);
function cancelTripAlias(req,res,next){ req.params.rideId=req.body.rideId; req.body.reason=req.body.cancellationReason || req.body.reason; return cancelTrip(req,res,next); }
module.exports=router;
