import { LocationCoordinates } from '../services/location';
import { UserProfile, DriverProfile, VehicleType } from './auth';

// ==========================================
// 1. RIDE STATUS & ENUMS
// ==========================================

export type RideStatus =
  | 'IDLE'                  // No active request
  | 'SEARCHING'             // Searching for nearby drivers
  | 'DRIVER_ASSIGNED'       // Driver accepted, en route to pickup
  | 'DRIVER_ARRIVED'        // Driver arrived at pickup location
  | 'IN_PROGRESS'           // Trip active, en route to destination
  | 'COMPLETED'             // Trip successfully finished
  | 'CANCELLED';            // Trip cancelled by rider or driver

export type PaymentMethodType = 'CASH' | 'CARD' | 'WALLET';

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';

export type CancelReason =
  | 'DRIVER_TOO_FAR'
  | 'DRIVER_NOT_MOVING'
  | 'WRONG_ADDRESS'
  | 'CHANGE_OF_PLANS'
  | 'SAFETY_CONCERN'
  | 'OTHER';

// ==========================================
// 2. LOCATION & FARE INTERFACES
// ==========================================

export interface RideLocation {
  latitude: number;
  longitude: number;
  address: string;
  name?: string; // e.g. "Victoria Island Mall" or "Home"
  city?: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalFare: number;
  currency: string;
}

export interface EstimatedMobilityOption {
  id: VehicleType;
  title: string;
  description: string;
  estimatedPrice: number;
  currency: string;
  etaMinutes: number;
  capacity: number;
  iconName: string;
  fareBreakdown: FareBreakdown;
}

// ==========================================
// 3. CORE ACTIVE RIDE INTERFACE
// ==========================================

export interface ActiveRide {
  id: string;
  pinCode: string; // 4-digit PIN to verify passenger before start
  status: RideStatus;
  pickup: RideLocation;
  dropoff: RideLocation;
  mobilityOption: VehicleType;
  fare: FareBreakdown;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  
  // Participant Info
  rider: UserProfile;
  driver?: DriverProfile;
  
  // Real-Time Telemetry
  driverCurrentLocation?: LocationCoordinates;
  driverHeading?: number;
  etaToPickupMinutes?: number;
  etaToDestinationMinutes?: number;
  remainingDistanceMeters?: number;

  // Timestamps
  requestedAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: CancelReason;
}

// ==========================================
// 4. REQUEST & DTO INTERFACES
// ==========================================

export interface CreateRideRequestInput {
  pickup: RideLocation;
  dropoff: RideLocation;
  mobilityOption: VehicleType;
  paymentMethod: PaymentMethodType;
  promoCode?: string;
}

export interface RateTripInput {
  rideId: string;
  rating: number; // 1 to 5 stars
  feedbackComment?: string;
  tipAmount?: number;
}

export interface RideChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

// ==========================================
// 5. RIDE CONTEXT STATE INTERFACE
// ==========================================

export interface RideContextState {
  activeRide: ActiveRide | null;
  selectedOption: VehicleType;
  pickupLocation: RideLocation | null;
  destinationLocation: RideLocation | null;
  availableOptions: EstimatedMobilityOption[];
  isLoadingOptions: boolean;
  chatMessages: RideChatMessage[];
  isSearchingDriver: boolean;
  
  // Context Actions
  setPickup: (location: RideLocation) => void;
  setDestination: (location: RideLocation) => void;
  setSelectedOption: (option: VehicleType) => void;
  requestRide: (paymentMethod: PaymentMethodType) => Promise<boolean>;
  cancelRide: (reason: CancelReason) => Promise<boolean>;
  notifyWalkingOut: () => void;
  sendChatMessage: (text: string) => void;
  rateTrip: (input: RateTripInput) => Promise<boolean>;
  resetRideState: () => void;
}