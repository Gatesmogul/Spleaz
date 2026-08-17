import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

type RideStatus = 'DRIVER_ASSIGNED' | 'ARRIVING' | 'IN_PROGRESS' | 'COMPLETED';

interface DriverDetails {
  name: string;
  rating: number;
  totalTrips: number;
  phone: string;
  vehicleModel: string;
  plateNumber: string;
  color: string;
  photoUrl: string;
}

export default function RealTimeTrackingScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Ride & Tracking States
  const [status, setStatus] = useState<RideStatus>('DRIVER_ASSIGNED');
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [isPriceBreakdownVisible, setIsPriceBreakdownVisible] = useState(false);

  // Driver Information
  const driver: DriverDetails = {
    name: 'Akinwumi Adeleke',
    rating: 4.92,
    totalTrips: 1840,
    phone: '+2348039876543',
    vehicleModel: 'Toyota Corolla (2020)',
    plateNumber: 'KJA 452 AB',
    color: 'Silver Metallic',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  };

  // Upfront Fare Structure
  const fareDetails = {
    baseFare: 500,
    distanceFare: 1200,
    timeFare: 350,
    serviceFee: 150,
    discount: 200,
    totalUpfrontPrice: 2000,
    paymentMethod: 'Spleaz Wallet (•••• 8421)',
  };

  // Simulated Animated Progress for Map Driver Pin
  const driverProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate driver moving along simulated route
    Animated.loop(
      Animated.sequence([
        Animated.timing(driverProgress, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(driverProgress, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Status transition simulation for demonstration
    const statusTimer = setTimeout(() => {
      setStatus('ARRIVING');
      setEtaMinutes(2);
    }, 8000);

    return () => clearTimeout(statusTimer);
  }, []);

  const handleCallDriver = () => {
    Linking.openURL(`tel:${driver.phone}`).catch(() =>
      Alert.alert('Error', 'Unable to initiate call from this device.')
    );
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Trip',
      'Are you sure you want to cancel? A cancellation fee of ₦300 may apply.',
      [
        { text: 'Keep Ride', style: 'cancel' },
        {
          text: 'Cancel Ride',
          style: 'destructive',
          onPress: () => router.replace('/(customer)/(drawer)'),
        },
      ]
    );
  };

  const handleTriggerSOS = () => {
    Alert.alert(
      'Emergency Safety Assistance',
      'This will immediately share your live location with emergency contacts and Spleaz Security dispatch.',
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'Send SOS Alert', style: 'destructive', onPress: () => Alert.alert('SOS Triggered', 'Dispatch team notified.') },
      ]
    );
  };

  // Interpolate animated position for map pin movement
  const translateX = driverProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 40],
  });

  const translateY = driverProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 30],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* SIMULATED MAP TRACKING VIEW */}
      <View style={styles.mapContainer}>
        <View style={styles.mapTerrain}>
          {/* Simulated Roads */}
          <View style={[styles.mapRoadMain, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.mapRoadCross, { backgroundColor: theme.colors.border }]} />

          {/* Pickup Marker */}
          <View style={[styles.pinMarker, { top: '35%', left: '30%' }]}>
            <View style={styles.pickupPinDot} />
            <Text style={styles.pinLabel}>Pickup</Text>
          </View>

          {/* Destination Marker */}
          <View style={[styles.pinMarker, { top: '65%', left: '70%' }]}>
            <Text style={{ fontSize: 20 }}>🏁</Text>
          </View>

          {/* Animated Driver Vehicle Marker */}
          <Animated.View
            style={[
              styles.driverVehiclePin,
              {
                transform: [{ translateX }, { translateY }],
                top: '45%',
                left: '45%',
              },
            ]}
          >
            <View style={[styles.driverBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ fontSize: 16 }}>🚗</Text>
            </View>
          </Animated.View>
        </View>

        {/* Top Floating Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 18, color: theme.colors.text }}>←</Text>
          </TouchableOpacity>

          <View style={[styles.rideIdBadge, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.rideIdText, { color: theme.colors.text }]}>
              RIDE #{rideId || 'SPL-9281'}
            </Text>
          </View>

          <TouchableOpacity style={styles.sosButton} onPress={handleTriggerSOS}>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TRACKING BOTTOM SHEET */}
      <View style={[styles.bottomSheet, { backgroundColor: theme.colors.surface }]}>
        {/* Status Header */}
        <View style={styles.statusHeaderRow}>
          <View>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              {status === 'DRIVER_ASSIGNED' && 'Driver on the way'}
              {status === 'ARRIVING' && 'Driver is arriving now'}
              {status === 'IN_PROGRESS' && 'Heading to Destination'}
              {status === 'COMPLETED' && 'Trip Completed'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: theme.colors.subtext }]}>
              Estimated arrival in <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>{etaMinutes} mins</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.pricePill, { backgroundColor: theme.colors.primary + '15' }]}
            onPress={() => setIsPriceBreakdownVisible(true)}
          >
            <Text style={[styles.pricePillLabel, { color: theme.colors.subtext }]}>Upfront Price</Text>
            <Text style={[styles.pricePillAmount, { color: theme.colors.primary }]}>
              ₦{fareDetails.totalUpfrontPrice.toLocaleString()} ℹ️
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Driver Profile Card */}
        <View style={styles.driverCard}>
          <Image source={{ uri: driver.photoUrl }} style={styles.driverAvatar} />

          <View style={styles.driverDetails}>
            <View style={styles.driverNameRow}>
              <Text style={[styles.driverName, { color: theme.colors.text }]}>{driver.name}</Text>
              <Text style={styles.ratingText}>★ {driver.rating}</Text>
            </View>

            <Text style={[styles.vehicleInfo, { color: theme.colors.subtext }]}>
              {driver.vehicleModel} • {driver.color}
            </Text>

            <View style={[styles.plateBadge, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.plateText, { color: theme.colors.text }]}>{driver.plateNumber}</Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleCallDriver}
          >
            <Text style={styles.actionBtnIcon}>📞</Text>
            <Text style={styles.actionBtnText}>Call Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.background }]}
            onPress={() => Alert.alert('Chat', 'Opening in-app chat with driver...')}
          >
            <Text style={styles.actionBtnIcon}>💬</Text>
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: '#E53935' }]}
            onPress={handleCancelRide}
          >
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* UPFRONT PRICE BREAKDOWN MODAL */}
      <Modal
        visible={isPriceBreakdownVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPriceBreakdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Upfront Price Guaranteed</Text>
              <TouchableOpacity onPress={() => setIsPriceBreakdownVisible(false)}>
                <Text style={{ color: theme.colors.subtext, fontSize: 18, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.guaranteeText, { color: theme.colors.subtext }]}>
              Your fare is locked in unless the route or destination changes significantly during the trip.
            </Text>

            <View style={styles.breakdownList}>
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: theme.colors.text }]}>Base Fare</Text>
                <Text style={[styles.fareValue, { color: theme.colors.text }]}>₦{fareDetails.baseFare}</Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: theme.colors.text }]}>Distance & Estimated Time</Text>
                <Text style={[styles.fareValue, { color: theme.colors.text }]}>
                  ₦{fareDetails.distanceFare + fareDetails.timeFare}
                </Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: theme.colors.text }]}>Service & Safety Fee</Text>
                <Text style={[styles.fareValue, { color: theme.colors.text }]}>₦{fareDetails.serviceFee}</Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: '#4CAF50' }]}>Promo Discount</Text>
                <Text style={[styles.fareValue, { color: '#4CAF50' }]}>-₦{fareDetails.discount}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.fareRow}>
                <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total Fare</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  ₦{fareDetails.totalUpfrontPrice.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.paymentMethodRow, { backgroundColor: theme.colors.background }]}>
                <Text style={{ fontSize: 16 }}>💳</Text>
                <Text style={[styles.paymentMethodText, { color: theme.colors.text }]}>
                  {fareDetails.paymentMethod}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsPriceBreakdownVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapTerrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E4E8EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapRoadMain: {
    position: 'absolute',
    width: '100%',
    height: 18,
    transform: [{ rotate: '-25deg' }],
  },
  mapRoadCross: {
    position: 'absolute',
    height: '100%',
    width: 18,
    transform: [{ rotate: '-25deg' }],
  },
  pinMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  pickupPinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  driverVehiclePin: {
    position: 'absolute',
  },
  driverBadge: {
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  rideIdBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
  },
  rideIdText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sosButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 3,
  },
  sosText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  statusSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  pricePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'flex-end',
  },
  pricePillLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  pricePillAmount: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverDetails: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFB300',
  },
  vehicleInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  plateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  guaranteeText: {
    fontSize: 12,
    marginVertical: 12,
    lineHeight: 18,
  },
  breakdownList: {
    gap: 10,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeModalBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});