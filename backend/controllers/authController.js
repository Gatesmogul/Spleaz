const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn('[Auth] JWT_SECRET is not configured.');

const generateToken = (userId, role) => jwt.sign({ id: String(userId), role }, JWT_SECRET || 'change-me', { expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '30d' });
const publicUser = (user) => {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  return {
    ...value,
    id: String(value._id || value.id),
    phoneNumber: value.phone,
    avatarUrl: value.profilePictureUrl || '',
    country: value.addressInfo?.country || '',
    state: value.addressInfo?.state || '',
    city: value.addressInfo?.city || '',
    isVerified: value.isVerified !== false,
  };
};

const normalizeRole = (role) => ({ RIDER:'customer', DRIVER:'driver', ADMIN:'admin' }[String(role).toUpperCase()] || String(role || 'customer').toLowerCase());

const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      phoneNumber,
      password,
      role = 'customer',
      location,
      vehicle,
      country = 'Nigeria',
      state = '',
      city = '',
    } = req.body;

    console.log('[Auth/Register] Request received');
    console.log('[Auth/Register] Database:', User.db?.name);
    console.log('[Auth/Register] Email:', email);
    console.log('[Auth/Register] Role:', role);

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = String(phone || phoneNumber || '').trim();
    const normalizedRole = normalizeRole(role);

    if (
      !fullName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !password ||
      !state ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Full name, email, phone, password, state and city are required.',
      });
    }

    if (!['customer', 'driver', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role.',
      });
    }

    if (
      normalizedRole === 'driver' &&
      (!vehicle || !vehicle.licensePlate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Driver registration requires vehicle details including license plate.',
      });
    }

    console.log('[Auth/Register] Checking existing user...');

    const existing = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          'A user with this email or phone number already exists.',
      });
    }

    console.log('[Auth/Register] Hashing password...');

    const hashed = await bcrypt.hash(password, 12);

    const hasLocation =
      location &&
      Number.isFinite(Number(location.latitude)) &&
      Number.isFinite(Number(location.longitude));

    console.log('[Auth/Register] Creating user...');
    console.log(
      '[Auth/Register] Mongoose database:',
      User.db?.name
    );
    console.log(
      '[Auth/Register] Mongoose collection:',
      User.collection?.name
    );

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashed,
      role: normalizedRole,

      addressInfo: {
        country,
        state,
        city,
      },

      location: hasLocation
        ? {
            type: 'Point',
            coordinates: [
              Number(location.longitude),
              Number(location.latitude),
            ],
            address: location.address || '',
          }
        : undefined,

      vehicle:
        normalizedRole === 'driver'
          ? vehicle
          : undefined,

      isOnline: false,
    });

    console.log(
      '[Auth/Register] User created successfully:',
      user._id
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: publicUser(user),
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    console.error('[Auth/Register] FAILED');
    console.error('[Auth/Register] Database:', User.db?.name);
    console.error('[Auth/Register] Collection:', User.collection?.name);
    console.error(error);

    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const {
      email,
      password,
      location,
    } = req.body;

    console.log('[Auth/Login] Request received');
    console.log('[Auth/Login] Database:', User.db?.name);
    console.log('[Auth/Login] Email:', email);

    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select('+password');

    console.log(
      '[Auth/Login] User found:',
      user ? user._id : 'NO USER'
    );

    if (
      !user ||
      !(await bcrypt.compare(password || '', user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (
      location &&
      Number.isFinite(Number(location.latitude)) &&
      Number.isFinite(Number(location.longitude))
    ) {
      user.location = {
        type: 'Point',
        coordinates: [
          Number(location.longitude),
          Number(location.latitude),
        ],
        address:
          location.address ||
          user.location?.address ||
          '',
      };

      await user.save();
    }

    console.log(
      '[Auth/Login] Login successful:',
      user._id
    );

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: publicUser(user),
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    console.error('[Auth/Login] FAILED');
    console.error('[Auth/Login] Database:', User.db?.name);
    console.error('[Auth/Login] Collection:', User.collection?.name);
    console.error(error);

    next(error);
  }
};

const getMe = async (req,res,next) => { try { const user=await User.findById(req.user.id); if(!user) return res.status(404).json({success:false,message:'User not found.'}); res.json({success:true,data:publicUser(user)}); } catch(e){next(e);} };
const updateProfile = async (req,res,next) => { try {
  const allowed={}; const {fullName,phone,phoneNumber,country,state,city,avatarUrl,profilePictureUrl}=req.body;
  if(fullName!==undefined) allowed.fullName=String(fullName).trim(); if(phone!==undefined||phoneNumber!==undefined) allowed.phone=String(phone||phoneNumber).trim(); if(avatarUrl!==undefined||profilePictureUrl!==undefined) allowed.profilePictureUrl=avatarUrl||profilePictureUrl||'';
  const address={...(req.user.addressInfo?.toObject?.() || req.user.addressInfo || {})}; if(country!==undefined) address.country=country; if(state!==undefined) address.state=state; if(city!==undefined) address.city=city; allowed.addressInfo=address;
  const user=await User.findByIdAndUpdate(req.user.id,{$set:allowed},{new:true,runValidators:true}); res.json({success:true,message:'Profile updated successfully.',data:publicUser(user)});
} catch(e){next(e);} };
const updatePassword = async (req,res,next)=>{try{const {currentPassword,newPassword}=req.body;if(!currentPassword||!newPassword)return res.status(400).json({success:false,message:'Current and new passwords are required.'});const user=await User.findById(req.user.id).select('+password');if(!user||!(await bcrypt.compare(currentPassword,user.password)))return res.status(400).json({success:false,message:'Current password is incorrect.'});user.password=await bcrypt.hash(newPassword,12);await user.save();res.json({success:true,message:'Password updated successfully.'});}catch(e){next(e);}};
const updateLocation = async (req,res,next)=>{try{const {latitude,longitude,address,heading=0}=req.body;if(latitude===undefined||longitude===undefined)return res.status(400).json({success:false,message:'Latitude and longitude are required.'});const user=await User.findByIdAndUpdate(req.user.id,{$set:{'location.type':'Point','location.coordinates':[Number(longitude),Number(latitude)],'location.address':address||'',heading:Number(heading),lastLocationUpdate:new Date()}},{new:true,runValidators:true}).select('-password');res.json({success:true,message:'Location updated successfully.',data:{location:user.location,heading:user.heading}});}catch(e){next(e);}};
const forgotPassword = async (req,res,next)=>{try{const user=await User.findOne({email:String(req.body.email||'').trim().toLowerCase()});if(!user)return res.json({success:true,message:'If an account exists for that email, reset instructions will be sent.'});const raw=crypto.randomBytes(32).toString('hex');user.passwordResetToken=crypto.createHash('sha256').update(raw).digest('hex');user.passwordResetExpires=Date.now()+30*60*1000;await user.save({validateBeforeSave:false});console.log(`[Password Reset] token for ${user.email}: ${raw}`);res.json({success:true,message:'Password reset instructions generated. Check server email configuration/logs.'});}catch(e){next(e);}};
const resetPassword = async (req,res,next)=>{try{const hashed=crypto.createHash('sha256').update(String(req.body.token||'')).digest('hex');const user=await User.findOne({passwordResetToken:hashed,passwordResetExpires:{$gt:Date.now()}});if(!user)return res.status(400).json({success:false,message:'Reset token is invalid or expired.'});user.password=await bcrypt.hash(req.body.newPassword,12);user.passwordResetToken=undefined;user.passwordResetExpires=undefined;await user.save();res.json({success:true,message:'Password reset successfully.'});}catch(e){next(e);}};
module.exports={register,login,getMe,updateProfile,updatePassword,updateLocation,forgotPassword,resetPassword,generateToken};
