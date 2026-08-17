import { UserRole, DriverStatus, VehicleDetails } from './auth';

// ==========================================
// 1. SAVED PLACES & FAVORITES
// ==========================================

export type SavedPlaceType = 'HOME' | 'WORK' | 'FAVORITE' | 'OTHER';

export interface SavedPlace {
  id: string;
  type: SavedPlaceType;
  label: string; // e.g. "Home", "Office", "Gym"
  address: string;
  latitude: number;
  longitude: number;
  iconName?: string;
  createdAt: string;
}

// ==========================================
// 2. EMERGENCY CONTACTS & SAFETY
// ==========================================

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary: boolean;
  shareTripStatus: boolean;
}

// ==========================================
// 3. USER PREFERENCES
// ==========================================

export interface UserPreferences {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string; // e.g. "en", "fr", "es", "pt", "nl", "yo", "ha", "ig"
  notificationsEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  autoShareTrips: boolean;
  preferredPaymentMethod: 'CASH' | 'CARD' | 'WALLET';
}

// ==========================================
// 4. USER PAYMENT METHODS
// ==========================================

export type PaymentCardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'VERVE' | 'UNKNOWN';

export interface PaymentCard {
  id: string;
  brand: PaymentCardBrand;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardHolderName: string;
}

export interface UserWallet {
  id: string;
  balance: number;
  currency: string; // e.g. "NGN", "USD", "EUR"
  isLocked: boolean;
  lastTopUpAmount?: number;
  lastTopUpAt?: string;
}

// ==========================================
// 5. EXTENDED USER DOMAIN PROFILE
// ==========================================

export interface DetailedUserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  activeRole: 'RIDER' | 'DRIVER';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  rating: number;
  ratingCount: number;
  totalTripsCompleted: number;

  // Domain Relations
  savedPlaces: SavedPlace[];
  emergencyContacts: EmergencyContact[];
  preferences: UserPreferences;
  savedCards: PaymentCard[];
  wallet: UserWallet;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. DRIVER ANALYTICS & EARNINGS
// ==========================================

export interface DriverEarningSummary {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedTripsToday: number;
  onlineHoursToday: number;
  currency: string;
}

export interface DetailedDriverProfile extends DetailedUserProfile {
  driverStatus: DriverStatus;
  isOnline: boolean;
  vehicle?: VehicleDetails;
  earnings: DriverEarningSummary;
  acceptsCash: boolean;
  acceptsCard: boolean;
}