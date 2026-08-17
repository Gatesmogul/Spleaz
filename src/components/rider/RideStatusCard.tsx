import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type RideStatus =
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'ARRIVING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DriverInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  totalTrips: number;
  phoneNumber: string;
  vehicleModel: string; // e.g. "Toyota Corolla"
  vehicleColor: string; // e.g. "Silver"
  vehiclePlate: string; // e.g. "KJA-8392-XX"
}

export interface RideStatusCardProps {
  /**
   * Active state status of the ride
   */
  status: RideStatus;
  /**
   * Driver details object (optional while searching)
   */
  driver?: DriverInfo;
  /**
   * Estimated arrival time in minutes
   */
  etaMinutes?: number;
  /**
   * Security OTP code for the rider to give the driver before starting ride
   */
  pinCode?: string;
  /**
   * Callback fired when pressing the Call button
   */
  onCallDriver?: () => void;
  /**
   * Callback fired when pressing the Chat button
   */
  onChatDriver?: () => void;
  /**
   * Callback fired when pressing the Cancel Ride button
   */
  onCancelRide?: () => void;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const getStatusConfig = (status: RideStatus, etaMinutes?: number) => {
  switch (status) {
    case 'SEARCHING':
      return {
        title: 'Finding your driver...',
        subtitle: 'Connecting you with a nearby Spleaz driver',
        badgeBg: '#FEF3C7',
        badgeText: '#B45309',
        statusLabel: 'Searching',
      };
    case 'DRIVER_ASSIGNED':
    case 'ARRIVING':
      return {
        title: etaMinutes ? `Driver arriving in ${etaMinutes} mins` : 'Driver is on the way',
        subtitle: 'Please wait at your pickup location',
        badgeBg: '#DBEAFE',
        badgeText: '#1D4ED8',
        statusLabel: 'Arriving',
      };
    case 'IN_PROGRESS':
      return {
        title: 'Trip in progress',
        subtitle: 'Sit back and enjoy your ride to the destination',
        badgeBg: '#DCFCE7',
        badgeText: '#15803D',
        statusLabel: 'On the Way',
      };
    case 'COMPLETED':
      return {
        title: 'You have arrived!',
        subtitle: 'Thank you for riding with Spleaz',
        badgeBg: '#DCFCE7',
        badgeText: '#15803D',
        statusLabel: 'Completed',
      };
    case 'CANCELLED':
      return {
        title: 'Trip Cancelled',
        subtitle: 'This ride request has been cancelled',
        badgeBg: '#FEE2E2',
        badgeText: '#B91C1C',
        statusLabel: 'Cancelled',
      };
  }
};

// ==========================================
// 3. COMPONENT IMPLEMENTATION
// ==========================================

export const RideStatusCard: React.FC<RideStatusCardProps> = ({
  status,
  driver,
  etaMinutes,
  pinCode,
  onCallDriver,
  onChatDriver,
  onCancelRide,
  containerStyle,
}) => {
  const statusConfig = getStatusConfig(status, etaMinutes);
  const isDriverAssigned = driver && status !== 'SEARCHING' && status !== 'CANCELLED';

  return (
    <View style={[styles.card, containerStyle]}>
      {/* Top Header: Dynamic Status Banner */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.statusTitle}>{statusConfig.title}</Text>
          <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.badgeBg }]}>
          <Text style={[styles.statusBadgeText, { color: statusConfig.badgeText }]}>
            {statusConfig.statusLabel}
          </Text>
        </View>
      </View>

      {/* Driver & Vehicle Details Section */}
      {isDriverAssigned ? (
        <>
          <View style={styles.divider} />

          <View style={styles.driverRow}>
            {/* Driver Avatar */}
            <View style={styles.avatarContainer}>
              {driver.avatarUrl ? (
                <Image source={{ uri: driver.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {driver.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Driver Name & Ratings */}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.tripsText}>{driver.totalTrips} rides</Text>
              </View>
            </View>

            {/* Verification Security PIN Code */}
            {pinCode && status === 'ARRIVING' && (
              <View style={styles.pinContainer}>
                <Text style={styles.pinLabel}>PIN</Text>
                <Text style={styles.pinCode}>{pinCode}</Text>
              </View>
            )}
          </View>

          {/* Vehicle Information Box */}
          <View style={styles.vehicleBox}>
            <View style={styles.vehicleLeft}>
              <Text style={styles.vehicleIcon}>🚘</Text>
              <View>
                <Text style={styles.vehicleModel}>
                  {driver.vehicleColor} {driver.vehicleModel}
                </Text>
                <Text style={styles.vehiclePlateLabel}>License Plate</Text>
              </View>
            </View>
            <View style={styles.plateBadge}>
              <Text style={styles.plateText}>{driver.vehiclePlate}</Text>
            </View>
          </View>

          {/* Action Buttons: Contact & Cancel */}
          <View style={styles.actionsRow}>
            {onCallDriver && (
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={onCallDriver}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>📞</Text>
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {onChatDriver && (
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={onChatDriver}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionButtonText}>Chat</Text>
              </TouchableOpacity>
            )}

            {onCancelRide && status !== 'COMPLETED' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancelRide}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        /* Searching loader / Cancel fallback when no driver assigned */
        onCancelRide &&
        status === 'SEARCHING' && (
          <View style={styles.searchingActionsContainer}>
            <TouchableOpacity
              style={styles.cancelButtonFull}
              onPress={onCancelRide}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel Search</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

// ==========================================
// 4. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },

  // Driver details
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  starIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  tripsText: {
    fontSize: 12,
    color: '#64748B',
  },
  pinContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  pinCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
  },

  // Vehicle info
  vehicleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vehicleIcon: {
    fontSize: 22,
  },
  vehicleModel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  vehiclePlateLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  plateBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  plateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Action buttons
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  searchingActionsContainer: {
    marginTop: 14,
  },
  cancelButtonFull: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RideStatusCard;