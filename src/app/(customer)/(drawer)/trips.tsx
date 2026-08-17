import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Define Trip Interface
export interface Trip {
  id: string;
  driverName: string;
  driverPhoto: string;
  vehicleModel: string;
  vehiclePlate: string;
  rating: number;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  amount: string;
  status: 'Completed' | 'Cancelled';
  cancelReason?: string;
  paymentMethod: string;
  distance: string;
  duration: string;
}

// Mock Trip Data (Replace with MongoDB backend API fetch)
const MOCK_TRIPS: Trip[] = [
  {
    id: 'SPL-89201',
    driverName: 'Emmanuel Adebayo',
    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    vehicleModel: 'Toyota Corolla 2018 (Silver)',
    vehiclePlate: 'KJA-492AA',
    rating: 4.9,
    pickupLocation: 'Murdock Rd, Ikeja, Lagos',
    dropoffLocation: 'Victoria Island, Lagos',
    date: '12 Aug 2026',
    time: '04:30 PM',
    amount: '₦4,500.00',
    status: 'Completed',
    paymentMethod: 'Spleaz Wallet',
    distance: '18.4 km',
    duration: '38 mins',
  },
  {
    id: 'SPL-78410',
    driverName: 'Chidi Okafor',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    vehicleModel: 'Honda Accord 2017 (Black)',
    vehiclePlate: 'LSD-109BC',
    rating: 4.8,
    pickupLocation: 'Murtala Muhammed Airport (LOS)',
    dropoffLocation: 'Lekki Phase 1, Lagos',
    date: '08 Aug 2026',
    time: '11:15 AM',
    amount: '₦8,200.00',
    status: 'Completed',
    paymentMethod: 'Debit Card (**** 4910)',
    distance: '32.1 km',
    duration: '55 mins',
  },
  {
    id: 'SPL-66231',
    driverName: 'Babatunde Joshua',
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    vehicleModel: 'Hyundai Elantra 2019 (Blue)',
    vehiclePlate: 'AKD-883XX',
    rating: 4.7,
    pickupLocation: 'Allen Avenue, Ikeja',
    dropoffLocation: 'Maryland Mall, Lagos',
    date: '02 Aug 2026',
    time: '02:10 PM',
    amount: '₦2,100.00',
    status: 'Cancelled',
    cancelReason: 'Driver took too long to arrive',
    paymentMethod: 'Cash',
    distance: '5.2 km',
    duration: '12 mins',
  },
  {
    id: 'SPL-55109',
    driverName: 'Funke Akindele',
    driverPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    vehicleModel: 'Kia Rio 2020 (White)',
    vehiclePlate: 'EPE-302G',
    rating: 5.0,
    pickupLocation: 'Yaba College of Tech, Yaba',
    dropoffLocation: 'Surulere Shopping Plaza',
    date: '25 Jul 2026',
    time: '09:45 AM',
    amount: '₦1,850.00',
    status: 'Completed',
    paymentMethod: 'Spleaz Wallet',
    distance: '6.8 km',
    duration: '18 mins',
  },
  {
    id: 'SPL-44102',
    driverName: 'Seyi Makinde',
    driverPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    vehicleModel: 'Toyota Camry 2015 (Red)',
    vehiclePlate: 'KTU-194AB',
    rating: 4.6,
    pickupLocation: 'Ikoyi Golf Club, Ikoyi',
    dropoffLocation: 'Banana Island, Ikoyi',
    date: '18 Jul 2026',
    time: '08:20 PM',
    amount: '₦3,400.00',
    status: 'Cancelled',
    cancelReason: 'Changed destination plan',
    paymentMethod: 'Debit Card (**** 4910)',
    distance: '4.1 km',
    duration: '10 mins',
  },
];

