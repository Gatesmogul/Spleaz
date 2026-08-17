import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import CustomButton from '../common/CustomButton';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface DriverArrivalInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  totalTrips: number;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  phoneNumber: string;
}

export interface DriverArrivalCardProps {
  /**
   * Driver and vehicle details
   */
  driver: DriverArrivalInfo;
  /**
   * Verification PIN to share with the driver
   */
  pinCode?: string;
  /**
   * Pickup address name
   */
  pickupAddress?: string;
  /**
   * Callback fired when rider confirms they are heading to the vehicle
   */
  onIHaveArrived?: () => void;
  /**
   * Callback fired when rider clicks the Call Driver button
   */
  onCallDriver?: () => void;
  /**
   * Callback fired when rider clicks the Chat Driver button
   */
  onChatDriver?: () => void;
  /**
   * Loading state for the action button
   */
  isLoading?: boolean;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const DriverArrivalCard: React.FC<DriverArrivalCardProps> = ({
  driver,
  pinCode,
  pickupAddress,
  onIHaveArrived,
  onCallDriver,
  onChatDriver,
  isLoading = false,
  containerStyle,
}) => {
  return (
    <View style={[styles.card, containerStyle]}>
      {/* Top Arrival Alert Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeIcon}>📍</Text>
          <Text style={styles.bannerBadgeText}>DRIVER HAS ARRIVED</Text>
        </View>
        <Text style={styles.bannerTitle}>Meet {driver.name.split(' ')[0]} at pickup</Text>
        {pickupAddress && (
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {pickupAddress}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Driver & PIN Info Row */}
      <View style={styles.driverRow}>
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

        <View style={styles.driverMeta}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.tripsText}>{driver.totalTrips} trips</Text>
          </View>
        </View>

        {/* Verification PIN */}
        {pinCode && (
          <View style={styles.pinContainer}>
            <Text style={styles.pinLabel}>RIDE PIN</Text>
            <Text style={styles.pinCode}>{pinCode}</Text>
          </View>
        )}
      </View>

      {/* Vehicle Info Box */}
      <View style={styles.vehicleBox}>
        <View style={styles.vehicleLeft}>
          <Text style={styles.vehicleIcon}>🚘</Text>
          <View>
            <Text style={styles.vehicleTitle}>
              {driver.vehicleColor} {driver.vehicleModel}
            </Text>
            <Text style={styles.vehicleSub}>Vehicle match verification</Text>
          </View>
        </View>
        <View style={styles.plateBadge}>
          <Text style={styles.plateText}>{driver.vehiclePlate}</Text>
        </View>
      </View>

      {/* Action Buttons: Contact & Readiness */}
      <View style={styles.actionsRow}>
        {onCallDriver && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCallDriver}
            activeOpacity={0.7}
          >
            <Text style={styles.iconButtonText}>📞 Call</Text>
          </TouchableOpacity>
        )}

        {onChatDriver && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onChatDriver}
            activeOpacity={0.7}
          >
            <Text style={styles.iconButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Primary Readiness Button */}
      {onIHaveArrived && (
        <CustomButton
          title="I'm Walking Out Now"
          onPress={onIHaveArrived}
          isLoading={isLoading}
          style={styles.arrivedButton}
        />
      )}
    </View>
  );
};

// ==========================================
// 3. STYLESHEET
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
  bannerContainer: {
    alignItems: 'flex-start',
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginBottom: 6,
  },
  bannerBadgeIcon: {
    fontSize: 10,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    marginBottom: 14,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  driverMeta: {
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
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
  },

  // Vehicle Details Box
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
  vehicleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  vehicleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  plateBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  plateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Contact actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  iconButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  arrivedButton: {
    marginBottom: 0,
  },
});

export default DriverArrivalCard;