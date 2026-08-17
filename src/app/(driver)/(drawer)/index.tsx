import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Image,
  Animated,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface RideRequest {
  id: string;
  rideCode: string;
  riderName: string;
  riderPhoto: string;
  riderRating: number;
  pickupAddress: string;
  dropoffAddress: string;
  distanceToPickupKm: number;
  tripDistanceKm: number;
  estimatedDurationMins: number;
  fareAmount: number;
  paymentMethod: 'Wallet' | 'Cash' | 'Card';
}

export default function DriverDashboardMapScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Driver Availability State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [acceptCountdown, setAcceptCountdown] = useState<number>(15);

  // Today's Quick Summary Metrics
  const [todayEarnings] = useState<number>(18500);
  const [completedToday] = useState<number>(6);
  const [acceptanceRate] = useState<number>(98);

  // Radar Pulsing Animation for Online State
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mock Incoming Ride Request Stream
  const sampleRequest: RideRequest = {
    id: 'req-8812',
    rideCode: 'SPL-9901',
    riderName: 'Amina Bello',
    riderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    riderRating: 4.9,
    pickupAddress: 'Admiralty Way, Lekki Phase 1',
    dropoffAddress: 'Victoria Island, Lagos (Eko Hotels)',
    distanceToPickupKm: 1.2,
    tripDistanceKm: 7.8,
    estimatedDurationMins: 18,
    fareAmount: 3800,
    paymentMethod: 'Wallet',
  };

  // Pulse animation controller
  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  // Simulate an incoming dispatch request after going online
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOnline && !activeRequest) {
      timer = setTimeout(() => {
        setActiveRequest(sampleRequest);
        setAcceptCountdown(15);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isOnline, activeRequest]);

  // Acceptance Countdown Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRequest && acceptCountdown > 0) {
      interval = setInterval(() => {
        setAcceptCountdown((prev) => prev - 1);
      }, 1000);
    } else if (acceptCountdown === 0) {
      // Auto-decline when countdown runs out
      handleDeclineRequest();
    }
    return () => clearInterval(interval);
  }, [activeRequest, acceptCountdown]);

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleAcceptRequest = () => {
    if (!activeRequest) return;
    const currentRide = activeRequest;
    setActiveRequest(null);
    Alert.alert(
      'Ride Accepted! 🎉',
      `Head over to pickup location: ${currentRide.pickupAddress}`,
      [
        {
          text: 'Navigate to Pickup',
          onPress: () => router.push(`/chat/${currentRide.id}`),
        },
      ]
    );
  };

  const handleDeclineRequest = () => {
    setActiveRequest(null);
  };

  const handleTriggerSOS = () => {
    Alert.alert(
      'Emergency Assistance',
      'Are you sure you want to broadcast an emergency dispatch alert to Spleaz Safety Team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => Alert.alert('SOS Triggered', 'Security team notified.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* TOP FLOATING HEADER / STATUS BAR */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity style={styles.menuButton} onPress={handleOpenDrawer}>
          <Text style={[styles.menuIcon, { color: theme.colors.text }]}>☰</Text>
        </TouchableOpacity>

        <View style={styles.statusToggleContainer}>
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? '#4CAF50' : theme.colors.subtext },
            ]}
          >
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
            thumbColor={isOnline ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.sosButton} onPress={handleTriggerSOS}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK DAILY PERFORMANCE BAR */}
      <View
        style={[
          styles.statsBar,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.colors.subtext }]}>Today</Text>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            ₦{todayEarnings.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.colors.subtext }]}>Rides</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{completedToday}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.colors.subtext }]}>Acceptance</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{acceptanceRate}%</Text>
        </View>
      </View>

      {/* LIVE MAP PLACEHOLDER CANVAS */}
      <View style={styles.mapCanvas}>
        {/* Simulated Map Visual elements */}
        <View style={[styles.mapGridLine, { top: '30%' }]} />
        <View style={[styles.mapGridLine, { top: '65%' }]} />
        <View style={[styles.mapGridLineVertical, { left: '40%' }]} />

        {/* DRIVER RADAR PIN */}
        <View style={styles.driverPinContainer}>
          {isOnline && (
            <Animated.View
              style={[
                styles.radarPulse,
                {
                  backgroundColor: theme.colors.primary + '35',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          )}
          <View style={[styles.carMarker, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ fontSize: 18 }}>🚘</Text>
          </View>
        </View>

        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>You are currently Offline</Text>
            <Text style={styles.offlineBannerSub}>
              Toggle switch above to start receiving ride requests
            </Text>
          </View>
        )}
      </View>

      {/* RIDE REQUEST POPUP MODAL */}
      <Modal
        visible={!!activeRequest}
        animationType="slide"
        transparent={true}
        onRequestClose={handleDeclineRequest}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.requestCard, { backgroundColor: theme.colors.surface }]}>
            {/* COUNTDOWN PROGRESS BAR */}
            <View style={styles.countdownHeader}>
              <Text style={[styles.requestTitle, { color: theme.colors.text }]}>
                New Ride Request!
              </Text>
              <View style={[styles.timerBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.timerText}>{acceptCountdown}s</Text>
              </View>
            </View>

            {activeRequest && (
              <>
                {/* RIDER INFO */}
                <View style={[styles.riderRow, { backgroundColor: theme.colors.background }]}>
                  <Image
                    source={{ uri: activeRequest.riderPhoto }}
                    style={styles.riderAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.riderName, { color: theme.colors.text }]}>
                      {activeRequest.riderName}
                    </Text>
                    <Text style={styles.ratingText}>★ {activeRequest.riderRating.toFixed(1)}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.fareText, { color: theme.colors.primary }]}>
                      ₦{activeRequest.fareAmount.toLocaleString()}
                    </Text>
                    <Text style={[styles.payMethod, { color: theme.colors.subtext }]}>
                      {activeRequest.paymentMethod}
                    </Text>
                  </View>
                </View>

                {/* TRIP ROUTE */}
                <View style={styles.routeBox}>
                  <View style={styles.routePoint}>
                    <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pointLabel, { color: theme.colors.subtext }]}>
                        PICKUP ({activeRequest.distanceToPickupKm} km away)
                      </Text>
                      <Text
                        style={[styles.addressText, { color: theme.colors.text }]}
                        numberOfLines={1}
                      >
                        {activeRequest.pickupAddress}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routePoint}>
                    <View style={[styles.dot, { backgroundColor: '#E53935' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pointLabel, { color: theme.colors.subtext }]}>
                        DROPOFF ({activeRequest.tripDistanceKm} km • ~
                        {activeRequest.estimatedDurationMins} mins)
                      </Text>
                      <Text
                        style={[styles.addressText, { color: theme.colors.text }]}
                        numberOfLines={1}
                      >
                        {activeRequest.dropoffAddress}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.declineBtn, { borderColor: theme.colors.border }]}
                    onPress={handleDeclineRequest}
                  >
                    <Text style={[styles.declineBtnText, { color: theme.colors.text }]}>
                      Decline
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.acceptBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleAcceptRequest}
                  >
                    <Text style={styles.acceptBtnText}>ACCEPT RIDE</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sosButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 9,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E8ECEF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mapGridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  driverPinContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  carMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  offlineBanner: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  offlineBannerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  requestCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  timerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 12,
    marginBottom: 14,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  riderName: {
    fontSize: 15,
    fontWeight: '800',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB300',
    marginTop: 2,
  },
  fareText: {
    fontSize: 18,
    fontWeight: '900',
  },
  payMethod: {
    fontSize: 11,
    fontWeight: '600',
  },
  routeBox: {
    gap: 12,
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pointLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  acceptBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
