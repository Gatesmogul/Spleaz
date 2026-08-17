import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';
import { LocationCoordinates } from '../../api/rider';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface LiveTrackingMapProps {
  /**
   * Driver's current real-time GPS location
   */
  driverLocation?: LocationCoordinates & { heading?: number };
  /**
   * Customer's pickup point location
   */
  pickupLocation?: LocationCoordinates;
  /**
   * Customer's destination point location
   */
  destinationLocation?: LocationCoordinates;
  /**
   * Optional route coordinate points array to draw polyline on map
   */
  routeCoordinates?: LocationCoordinates[];
  /**
   * Shows driver car marker when true
   * @default true
   */
  showDriverMarker?: boolean;
  /**
   * Allows map recalculation and animated re-centering on position updates
   * @default true
   */
  autoCenterOnUpdate?: boolean;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const DEFAULT_REGION: Region = {
  latitude: 6.5244, // Default Lagos / Central coordinate
  longitude: 3.3792,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Calculate initial bounding region containing all points
const calculateBoundingRegion = (
  points: LocationCoordinates[]
): Region | null => {
  if (points.length === 0) return null;

  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  points.forEach((point) => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02);

  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};

// ==========================================
// 3. COMPONENT IMPLEMENTATION
// ==========================================

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  driverLocation,
  pickupLocation,
  destinationLocation,
  routeCoordinates = [],
  showDriverMarker = true,
  autoCenterOnUpdate = true,
  containerStyle,
}) => {
  const mapRef = useRef<MapView | null>(null);

  // Re-fit camera boundaries when driver location or route points update
  useEffect(() => {
    if (!autoCenterOnUpdate || !mapRef.current) return;

    const validPoints: LocationCoordinates[] = [];
    if (pickupLocation) validPoints.push(pickupLocation);
    if (destinationLocation) validPoints.push(destinationLocation);
    if (driverLocation) validPoints.push(driverLocation);

    if (validPoints.length > 0) {
      mapRef.current.fitToCoordinates(validPoints, {
        edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
        animated: true,
      });
    }
  }, [driverLocation, pickupLocation, destinationLocation, autoCenterOnUpdate]);

  // Handle re-center trigger button
  const handleRecenter = () => {
    if (!mapRef.current) return;

    const activePoint = driverLocation || pickupLocation;
    if (activePoint) {
      mapRef.current.animateToRegion(
        {
          latitude: activePoint.latitude,
          longitude: activePoint.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        1000
      );
    }
  };

  const initialRegion =
    calculateBoundingRegion(
      [pickupLocation, destinationLocation, driverLocation].filter(
        Boolean
      ) as LocationCoordinates[]
    ) || DEFAULT_REGION;

  return (
    <View style={[styles.container, containerStyle]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={false}
      >
        {/* Route Polyline Path */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0F172A"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Point"
            description={pickupLocation.addressName || 'Customer Pickup'}
          >
            <View style={styles.pickupMarker}>
              <View style={styles.pickupInnerDot} />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationLocation && (
          <Marker
            coordinate={destinationLocation}
            title="Destination"
            description={destinationLocation.addressName || 'Customer Destination'}
          >
            <View style={styles.destinationMarker}>
              <View style={styles.destinationInnerSquare} />
            </View>
          </Marker>
        )}

        {/* Driver Vehicle Marker */}
        {showDriverMarker && driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Spleaz Driver"
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            rotation={driverLocation.heading || 0}
          >
            <View style={styles.carMarker}>
              <Text style={styles.carIcon}>🚘</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Recenter Control Button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Text style={styles.recenterIcon}>🎯</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==========================================
// 4. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // Pickup Marker Styles
  pickupMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.25)', // Semi-transparent green
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  pickupInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },

  // Destination Marker Styles
  destinationMarker: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.25)', // Semi-transparent red
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  destinationInnerSquare: {
    width: 12,
    height: 12,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },

  // Car Marker Styles
  carMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  carIcon: {
    fontSize: 18,
  },

  // Controls Overlay
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  recenterIcon: {
    fontSize: 20,
  },
});

export default LiveTrackingMap;