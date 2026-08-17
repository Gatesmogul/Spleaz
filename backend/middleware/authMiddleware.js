const jwt=require('jsonwebtoken');
const User=require('../models/User');
const protect=async(req,res,next)=>{try{const header=req.headers.authorization||'';if(!header.startsWith('Bearer '))return res.status(401).json({success:false,message:'Not authorized. Bearer token required.'});const token=header.slice(7);const decoded=jwt.verify(token,process.env.JWT_SECRET||'change-me');const user=await User.findById(decoded.id).select('-password');if(!user)return res.status(401).json({success:false,message:'User no longer exists.'});req.user=user;next();}catch(error){return res.status(401).json({success:false,message:'Not authorized. Token is invalid or expired.'});}};
const normalize=(role)=>({RIDER:'customer',DRIVER:'driver',ADMIN:'admin'}[String(role).toUpperCase()]||String(role).toLowerCase());
const authorize=(...roles)=>(req,res,next)=>{if(!req.user)return res.status(401).json({success:false,message:'Authentication required.'});const actual=normalize(req.user.role);const allowed=roles.map(normalize);if(!allowed.includes(actual))return res.status(403).json({success:false,message:'You are not authorized to access this resource.'});next();};
module.exports={protect,authorize};
