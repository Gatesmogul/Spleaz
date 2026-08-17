import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Define Trip Interface
export interface Trip {
  id: string;
  driverName: string;
  driverRating: number;
  vehicleModel: string;
  licensePlate: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  fare: string;
  status: 'Completed' | 'Cancelled';
  cancelReason?: string;
}

// Mock Trip Data
const INITIAL_TRIPS: Trip[] = [
  {
    id: 'SPZ-8921',
    driverName: 'Emmanuel Adebayo',
    driverRating: 4.8,
    vehicleModel: 'Toyota Corolla (Silver)',
    licensePlate: 'LSD-432AE',
    pickupLocation: 'Victoria Island, Lagos',
    dropoffLocation: 'Ikeja City Mall, Ikeja',
    date: '12 Aug 2026, 02:45 PM',
    fare: '₦4,500',
    status: 'Completed',
  },
  {
    id: 'SPZ-7734',
    driverName: 'Chidi Okafor',
    driverRating: 4.6,
    vehicleModel: 'Honda Accord (Black)',
    licensePlate: 'KJA-119BC',
    pickupLocation: 'Lekki Phase 1, Lagos',
    dropoffLocation: 'Murtala Muhammed Airport, Ikeja',
    date: '10 Aug 2026, 08:15 AM',
    fare: '₦8,200',
    status: 'Completed',
  },
  {
    id: 'SPZ-6102',
    driverName: 'Babatunde Olawale',
    driverRating: 4.9,
    vehicleModel: 'Hyundai Elantra (White)',
    licensePlate: 'FST-882XY',
    pickupLocation: 'Surulere, Lagos',
    dropoffLocation: 'Yaba Tech, Yaba',
    date: '08 Aug 2026, 06:30 PM',
    fare: '₦2,800',
    status: 'Cancelled',
    cancelReason: 'Driver delayed too long',
  },
  {
    id: 'SPZ-5510',
    driverName: 'Ibrahim Musa',
    driverRating: 4.7,
    vehicleModel: 'Kia Rio (Blue)',
    licensePlate: 'EPE-504AA',
    pickupLocation: 'Gbagada, Lagos',
    dropoffLocation: 'Landmark Beach, VI',
    date: '01 Aug 2026, 01:10 PM',
    fare: '₦5,100',
    status: 'Completed',
  },
  {
    id: 'SPZ-4019',
    driverName: 'Samuel Okon',
    driverRating: 4.5,
    vehicleModel: 'Toyota Camry (Red)',
    licensePlate: 'BDG-993KL',
    pickupLocation: 'Ajah, Lagos',
    dropoffLocation: 'Ikoyi, Lagos',
    date: '25 Jul 2026, 09:00 AM',
    fare: '₦6,000',
    status: 'Cancelled',
    cancelReason: 'Change of plans',
  },
];

type FilterTab = 'All' | 'Completed' | 'Cancelled';

export default function CustomerTripsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch Trips
  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API or Firestore fetch delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTrips(INITIAL_TRIPS);
    } catch (error) {
      console.error('Failed to load trips history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [loadTrips]);

  // Filter trips by active tab and search query
  const filteredTrips = trips.filter((trip) => {
    const matchesTab =
      activeTab === 'All' ? true : trip.status === activeTab;
    const matchesSearch =
      trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.dropoffLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Render individual trip item
  const renderTripItem = ({ item }: { item: Trip }) => {
    const isCompleted = item.status === 'Completed';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tripCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() =>
          router.push({
            pathname: '/trip-details',
            params: { tripId: item.id },
          })
        }
      >
        {/* Header: Date & Status */}
        <View style={styles.cardHeader}>
          <Text style={[styles.tripDate, { color: theme.colors.text }]}>
            {item.date}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isCompleted ? '#E8F5E9' : '#FFEBEE',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isCompleted ? '#2E7D32' : '#C62828' },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Driver & Vehicle Summary */}
        <View style={styles.driverRow}>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: theme.colors.text }]}>
              {item.driverName}
            </Text>
            <Text style={[styles.vehicleText, { color: theme.colors.text }]}>
              {item.vehicleModel} • {item.licensePlate}
            </Text>
          </View>
          <Text style={[styles.fareText, { color: theme.colors.primary }]}>
            {item.fare}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Route Details */}
        <View style={styles.routeContainer}>
          {/* Pickup */}
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <Text
              style={[styles.locationText, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {item.pickupLocation}
            </Text>
          </View>

          <View style={styles.verticalLine} />

          {/* Dropoff */}
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#E53935' }]} />
            <Text
              style={[styles.locationText, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {item.dropoffLocation}
            </Text>
          </View>
        </View>

        {/* Cancellation Reason (If Cancelled) */}
        {!isCompleted && item.cancelReason && (
          <View style={styles.cancelReasonBox}>
            <Text style={styles.cancelReasonText}>
              Reason: {item.cancelReason}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Your Trips
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Search by location or driver..."
          placeholderTextColor={theme.colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {(['All', 'Completed', 'Cancelled'] as FilterTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                isActive && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
                !isActive && {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? '#FFFFFF' : theme.colors.text,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Trips List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          renderItem={renderTripItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Trips Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.text }]}>
                {searchQuery
                  ? 'Try adjusting your search query.'
                  : `You have no ${activeTab.toLowerCase()} trips.`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14,
  },
  tripCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
  },
  vehicleText: {
    fontSize: 12,
    marginTop: 2,
  },
  fareText: {
    fontSize: 17,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  routeContainer: {
    gap: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  verticalLine: {
    width: 1.5,
    height: 12,
    backgroundColor: '#BDBDBD',
    marginLeft: 3.2,
    marginVertical: 1,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  cancelReasonBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
  },
  cancelReasonText: {
    fontSize: 12,
    color: '#F57F17',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
