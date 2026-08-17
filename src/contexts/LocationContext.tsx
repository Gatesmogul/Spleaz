import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
  accuracy?: number | null;
}

export interface FormattedAddress {
  formattedAddress: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationContextType {
  /** Current active coordinates of the user */
  currentLocation: LocationCoordinates | null;
  /** Human-readable address derived from reverse geocoding */
  currentAddress: FormattedAddress | null;
  /** Granted status of location permissions */
  hasPermission: boolean;
  /** Loading status during location acquisition */
  isLoading: boolean;
  /** Active status of continuous live location subscription */
  isTracking: boolean;
  /** Request foreground/background location permissions from OS */
  requestLocationPermission: () => Promise<boolean>;
  /** Force update current device position once */
  refreshLocation: () => Promise<LocationCoordinates | null>;
  /** Convert coordinates into human-readable street address */
  reverseGeocode: (coords: LocationCoordinates) => Promise<FormattedAddress | null>;
  /** Start continuous live location tracking stream */
  startLocationTracking: () => Promise<void>;
  /** Stop continuous live location tracking stream */
  stopLocationTracking: () => void;
}

// Default Fallback Coordinates (e.g. Lagos City Center)
export const DEFAULT_COORDINATES: LocationCoordinates = {
  latitude: 6.5244,
  longitude: 3.3792,
};

// ==========================================
// 2. CONTEXT CREATION & PROVIDER
// ==========================================

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinates | null>(null);
  const [currentAddress, setCurrentAddress] =
    useState<FormattedAddress | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);

  /**
   * Reverse Geocode Coordinates into Street Address
   */
  const reverseGeocode = useCallback(
    async (coords: LocationCoordinates): Promise<FormattedAddress | null> => {
      try {
        const addressList = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (addressList && addressList.length > 0) {
          const first = addressList[0];
          const formattedAddress = [
            first.name || first.street,
            first.district || first.city,
            first.region,
          ]
            .filter(Boolean)
            .join(', ');

          const result: FormattedAddress = {
            formattedAddress: formattedAddress || 'Unknown Location',
            street: first.street || first.name || undefined,
            city: first.city || first.subregion || undefined,
            region: first.region || undefined,
            country: first.country || undefined,
            postalCode: first.postalCode || undefined,
          };

          return result;
        }
      } catch (error) {
        console.warn('Failed to reverse geocode location:', error);
      }
      return null;
    },
    []
  );

  /**
   * Request Location Permissions
   */
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Spleaz needs location access to pinpoint your pickup point and track nearby drivers.',
          [{ text: 'OK' }]
        );
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  /**
   * Refresh/Fetch single current position snapshot
   */
  const refreshLocation =
    useCallback(async (): Promise<LocationCoordinates | null> => {
      setIsLoading(true);
      try {
        let granted = hasPermission;
        if (!granted) {
          granted = await requestLocationPermission();
        }

        if (!granted) {
          setIsLoading(false);
          return null;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
        };

        setCurrentLocation(coords);

        // Fetch street address in background
        reverseGeocode(coords).then((address) => {
          if (address) setCurrentAddress(address);
        });

        return coords;
      } catch (error) {
        console.error('Error refreshing location:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [hasPermission, requestLocationPermission, reverseGeocode]);

  /**
   * Stop Continuous Live Tracking
   */
  const stopLocationTracking = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  }, [locationSubscription]);

  /**
   * Start Continuous Live Tracking Stream
   */
  const startLocationTracking = useCallback(async () => {
    try {
      let granted = hasPermission;
      if (!granted) {
        granted = await requestLocationPermission();
      }

      if (!granted) return;

      // Clean existing subscription if active
      if (locationSubscription) {
        locationSubscription.remove();
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000, // Update every 4 seconds
          distanceInterval: 5, // Update every 5 meters
        },
        (newPosition) => {
          const coords: LocationCoordinates = {
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
            heading: newPosition.coords.heading,
            speed: newPosition.coords.speed,
            altitude: newPosition.coords.altitude,
            accuracy: newPosition.coords.accuracy,
          };

          setCurrentLocation(coords);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }, [hasPermission, locationSubscription, requestLocationPermission]);

  // Initial setup on mount
  useEffect(() => {
    refreshLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        currentAddress,
        hasPermission,
        isLoading,
        isTracking,
        requestLocationPermission,
        refreshLocation,
        reverseGeocode,
        startLocationTracking,
        stopLocationTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// ==========================================
// 3. CUSTOM HOOK
// ==========================================

/**
 * Custom Hook to consume user GPS coordinates and location utilities
 */
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;