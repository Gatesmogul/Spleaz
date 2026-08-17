import apiClient from './client';
import { LocationCoordinates, MobilityOptionType, RideBooking } from './rider';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface DriverStatusUpdatePayload {
  isOnline: boolean;
  currentLocation?: LocationCoordinates;
}

export interface RideOffer {
  id: string;
  rideId: string;
  riderName: string;
  riderPhoneNumber: string;
  riderRating: number;
  pickupLocation: LocationCoordinates;
  destinationLocation: LocationCoordinates;
  distanceKm: number;
  mobilityType: MobilityOptionType;
  offeredPrice: number;
  currency: string;
  paymentMethod: 'TRANSFER' | 'CARD' | 'CASH';
  createdAt: string;
}

export interface AcceptRidePayload {
  rideId: string;
}

export interface UpdateTripStatusPayload {
  rideId: string;
  status: 'ARRIVED_AT_PICKUP' | 'TRIP_STARTED' | 'COMPLETED';
  currentLocation?: LocationCoordinates;
}

export interface CommissionReceiptUploadPayload {
  rideId?: string; // Optional: Can link to a specific trip or general balance settlement
  amountPaid: number;
  paymentReference?: string;
  receiptImageUri: string; // Local file URI from expo-image-picker
  receiptFileName?: string;
  receiptFileType?: string;
}

export interface DriverAccountSummary {
  totalTripsCompleted: number;
  totalEarnings: number;
  pendingCommissionAmount: number;
  paidCommissionAmount: number;
  currency: string;
  commissionRatePercentage: number;
}

export interface CommissionReceiptRecord {
  id: string;
  amountPaid: number;
  paymentReference?: string;
  receiptUrl: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface GenericApiResponse {
  success: boolean;
  message: string;
}

// ==========================================
// 2. DRIVER API ENDPOINTS
// ==========================================

export const driverApi = {
  /**
   * Toggle driver online/offline status and send real-time coordinates
   */
  updateDriverStatus: async (
    payload: DriverStatusUpdatePayload
  ): Promise<GenericApiResponse> => {
    const response = await apiClient.post<GenericApiResponse>(
      '/driver/status',
      payload
    );
    return response.data;
  },

  /**
   * Fetch live pending ride offers matching driver proximity
   */
  getAvailableRideOffers: async (): Promise<RideOffer[]> => {
    const response = await apiClient.get<{ success: boolean; data: RideOffer[] }>(
      '/driver/ride-offers'
    );
    return response.data.data;
  },

  /**
   * Accept an incoming ride request offer
   */
  acceptRide: async (payload: AcceptRidePayload): Promise<RideBooking> => {
    const response = await apiClient.post<{ success: boolean; data: RideBooking }>(
      '/driver/accept-ride',
      payload
    );
    return response.data.data;
  },

  /**
   * Progress active trip status (Arrived at Pickup -> Start Trip -> Complete Trip)
   */
  updateTripStatus: async (
    payload: UpdateTripStatusPayload
  ): Promise<RideBooking> => {
    const response = await apiClient.patch<{ success: boolean; data: RideBooking }>(
      '/driver/update-trip-status',
      payload
    );
    return response.data.data;
  },

  /**
   * Fetch list of completed trips for driver dashboard history
   */
  getCompletedTrips: async (): Promise<RideBooking[]> => {
    const response = await apiClient.get<{ success: boolean; data: RideBooking[] }>(
      '/driver/trips/completed'
    );
    return response.data.data;
  },

  /**
   * Fetch driver's financial account summary and commission state
   */
  getAccountSummary: async (): Promise<DriverAccountSummary> => {
    const response = await apiClient.get<{ success: boolean; data: DriverAccountSummary }>(
      '/driver/account/summary'
    );
    return response.data.data;
  },

  /**
   * Upload commission payment proof receipt per trip or balance settlement.
   * Sends multipart/form-data payload.
   */
  uploadCommissionReceipt: async (
    payload: CommissionReceiptUploadPayload
  ): Promise<CommissionReceiptRecord> => {
    const formData = new FormData();

    if (payload.rideId) {
      formData.append('rideId', payload.rideId);
    }
    formData.append('amountPaid', payload.amountPaid.toString());

    if (payload.paymentReference) {
      formData.append('paymentReference', payload.paymentReference);
    }

    // Prepare image payload for React Native / Expo FormData
    const fileToUpload = {
      uri: payload.receiptImageUri,
      name: payload.receiptFileName || `receipt_${Date.now()}.jpg`,
      type: payload.receiptFileType || 'image/jpeg',
    } as unknown as Blob;

    formData.append('receipt', fileToUpload);

    const response = await apiClient.post<{
      success: boolean;
      data: CommissionReceiptRecord;
    }>('/driver/commission/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Get history of uploaded commission payment receipts
   */
  getCommissionReceiptHistory: async (): Promise<CommissionReceiptRecord[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: CommissionReceiptRecord[];
    }>('/driver/commission/receipts');
    return response.data.data;
  },
};

export default driverApi;