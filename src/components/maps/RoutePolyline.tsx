import React from 'react';
import { Polyline } from 'react-native-maps';
import { LocationCoordinates } from '../../api/rider';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface RoutePolylineProps {
  /**
   * Array of geographic coordinates forming the polyline route path
   */
  coordinates: LocationCoordinates[];
  /**
   * Main stroke color for the route line
   * @default '#0F172A' (Slate 900)
   */
  strokeColor?: string;
  /**
   * Main stroke width of the route line in pixels
   * @default 5
   */
  strokeWidth?: number;
  /**
   * Whether to show an outer outline border behind the polyline for high contrast
   * @default true
   */
  showOutline?: boolean;
  /**
   * Color of the outer outline stroke
   * @default '#FFFFFF'
   */
  outlineColor?: string;
  /**
   * Width of the outer outline stroke in pixels
   * @default 7
   */
  outlineWidth?: number;
  /**
   * Dash pattern for dashed/dotted lines [dashLength, gapLength]
   * Pass [0] or omit for solid line.
   */
  lineDashPattern?: number[];
  /**
   * Line cap style for polyline ends ('butt' | 'round' | 'square')
   * @default 'round'
   */
  lineCap?: 'butt' | 'round' | 'square';
  /**
   * Line join style for polyline corners ('miter' | 'round' | 'bevel')
   * @default 'round'
   */
  lineJoin?: 'miter' | 'round' | 'bevel';
  /**
   * Custom zIndex for rendering priority over map layers
   * @default 10
   */
  zIndex?: number;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
  coordinates,
  strokeColor = '#0F172A',
  strokeWidth = 5,
  showOutline = true,
  outlineColor = '#FFFFFF',
  outlineWidth = 8,
  lineDashPattern,
  lineCap = 'round',
  lineJoin = 'round',
  zIndex = 10,
}) => {
  // If fewer than 2 coordinates are provided, a polyline cannot be rendered
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  // Format coordinates to ensure compatibility with react-native-maps Polyline
  const formattedCoordinates = coordinates.map((coord) => ({
    latitude: coord.latitude,
    longitude: coord.longitude,
  }));

  return (
    <>
      {/* Background Outer Casing Polyline (Provides outline contrast against map roads) */}
      {showOutline && (
        <Polyline
          coordinates={formattedCoordinates}
          strokeColor={outlineColor}
          strokeWidth={outlineWidth}
          lineCap={lineCap}
          lineJoin={lineJoin}
          zIndex={zIndex}
        />
      )}

      {/* Main Active Route Polyline */}
      <Polyline
        coordinates={formattedCoordinates}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        lineDashPattern={lineDashPattern}
        lineCap={lineCap}
        lineJoin={lineJoin}
        zIndex={zIndex + 1}
      />
    </>
  );
};

export default React.memo(RoutePolyline);