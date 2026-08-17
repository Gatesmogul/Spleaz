import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { RideBooking } from '../../api/rider';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface TripItemProps {
  /**
   * Trip/Ride data object
   */
  trip: RideBooking;
  /**
   * Optional customer name override if not provided in trip details
   */
  customerName?: string;
  /**
   * Callback fired when pressing the item container
   */
  onPress?: (tripId: string) => void;
  /**
   * Callback fired when pressing the Chat button
   */
  onChatPress?: (tripId: string) => void;
  /**
   * Callback fired when pressing the Upload Commission Receipt button
   */
  onUploadReceiptPress?: (tripId: string) => void;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return { bg: '#DCFCE7', text: '#15803D' }; // Green
    case 'IN_PROGRESS':
    case 'ARRIVING':
      return { bg: '#DBEAFE', text: '#1D4ED8' }; // Blue
    case 'CANCELLED':
      return { bg: '#FEE2E2', text: '#B91C1C' }; // Red
    default:
      return { bg: '#FEF3C7', text: '#B45309' }; // Amber/Yellow
  }
};

// ==========================================
// 3. COMPONENT IMPLEMENTATION
// ==========================================

export const TripItem: React.FC<TripItemProps> = ({
  trip,
  customerName = 'Customer',
  onPress,
  onChatPress,
  onUploadReceiptPress,
  containerStyle,
}) => {
  const statusColors = getStatusBadgeStyle(trip.status);

  return (
    <TouchableOpacity
      style={[styles.card, containerStyle]}
      onPress={() => onPress && onPress(trip.id)}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      {/* Top Header: Date, Time & Status Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.dateText}>{formatDate(trip.createdAt)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {trip.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Customer & Fare Info */}
      <View style={styles.infoRow}>
        <View style={styles.customerContainer}>
          <Text style={styles.customerLabel}>Rider</Text>
          <Text style={styles.customerName}>{customerName}</Text>
        </View>
        <View style={styles.fareContainer}>
          <Text style={styles.fareLabel}>Fare</Text>
          <Text style={styles.fareAmount}>
            {trip.currency || '$'}{(trip.fareAmount ?? 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Pickup & Destination Timeline */}
      <View style={styles.routeContainer}>
        {/* Pickup */}
        <View style={styles.routeRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.addressText} numberOfLines={1}>
            {trip.pickupLocation.addressName ||
              `${trip.pickupLocation.latitude.toFixed(4)}, ${trip.pickupLocation.longitude.toFixed(4)}`}
          </Text>
        </View>

        {/* Route Connecting Line */}
        <View style={styles.verticalLine} />

        {/* Destination */}
        <View style={styles.routeRow}>
          <View style={styles.destinationSquare} />
          <Text style={styles.addressText} numberOfLines={1}>
            {trip.destinationLocation.addressName ||
              `${trip.destinationLocation.latitude.toFixed(4)}, ${trip.destinationLocation.longitude.toFixed(4)}`}
          </Text>
        </View>
      </View>

      {/* Footer Tags & Actions */}
      <View style={styles.footerRow}>
        <View style={styles.tagContainer}>
          <Text style={styles.mobilityTag}>{trip.mobilityType}</Text>
          <Text style={styles.paymentTag}>{trip.paymentMethod}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {onChatPress && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => onChatPress(trip.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.chatButtonText}>💬 Chat</Text>
            </TouchableOpacity>
          )}

          {onUploadReceiptPress && trip.status === 'COMPLETED' && (
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => onUploadReceiptPress(trip.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.receiptButtonText}>📄 Receipt</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// 4. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerContainer: {
    flex: 1,
  },
  customerLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  fareAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981', // Green Earnings
    marginTop: 2,
  },
  routeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 10,
  },
  verticalLine: {
    width: 2,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginLeft: 3,
    marginVertical: 2,
  },
  destinationSquare: {
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  mobilityTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  receiptButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  receiptButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TripItem;