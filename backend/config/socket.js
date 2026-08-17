const {Server}=require('socket.io');
const jwt=require('jsonwebtoken');
let io;
const initSocket=(httpServer)=>{
 io=new Server(httpServer,{cors:{origin:process.env.CLIENT_ORIGIN||'*',methods:['GET','POST']},pingTimeout:Number(process.env.SOCKET_PING_TIMEOUT||60000),pingInterval:Number(process.env.SOCKET_PING_INTERVAL||25000)});
 io.use((socket,next)=>{try{const raw=socket.handshake.auth?.token||socket.handshake.query?.token;const token=String(raw||'').replace(/^Bearer\s+/,'');if(!token)return next(new Error('Authentication required'));socket.user=jwt.verify(token,process.env.JWT_SECRET||'change-me');next();}catch(e){next(new Error('Invalid socket token'));}});
 io.on('connection',(socket)=>{
   const userId=String(socket.user.id); const role=socket.user.role; socket.join(`user_${userId}`);
   socket.on('join:ride_room',(rideId)=>{if(rideId)socket.join(`ride_${rideId}`);});
   socket.on('leave:ride_room',(rideId)=>{if(rideId)socket.leave(`ride_${rideId}`);});
   socket.on('location:send',({rideId,latitude,longitude,heading=0})=>{if(!Number.isFinite(Number(latitude))||!Number.isFinite(Number(longitude)))return;io.to(`ride_${rideId}`).emit('location:updated',{rideId,driverId:userId,latitude:Number(latitude),longitude:Number(longitude),heading:Number(heading),timestamp:new Date().toISOString()});});
   socket.on('chat:send_message',(data)=>{if(!data?.rideId)return;io.to(`ride_${data.rideId}`).emit('chat:message_received',{...data,id:data.id||`${Date.now()}-${socket.id}`,senderId:userId,senderRole:role,timestamp:new Date().toISOString()});});
   socket.on('ride:passenger_walking_out',({rideId})=>{if(rideId)io.to(`ride_${rideId}`).emit('ride:status_changed',{rideId,status:'PASSENGER_WALKING_OUT',timestamp:new Date().toISOString()});});
   socket.on('disconnect',()=>{});
 });
 return io;
};
const getIO=()=>{if(!io)throw new Error('Socket.io has not been initialized.');return io;};
module.exports={initSocket,getIO};
