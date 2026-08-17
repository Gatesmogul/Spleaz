import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

interface CompletedTrip {
  id: string;
  rideCode: string;
  customerName: string;
  customerPhoto: string;
  customerRating: number;
  pickupLocation: string;
  dropoffLocation: string;
  fareAmount: number;
  commissionFee: number;
  netEarned: number;
  paymentMethod: 'Cash' | 'Wallet' | 'Card';
  completedAt: string;
  filterTag: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
  distanceKm: number;
  durationMins: number;
  customerFeedback?: string;
}

type TimeFilter = 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export default function DriverCompletedTripsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('ALL');
  const [selectedTrip, setSelectedTrip] = useState<CompletedTrip | null>(null);

  // Mock Completed Trips Dataset
  const [trips] = useState<CompletedTrip[]>([
    {
      id: 'trip-001',
      rideCode: 'SPL-9281',
      customerName: 'Bisi Akande',
      customerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      customerRating: 5.0,
      pickupLocation: 'Admiralty Way, Lekki Phase 1',
      dropoffLocation: 'Computer Village, Ikeja',
      fareAmount: 4500,
      commissionFee: 450,
      netEarned: 4050,
      paymentMethod: 'Wallet',
      completedAt: 'Today, 2:15 PM',
      filterTag: 'TODAY',
      distanceKm: 24.5,
      durationMins: 42,
      customerFeedback: 'Very polite driver and smooth ride!',
    },
    {
      id: 'trip-002',
      rideCode: 'SPL-8820',
      customerName: 'Chidi Okonkwo',
      customerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      customerRating: 4.8,
      pickupLocation: 'Victoria Island, Lagos',
      dropoffLocation: 'Muri Okunola Park, VI',
      fareAmount: 2200,
      commissionFee: 220,
      netEarned: 1980,
      paymentMethod: 'Cash',
      completedAt: 'Today, 11:30 AM',
      filterTag: 'TODAY',
      distanceKm: 6.2,
      durationMins: 15,
    },
    {
      id: 'trip-003',
      rideCode: 'SPL-7634',
      customerName: 'Fatima Umar',
      customerPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      customerRating: 5.0,
      pickupLocation: 'Chevron Tollgate, Ajah',
      dropoffLocation: 'Eko Hotels, VI',
      fareAmount: 6800,
      commissionFee: 680,
      netEarned: 6120,
      paymentMethod: 'Card',
      completedAt: 'Yesterday, 6:45 PM',
      filterTag: 'THIS_WEEK',
      distanceKm: 18.0,
      durationMins: 38,
      customerFeedback: 'Clean car and great AC.',
    },
    {
      id: 'trip-004',
      rideCode: 'SPL-6211',
      customerName: 'David Wright',
      customerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      customerRating: 4.5,
      pickupLocation: 'Murtala Muhammed Airport T2',
      dropoffLocation: 'Radisson Blu, Ikeja',
      fareAmount: 5500,
      commissionFee: 550,
      netEarned: 4950,
      paymentMethod: 'Wallet',
      completedAt: '3 days ago',
      filterTag: 'THIS_WEEK',
      distanceKm: 9.4,
      durationMins: 22,
    },
  ]);

  // Filtered dataset derivation
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.dropoffLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.rideCode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'TODAY') return trip.filterTag === 'TODAY';
      if (activeFilter === 'THIS_WEEK')
        return trip.filterTag === 'TODAY' || trip.filterTag === 'THIS_WEEK';
      if (activeFilter === 'THIS_MONTH') return true;

      return true;
    });
  }, [trips, searchQuery, activeFilter]);

  // Aggregate Metrics Calculations
  const totalNetEarnings = useMemo(() => {
    return filteredTrips.reduce((acc, trip) => acc + trip.netEarned, 0);
  }, [filteredTrips]);

  const renderTripItem = ({ item }: { item: CompletedTrip }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.tripCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
      onPress={() => setSelectedTrip(item)}
    >
      {/* CARD TOP HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.customerRow}>
          <Image source={{ uri: item.customerPhoto }} style={styles.customerAvatar} />
          <View>
            <Text style={[styles.customerName, { color: theme.colors.text }]}>
              {item.customerName}
            </Text>
            <Text style={[styles.tripTime, { color: theme.colors.subtext }]}>
              {item.completedAt} • {item.rideCode}
            </Text>
          </View>
        </View>

        <View style={styles.earningsBadge}>
          <Text style={[styles.netAmount, { color: theme.colors.primary }]}>
            +₦{item.netEarned.toLocaleString()}
          </Text>
          <Text style={[styles.paymentMethodTag, { color: theme.colors.subtext }]}>
            {item.paymentMethod}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* ROUTE PREVIEW */}
      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <View style={[styles.dotMarker, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.routeText, { color: theme.colors.text }]} numberOfLines={1}>
            {item.pickupLocation}
          </Text>
        </View>

        <View style={styles.routeItem}>
          <View style={[styles.dotMarker, { backgroundColor: '#E53935' }]} />
          <Text style={[styles.routeText, { color: theme.colors.text }]} numberOfLines={1}>
            {item.dropoffLocation}
          </Text>
        </View>
      </View>

      {/* STATS FOOTER */}
      <View style={[styles.cardFooter, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.statText, { color: theme.colors.subtext }]}>
          📏 {item.distanceKm} km
        </Text>
        <Text style={[styles.statText, { color: theme.colors.subtext }]}>
          ⏱️ {item.durationMins} mins
        </Text>
        <Text style={[styles.statText, { color: '#FFB300', fontWeight: '700' }]}>
          ★ {item.customerRating.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* SCREEN HEADER */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Completed Trips</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* OVERVIEW METRICS BANNER */}
      <View style={[styles.metricsBanner, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.colors.subtext }]}>Total Rides</Text>
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>{filteredTrips.length}</Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.colors.subtext }]}>Net Earnings</Text>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
            ₦{totalNetEarnings.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* SEARCH INPUT BAR */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search passenger, code, or location..."
            placeholderTextColor={theme.colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: theme.colors.subtext, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* TIME FILTER PILLS */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {(['ALL', 'TODAY', 'THIS_WEEK', 'THIS_MONTH'] as TimeFilter[]).map((filter) => {
            const isActive = activeFilter === filter;
            const labels: Record<TimeFilter, string> = {
              ALL: 'All Trips',
              TODAY: 'Today',
              THIS_WEEK: 'This Week',
              THIS_MONTH: 'This Month',
            };

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {labels[filter]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* COMPLETED TRIPS LIST */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🚕</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Trips Found</Text>
            <Text style={[styles.emptySub, { color: theme.colors.subtext }]}>
              There are no completed rides matching your filter criteria.
            </Text>
          </View>
        }
      />

      {/* TRIP DETAIL BREAKDOWN MODAL */}
      <Modal
        visible={!!selectedTrip}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTrip(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {selectedTrip && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    Trip Details ({selectedTrip.rideCode})
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedTrip(null)}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.subtext }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* PASSENGER CARD */}
                <View style={[styles.modalCustomerCard, { backgroundColor: theme.colors.background }]}>
                  <Image source={{ uri: selectedTrip.customerPhoto }} style={styles.modalAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalCustomerName, { color: theme.colors.text }]}>
                      {selectedTrip.customerName}
                    </Text>
                    <Text style={[styles.modalRating, { color: '#FFB300' }]}>
                      ★ {selectedTrip.customerRating.toFixed(1)} Rating
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.supportBtn, { borderColor: theme.colors.border }]}
                    onPress={() => Alert.alert('Support', 'Help ticket opened for trip ' + selectedTrip.rideCode)}
                  >
                    <Text style={[styles.supportBtnText, { color: theme.colors.text }]}>Help</Text>
                  </TouchableOpacity>
                </View>

                {/* FARE BREAKDOWN */}
                <Text style={[styles.breakdownHeader, { color: theme.colors.text }]}>Earnings Breakdown</Text>

                <View style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: theme.colors.subtext }]}>Gross Fare Charged</Text>
                  <Text style={[styles.fareValue, { color: theme.colors.text }]}>
                    ₦{selectedTrip.fareAmount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: theme.colors.subtext }]}>Spleaz Service Fee (10%)</Text>
                  <Text style={[styles.fareValue, { color: '#E53935' }]}>
                    -₦{selectedTrip.commissionFee.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.fareRow}>
                  <Text style={[styles.netLabel, { color: theme.colors.text }]}>Your Net Payout</Text>
                  <Text style={[styles.netValue, { color: theme.colors.primary }]}>
                    ₦{selectedTrip.netEarned.toLocaleString()}
                  </Text>
                </View>

                {selectedTrip.customerFeedback && (
                  <View style={[styles.feedbackBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Text style={[styles.feedbackTitle, { color: theme.colors.primary }]}>Customer Feedback</Text>
                    <Text style={[styles.feedbackText, { color: theme.colors.text }]}>
                      "{selectedTrip.customerFeedback}"
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setSelectedTrip(null)}
                >
                  <Text style={styles.closeModalBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  metricsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: '60%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterBar: {
    marginVertical: 10,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  tripCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
  },
  tripTime: {
    fontSize: 11,
    marginTop: 2,
  },
  earningsBadge: {
    alignItems: 'flex-end',
  },
  netAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  paymentMethodTag: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  routeContainer: {
    gap: 8,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCustomerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 12,
    marginBottom: 16,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  modalCustomerName: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalRating: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  supportBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  supportBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  fareLabel: {
    fontSize: 13,
  },
  fareValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  netLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  netValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 13,
    fontStyle: 'italic',
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
