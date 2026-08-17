import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import socketService from './socket';

// ==========================================
// 1. CONSTANTS & TASK NAMES
// ==========================================

export const BACKGROUND_LOCATION_TASK = 'SPLEAZ_BACKGROUND_LOCATION_TASK';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
  accuracy?: number | null;
}

// Global active ride state reference for the background task manager
let activeRideId: string | null = null;
let activeUserId: string | null = null;
let activeUserRole: 'RIDER' | 'DRIVER' = 'DRIVER';

export const setActiveRideTrackingContext = (
  rideId: string | null,
  userId: string | null,
  role: 'RIDER' | 'DRIVER' = 'DRIVER'
) => {
  activeRideId = rideId;
  activeUserId = userId;
  activeUserRole = role;
};

// ==========================================
// 2. BACKGROUND TASK DEFINITION
// ==========================================

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background Location Task Error:', error.message);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const latestLocation = locations[0];

    if (latestLocation && activeRideId && activeUserId) {
      const coords: LocationCoordinates = {
        latitude: latestLocation.coords.latitude,
        longitude: latestLocation.coords.longitude,
        heading: latestLocation.coords.heading,
        speed: latestLocation.coords.speed,
        altitude: latestLocation.coords.altitude,
        accuracy: latestLocation.coords.accuracy,
      };

      // Emit live coordinate updates through WebSocket
      socketService.sendLocationUpdate({
        rideId: activeRideId,
        driverId: activeUserId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading ?? undefined,
      });
    }
  }
});

// ==========================================
// 3. LOCATION SERVICE CLASS
// ==========================================

class LocationService {
  private foregroundSubscription: Location.LocationSubscription | null = null;

  /**
   * Request both Foreground and Background Location Permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.warn('⚠️ Foreground location permission denied.');
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ Background location permission denied.');
      }

      return true;
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  /**
   * Get Current Foreground GPS Location
   */
  public async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Error fetching current location:', error);
      return null;
    }
  }

  /**
   * Start Foreground Location Watching (Active App)
   */
  public async startForegroundTracking(
    onLocationChange: (location: LocationCoordinates) => void
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    this.stopForegroundTracking();

    this.foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (location) => {
        onLocationChange({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading,
          speed: location.coords.speed,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
        });
      }
    );
  }

  /**
   * Stop Foreground Location Watching
   */
  public stopForegroundTracking(): void {
    if (this.foregroundSubscription) {
      this.foregroundSubscription.remove();
      this.foregroundSubscription = null;
    }
  }

  /**
   * Start Background Location Tracking (App in Background or Closed)
   */
  public async startBackgroundTracking(
    rideId: string,
    userId: string,
    role: 'RIDER' | 'DRIVER' = 'DRIVER'
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      setActiveRideTrackingContext(rideId, userId, role);

      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      );

      if (!isRegistered) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 4000,
          distanceInterval: 10,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Spleaz Trip Active',
            notificationBody: 'Sharing location for ride tracking and navigation.',
            notificationColor: '#000000',
          },
        });
        console.log('📍 Started background location updates task.');
      }
    } catch (error) {
      console.error('Failed to start background tracking task:', error);
    }
  }

  /**
   * Stop Background Location Tracking
   */
  public async stopBackgroundTracking(): Promise<void> {
    try {
      setActiveRideTrackingContext(null, null);

      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      );

      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('🛑 Stopped background location updates task.');
      }
    } catch (error) {
      console.error('Failed to stop background tracking task:', error);
    }
  }

  /**
   * Reverse Geocode Coordinates to Address String
   */
  public async reverseGeocode(
    coords: LocationCoordinates
  ): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (results && results.length > 0) {
        const item = results[0];
        const street = item.streetNumber
          ? `${item.streetNumber} ${item.street}`
          : item.street;
        return [street, item.city, item.region].filter(Boolean).join(', ');
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

// Export Singleton Instance
export const locationService = new LocationService();
export default locationService;