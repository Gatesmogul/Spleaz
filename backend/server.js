require('dotenv').config();
const http=require('http');
const express=require('express');
const cors=require('cors');
const path=require('path');
const connectDB=require('./config/db');
const {initSocket}=require('./config/socket');
const {notFoundHandler,errorHandler}=require('./middleware/errorHandler');
const authRoutes=require('./routes/authRoutes');
const rideRoutes=require('./routes/rideRoutes');
const driverRoutes=require('./routes/driverRoutes');
const chatRoutes=require('./routes/chatRoutes');
const trackingRoutes=require('./routes/trackingRoutes');
const utilsRoutes=require('./routes/utilsRoutes');

const app=express();
app.disable('x-powered-by');
app.use(cors({origin:process.env.CLIENT_ORIGIN||'*',methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true,limit:'10mb'}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/',(req,res)=>res.json({success:true,message:'Spleaz API is running',version:'1.0.0',database:'MongoDB'}));
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/rides',rideRoutes);
app.use('/api/v1/driver',driverRoutes);
app.use('/api/v1/chat',chatRoutes);
app.use('/api/v1/tracking',trackingRoutes);
app.use('/api/v1/utils',utilsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const server=http.createServer(app);
const io=initSocket(server);
const PORT=Number(process.env.PORT||5000);

(async()=>{try{await connectDB();server.listen(PORT,()=>console.log(`[Spleaz] API listening on port ${PORT}`));}catch(error){console.error('[Spleaz] Startup failed:',error.message);process.exit(1);}})();
process.on('unhandledRejection',(err)=>console.error('[Unhandled Rejection]',err));
process.on('uncaughtException',(err)=>{console.error('[Uncaught Exception]',err);process.exit(1);});
module.exports={app,server,io};