export default function CustomerTripsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Active Tab State: 'Completed' or 'Cancelled'
  const [activeTab, setActiveTab] = useState<'Completed' | 'Cancelled'>('Completed');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filter trips based on active tab and search text
  const filteredTrips = MOCK_TRIPS.filter((trip) => {
    const matchesTab = trip.status === activeTab;
    const matchesSearch =
      trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.dropoffLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const handleShareReceipt = async (trip: Trip) => {
    try {
      await Share.share({
        message: `Spleaz Ride Receipt (${trip.id})\nDate: ${trip.date}\nAmount: ${trip.amount}\nFrom: ${trip.pickupLocation}\nTo: ${trip.dropoffLocation}`,
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const isCompleted = item.status === 'Completed';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.tripCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => setSelectedTrip(item)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.dateRow}>
            <Text style={[styles.tripDate, { color: theme.colors.text }]}>
              {item.date} • {item.time}
            </Text>
            <Text style={[styles.tripId, { color: theme.colors.text }]}>
              {item.id}
            </Text>
          </View>
          <Text
            style={[
              styles.tripAmount,
              { color: isCompleted ? theme.colors.primary : '#E53935' },
            ]}
          >
            {isCompleted ? item.amount : 'Cancelled'}
          </Text>
        </View>

        {/* Route Details */}
        <View style={styles.routeContainer}>
          <View style={styles.timelineIndicators}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.square, { backgroundColor: '#E53935' }]} />
          </View>

          <View style={styles.routeTextContainer}>
            <Text
              numberOfLines={1}
              style={[styles.locationText, { color: theme.colors.text }]}
            >
              {item.pickupLocation}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.locationText, { color: theme.colors.text, marginTop: 12 }]}
            >
              {item.dropoffLocation}
            </Text>
          </View>
        </View>

        {/* Card Footer */}
        <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
          <View style={styles.driverInfo}>
            <Image source={{ uri: item.driverPhoto }} style={styles.driverAvatar} />
            <View>
              <Text style={[styles.driverName, { color: theme.colors.text }]}>
                {item.driverName}
              </Text>
              <Text style={[styles.vehicleText, { color: theme.colors.text }]}>
                {item.vehicleModel}
              </Text>
            </View>
          </View>

          <View style={styles.viewDetailsBadge}>
            <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>
              Details ›
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
          placeholder="Search by driver, location, or trip ID..."
          placeholderTextColor={theme.colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs Selector: Completed vs Cancelled */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Completed' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'Completed'
                    ? theme.colors.primary
                    : theme.colors.text,
                fontWeight: activeTab === 'Completed' ? '700' : '500',
              },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Cancelled' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('Cancelled')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'Cancelled'
                    ? theme.colors.primary
                    : theme.colors.text,
                fontWeight: activeTab === 'Cancelled' ? '700' : '500',
              },
            ]}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trips List */}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No {activeTab} Trips Found
            </Text>
            <Text style={[styles.emptySub, { color: theme.colors.text }]}>
              You don't have any {activeTab.toLowerCase()} ride records matching your search.
            </Text>
          </View>
        }
      />

      {/* Trip Details Modal */}
      {selectedTrip && (
        <Modal
          visible={!!selectedTrip}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedTrip(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              {/* Modal Header */}
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Trip Details ({selectedTrip.id})
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedTrip(null)}
                >
                  <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Driver & Vehicle */}
              <View style={styles.modalDriverSection}>
                <Image
                  source={{ uri: selectedTrip.driverPhoto }}
                  style={styles.modalAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalDriverName, { color: theme.colors.text }]}>
                    {selectedTrip.driverName}
                  </Text>
                  <Text style={[styles.modalVehicle, { color: theme.colors.text }]}>
                    {selectedTrip.vehicleModel} • {selectedTrip.vehiclePlate}
                  </Text>
                  <Text style={{ color: '#FFB300', fontWeight: '700', marginTop: 2 }}>
                    ★ {selectedTrip.rating}
                  </Text>
                </View>
              </View>

              {/* Route Timeline */}
              <View style={styles.modalRouteSection}>
                <View style={styles.modalTimeline}>
                  <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                  <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                  <View style={[styles.square, { backgroundColor: '#E53935' }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalLabel, { color: theme.colors.text }]}>
                    PICKUP
                  </Text>
                  <Text style={[styles.modalRouteAddress, { color: theme.colors.text }]}>
                    {selectedTrip.pickupLocation}
                  </Text>
                  <Text
                    style={[
                      styles.modalLabel,
                      { color: theme.colors.text, marginTop: 14 },
                    ]}
                  >
                    DROPOFF
                  </Text>
                  <Text style={[styles.modalRouteAddress, { color: theme.colors.text }]}>
                    {selectedTrip.dropoffLocation}
                  </Text>
                </View>
              </View>

              {/* Fare & Stats Breakdown */}
              <View style={[styles.statsRow, { backgroundColor: theme.colors.background }]}>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    DISTANCE
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {selectedTrip.distance}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    DURATION
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {selectedTrip.duration}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                    PAYMENT
                  </Text>
                  <Text
                    style={[styles.statValue, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {selectedTrip.paymentMethod}
                  </Text>
                </View>
              </View>

              {/* Status / Cancellation Info */}
              {selectedTrip.status === 'Cancelled' ? (
                <View style={styles.cancelBox}>
                  <Text style={styles.cancelTitle}>Reason for Cancellation:</Text>
                  <Text style={styles.cancelReason}>
                    {selectedTrip.cancelReason || 'Cancelled by user prior to pickup'}
                  </Text>
                </View>
              ) : (
                <View style={styles.totalBox}>
                  <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                    Total Charged:
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                    {selectedTrip.amount}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {selectedTrip.status === 'Completed' && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: theme.colors.primary + '15' },
                    ]}
                    onPress={() => handleShareReceipt(selectedTrip)}
                  >
                    <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      Share Receipt
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    setSelectedTrip(null);
                    router.push('/(customer)/(drawer)');
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    Rebook Ride
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 15,
  },
  listContent: {
    padding: 16,
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
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'column',
  },
  tripDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  tripId: {
    fontSize: 11,
    marginTop: 2,
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  timelineIndicators: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 22,
    marginVertical: 2,
  },
  square: {
    width: 8,
    height: 8,
  },
  routeTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  driverName: {
    fontSize: 13,
    fontWeight: '700',
  },
  vehicleText: {
    fontSize: 11,
  },
  viewDetailsBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalDriverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  modalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  modalDriverName: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalVehicle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalRouteSection: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  modalTimeline: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
    paddingTop: 4,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalRouteAddress: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  cancelTitle: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  cancelReason: {
    color: '#D32F2F',
    fontSize: 12,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});