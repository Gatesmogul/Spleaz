import { LocationCoordinates } from '../services/location';

export type UserRole = 'RIDER' | 'DRIVER' | 'ADMIN';

export type VehicleType = 
  | 'SPLEAZ_GO'
  | 'SPLEAZ_COMFORT'
  | 'SPLEAZ_EXEC'
  | 'SPLEAZ_ECO'
  | 'SPLEAZ_EXPRESS';

export type DriverStatus = 'OFFLINE' | 'ONLINE' | 'ON_TRIP' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  category: VehicleType;
  seats: number;
}

export interface DriverDocument {
  id: string;
  type: 'DRIVERS_LICENSE' | 'VEHICLE_REGISTRATION' | 'INSURANCE' | 'BACKGROUND_CHECK';
  documentUrl: string;
  isVerified: boolean;
  expiresAt?: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  activeRole: 'RIDER' | 'DRIVER';
  rating: number;
  totalTrips: number;
  isVerified: boolean;
  walletBalance: number;
  currency: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile extends UserProfile {
  driverStatus: DriverStatus;
  vehicle?: VehicleDetails;
  documents: DriverDocument[];
  currentLocation?: LocationCoordinates;
  acceptsCash: boolean;
  acceptsCard: boolean;
  ratingCount: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserProfile | DriverProfile;
  tokens: AuthTokens;
}

export interface OtpSendResponse {
  success: boolean;
  phone: string;
  otpLength: number;
  resendCooldownSeconds: number;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
  deviceToken?: string;
}

export interface AuthState {
  user: UserProfile | DriverProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'RIDER' | 'DRIVER';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}