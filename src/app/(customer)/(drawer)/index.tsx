import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Available Mobility Modes
interface MobilityOption {
  id: string;
  name: string;
  eta: string;
  priceMultiplier: number;
  basePrice: number;
  icon: string;
  description: string;
}

const MOBILITY_OPTIONS: MobilityOption[] = [
  {
    id: 'standard',
    name: 'Spleaz Go',
    eta: '3-5 min',
    basePrice: 1200,
    priceMultiplier: 1.0,
    icon: '🚗',
    description: 'Affordable, fast everyday rides',
  },
  {
    id: 'express',
    name: 'Express Courier',
    eta: '2-4 min',
    basePrice: 900,
    priceMultiplier: 0.8,
    icon: '📦',
    description: 'Fast package & item delivery',
  },
  {
    id: 'comfort',
    name: 'Spleaz Comfort',
    eta: '5-8 min',
    basePrice: 1800,
    priceMultiplier: 1.4,
    icon: '🚘',
    description: 'Newer cars with extra legroom',
  },
  {
    id: 'vip',
    name: 'Spleaz Executive',
    eta: '7-10 min',
    basePrice: 3500,
    priceMultiplier: 2.2,
    icon: '🚙',
    description: 'Premium luxury vehicles & top drivers',
  },
];

type BookingStep = 'IDLE' | 'SELECT_DESTINATION' | 'SELECT_MOBILITY' | 'SEARCHING_DRIVER';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Booking Flow States
  const [bookingStep, setBookingStep] = useState<BookingStep>('IDLE');
  const [pickupAddress, setPickupAddress] = useState('Current Location (Victoria Island)');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [selectedMobility, setSelectedMobility] = useState<MobilityOption>(MOBILITY_OPTIONS[0]);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);

  // Search suggestions
  const [recentLocations] = useState([
    { id: '1', title: 'Lekki Phase 1', subtitle: 'Admiralty Way, Lagos', icon: '📍' },
    { id: '2', title: 'Murtala Muhammed Airport', subtitle: 'Ikeja, Lagos', icon: '✈️' },
    { id: '3', title: 'Eko Hotels & Suites', subtitle: 'Plot 1415 Adetokunbo Ademola St', icon: '🏨' },
    { id: '4', title: 'Landmark Beach', subtitle: 'Water Corporation Dr, VI', icon: '🏖️' },
  ]);

  // Handle Location Selection
  const handleSelectDestination = (locationTitle: string) => {
    setDestinationAddress(locationTitle);
    setEstimatedDistance(8.5); // Simulated distance in km
    setBookingStep('SELECT_MOBILITY');
  };

  // Calculate estimated fare
  const calculateFare = (option: MobilityOption): number => {
    const dist = estimatedDistance || 5;
    return Math.round(option.basePrice + dist * 180 * option.priceMultiplier);
  };

  // Request Ride Handler
  const handleConfirmBooking = () => {
    setBookingStep('SEARCHING_DRIVER');

    // Simulate driver matching timeout
    setTimeout(() => {
      Alert.alert(
        'Driver Assigned!',
        'Akinwumi (Toyota Corolla - KJA 452 AB) is 3 minutes away.',
        [
          {
            text: 'Track Driver',
            onPress: () => {
              setBookingStep('IDLE');
              setDestinationAddress('');
              // Navigate to live ride tracking route if available
            },
          },
        ]
      );
    }, 3000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* MAP BACKGROUND SIMULATION */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          {/* Grid lines simulating roads */}
          <View style={[styles.mapRoadHorizontal, { top: '30%', backgroundColor: theme.colors.border }]} />
          <View style={[styles.mapRoadHorizontal, { top: '65%', backgroundColor: theme.colors.border }]} />
          <View style={[styles.mapRoadVertical, { left: '40%', backgroundColor: theme.colors.border }]} />
          <View style={[styles.mapRoadVertical, { left: '75%', backgroundColor: theme.colors.border }]} />

          {/* User Location Pin */}
          <View style={styles.userPinContainer}>
            <View style={[styles.userPinPulse, { backgroundColor: theme.colors.primary + '33' }]} />
            <View style={[styles.userPinDot, { backgroundColor: theme.colors.primary }]} />
          </View>

          {/* Driver Pins around user */}
          <Text style={[styles.driverPin, { top: '25%', left: '30%' }]}>🚗</Text>
          <Text style={[styles.driverPin, { top: '45%', left: '60%' }]}>🚕</Text>
          <Text style={[styles.driverPin, { top: '60%', left: '25%' }]}>📦</Text>
        </View>

        {/* Top Header Controls */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              // Open Drawer
              try {
                router.push('/(customer)/(drawer)/profile');
              } catch (e) {
                // Drawer menu toggle trigger
              }
            }}
          >
            <Text style={{ fontSize: 18 }}>👤</Text>
          </TouchableOpacity>

          <View style={[styles.brandBadge, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.brandText, { color: theme.colors.primary }]}>SPLEAZ</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/wallet')}
          >
            <Text style={{ fontSize: 18 }}>👛</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTTOM SHEET / INTERACTIVE BOOKING PANEL */}
      <View style={[styles.bottomSheet, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sheetHandle} />

        {/* STEP 1: IDLE / SEARCH PROMPT */}
        {bookingStep === 'IDLE' && (
          <View>
            <Text style={[styles.greetingText, { color: theme.colors.text }]}>
              Where are you heading today?
            </Text>

            <TouchableOpacity
              style={[styles.searchBar, { backgroundColor: theme.colors.background }]}
              onPress={() => setBookingStep('SELECT_DESTINATION')}
            >
              <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>
              <Text style={[styles.searchPlaceholder, { color: theme.colors.text }]}>
                Enter destination...
              </Text>
            </TouchableOpacity>

            <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>
              RECENT DESTINATIONS
            </Text>

            {recentLocations.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.recentRow, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleSelectDestination(item.title)}
              >
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.background }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.recentSubtitle, { color: theme.colors.text }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.text }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2: SELECT DESTINATION */}
        {bookingStep === 'SELECT_DESTINATION' && (
          <View style={styles.destinationStepContainer}>
            <View style={styles.stepHeader}>
              <TouchableOpacity onPress={() => setBookingStep('IDLE')}>
                <Text style={{ fontSize: 18, color: theme.colors.text }}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Plan Your Trip</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Inputs Group */}
            <View style={[styles.inputsCard, { backgroundColor: theme.colors.background }]}>
              <View style={styles.inputFieldRow}>
                <Text style={styles.fieldDotGreen}>●</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  value={pickupAddress}
                  onChangeText={setPickupAddress}
                  placeholder="Pickup location"
                  placeholderTextColor={theme.colors.text}
                />
              </View>
              <View style={[styles.inputDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.inputFieldRow}>
                <Text style={styles.fieldSquareRed}>■</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  value={destinationAddress}
                  onChangeText={setDestinationAddress}
                  placeholder="Where to?"
                  placeholderTextColor={theme.colors.text}
                  autoFocus
                />
              </View>
            </View>

            {/* Search Suggestions List */}
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {recentLocations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.recentRow, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handleSelectDestination(item.title)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.background }]}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <View style={styles.recentTextContainer}>
                    <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.recentSubtitle, { color: theme.colors.text }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* STEP 3: SELECT MOBILITY OPTION */}
        {bookingStep === 'SELECT_MOBILITY' && (
          <View>
            <View style={styles.stepHeader}>
              <TouchableOpacity onPress={() => setBookingStep('SELECT_DESTINATION')}>
                <Text style={{ fontSize: 18, color: theme.colors.text }}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Choose Mobility</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Destination summary pill */}
            <View style={[styles.summaryPill, { backgroundColor: theme.colors.background }]}>
              <Text style={{ fontSize: 12, color: theme.colors.text }}>DROP OFF AT</Text>
              <Text style={[styles.summaryText, { color: theme.colors.text }]} numberOfLines={1}>
                {destinationAddress}
              </Text>
            </View>

            {/* Options List */}
            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {MOBILITY_OPTIONS.map((option) => {
                const isSelected = selectedMobility.id === option.id;
                const price = calculateFare(option);

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.mobilityOptionCard,
                      {
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isSelected
                          ? theme.colors.primary + '10'
                          : theme.colors.background,
                      },
                    ]}
                    onPress={() => setSelectedMobility(option)}
                  >
                    <Text style={styles.mobilityIcon}>{option.icon}</Text>
                    <View style={styles.mobilityDetails}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.mobilityName, { color: theme.colors.text }]}>
                          {option.name}
                        </Text>
                        <Text style={[styles.etaBadge, { color: theme.colors.text }]}>
                          • {option.eta}
                        </Text>
                      </View>
                      <Text style={[styles.mobilityDesc, { color: theme.colors.text }]}>
                        {option.description}
                      </Text>
                    </View>
                    <Text style={[styles.priceText, { color: theme.colors.text }]}>
                      ₦{price.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Confirm Request Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleConfirmBooking}
            >
              <Text style={styles.primaryButtonText}>
                Confirm {selectedMobility.name} • ₦{calculateFare(selectedMobility).toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: SEARCHING DRIVER STATE */}
        {bookingStep === 'SEARCHING_DRIVER' && (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.searchingTitle, { color: theme.colors.text }]}>
              Connecting with nearby drivers...
            </Text>
            <Text style={[styles.searchingSubtitle, { color: theme.colors.text }]}>
              Matching you with the nearest {selectedMobility.name} driver.
            </Text>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => setBookingStep('SELECT_MOBILITY')}
            >
              <Text style={{ color: '#E53935', fontWeight: '700' }}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    opacity: 0.4,
  },
  mapRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    opacity: 0.4,
  },
  userPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinPulse: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: 'absolute',
  },
  userPinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  driverPin: {
    position: 'absolute',
    fontSize: 22,
  },
  topHeader: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  brandBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 14,
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  destinationStepContainer: {
    gap: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  inputsCard: {
    borderRadius: 14,
    padding: 12,
  },
  inputFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  fieldDotGreen: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 10,
  },
  fieldSquareRed: {
    color: '#E53935',
    fontSize: 12,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  inputDivider: {
    height: 1,
    marginVertical: 4,
    marginLeft: 24,
  },
  summaryPill: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  mobilityOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  mobilityIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  mobilityDetails: {
    flex: 1,
  },
  mobilityName: {
    fontSize: 15,
    fontWeight: '800',
  },
  etaBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  mobilityDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  searchingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  searchingTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 16,
  },
  searchingSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
});
