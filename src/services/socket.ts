import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/api/client';

export interface LocationUpdatePayload { rideId:string; driverId?:string; latitude:number; longitude:number; heading?:number; }
export interface ChatMessagePayload { id?:string; rideId:string; recipientId?:string; senderId?:string; senderRole?:string; text:string; timestamp?:string; }
export interface RideStatusUpdatePayload { rideId:string; status:string; payload?:unknown; timestamp?:string; }

class SocketService {
 private socket:Socket|null=null;
 private connecting=false;
 connect(token:string){if(this.socket?.connected||this.connecting)return;this.connecting=true;this.socket=io(SOCKET_URL,{auth:{token:`Bearer ${token}`},transports:['websocket'],reconnection:true});this.socket.on('connect',()=>{this.connecting=false;});this.socket.on('connect_error',e=>{this.connecting=false;console.error('[Socket]',e.message);});}
 joinRideRoom(rideId:string){this.socket?.emit('join:ride_room',rideId);}
 leaveRideRoom(rideId:string){this.socket?.emit('leave:ride_room',rideId);}
 sendLocationUpdate(data:LocationUpdatePayload){this.socket?.emit('location:send',data);}
 sendChatMessage(data:Omit<ChatMessagePayload,'id'|'timestamp'>){this.socket?.emit('chat:send_message',data);}
 notifyWalkingOut(rideId:string){this.socket?.emit('ride:passenger_walking_out',{rideId});}
 onRideStatusChange(cb:(data:RideStatusUpdatePayload)=>void){this.socket?.on('ride:status_changed',cb);return()=>this.socket?.off('ride:status_changed',cb);}
 onLocationUpdate(cb:(data:LocationUpdatePayload)=>void){this.socket?.on('location:updated',cb);return()=>this.socket?.off('location:updated',cb);}
 onChatMessage(cb:(data:ChatMessagePayload)=>void){this.socket?.on('chat:message_received',cb);return()=>this.socket?.off('chat:message_received',cb);}
 isConnected(){return !!this.socket?.connected;}
 disconnect(){this.socket?.disconnect();this.socket=null;this.connecting=false;}
}
export const socketService=new SocketService();
export default socketService;
