import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

interface Transaction {
  id: string;
  type: 'RIDE_EARNING' | 'COMMISSION_DEDUCTION' | 'CASHOUT';
  title: string;
  date: string;
  amount: number;
  isCredit: boolean;
}

export default function DriverAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Wallet & Earnings State
  const [availableBalance, setAvailableBalance] = useState<number>(42800);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(128500);
  const [pendingCommission, setPendingCommission] = useState<number>(12850); // 10% platform fee
  const [isCashoutModalVisible, setIsCashoutModalVisible] = useState<boolean>(false);
  const [isPayCommissionModalVisible, setIsPayCommissionModalVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Weekly bar data representation
  const weeklyBarData = [
    { day: 'Mon', amount: 18000, max: 25000 },
    { day: 'Tue', amount: 22500, max: 25000 },
    { day: 'Wed', amount: 15000, max: 25000 },
    { day: 'Thu', amount: 24000, max: 25000 },
    { day: 'Fri', amount: 21000, max: 25000 },
    { day: 'Sat', amount: 28000, max: 30000 },
    { day: 'Sun', amount: 0, max: 25000 },
  ];

  // Transaction Ledger History
  const [transactions] = useState<Transaction[]>([
    {
      id: 'tx-101',
      type: 'RIDE_EARNING',
      title: 'Trip #SPL-9281 (Lekki -> Ikeja)',
      date: 'Today, 2:15 PM',
      amount: 4500,
      isCredit: true,
    },
    {
      id: 'tx-102',
      type: 'COMMISSION_DEDUCTION',
      title: 'Platform Fee (10% SPL-9281)',
      date: 'Today, 2:15 PM',
      amount: 450,
      isCredit: false,
    },
    {
      id: 'tx-103',
      type: 'CASHOUT',
      title: 'Bank Withdrawal (GTBank - 012****89)',
      date: 'Yesterday, 6:30 PM',
      amount: 35000,
      isCredit: false,
    },
    {
      id: 'tx-104',
      type: 'RIDE_EARNING',
      title: 'Trip #SPL-8820 (VI -> Victoria Island)',
      date: 'Yesterday, 4:10 PM',
      amount: 3200,
      isCredit: true,
    },
  ]);

  const handleCashout = async () => {
    if (availableBalance <= 0) {
      Alert.alert('Insufficient Balance', 'You have no withdrawable balance available.');
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAvailableBalance(0);
      setIsCashoutModalVisible(false);
      Alert.alert('Withdrawal Successful', '₦' + availableBalance.toLocaleString() + ' has been transferred to your registered bank account.');
    } catch (error) {
      Alert.alert('Transfer Error', 'Unable to process cashout. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayCommission = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPendingCommission(0);
      setIsPayCommissionModalVisible(false);
      Alert.alert('Commission Settled', 'Thank you! Your platform commission balance has been updated.');
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to settle commission.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.txCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.txIconBadge, { backgroundColor: item.isCredit ? '#E8F5E9' : '#FFEBEE' }]}>
        <Text style={{ fontSize: 16 }}>{item.isCredit ? '📥' : '📤'}</Text>
      </View>

      <View style={styles.txInfo}>
        <Text style={[styles.txTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.txDate, { color: theme.colors.subtext }]}>{item.date}</Text>
      </View>

      <Text
        style={[
          styles.txAmount,
          { color: item.isCredit ? '#2E7D32' : '#C62828' },
        ]}
      >
        {item.isCredit ? '+' : '-'}₦{item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER BAR */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
          <Text style={[styles.menuIcon, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Driver Account & Wallet</Text>
        <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert('Support', 'Connecting to Driver Support...')}>
          <Text style={{ fontSize: 18 }}>🎧</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* MAIN WALLET CARD */}
        <View style={[styles.walletCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.walletHeaderRow}>
            <Text style={styles.walletLabel}>Withdrawable Balance</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Active Payouts</Text>
            </View>
          </View>

          <Text style={styles.balanceAmount}>₦{availableBalance.toLocaleString()}</Text>

          <View style={styles.walletActionsRow}>
            <TouchableOpacity
              style={[styles.walletBtn, { backgroundColor: '#FFFFFF' }]}
              onPress={() => setIsCashoutModalVisible(true)}
            >
              <Text style={[styles.walletBtnText, { color: theme.colors.primary }]}>Instant Cashout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.walletBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: '#FFF' }]}
              onPress={() => setIsPayCommissionModalVisible(true)}
            >
              <Text style={[styles.walletBtnText, { color: '#FFFFFF' }]}>Pay Commission</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* METRICS SUMMARY GRID */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.subtext }]}>This Week's Gross</Text>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              ₦{weeklyEarnings.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.subtext }]}>Platform Fee Due</Text>
            <Text style={[styles.metricValue, { color: pendingCommission > 0 ? '#E65100' : theme.colors.text }]}>
              ₦{pendingCommission.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* WEEKLY EARNINGS BAR CHART */}
        <View style={[styles.chartCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Weekly Earnings Breakdown</Text>
            <Text style={[styles.chartSub, { color: theme.colors.subtext }]}>Avg. ₦18.3k / day</Text>
          </View>

          <View style={styles.barsContainer}>
            {weeklyBarData.map((bar, index) => {
              const heightPercent = Math.min((bar.amount / bar.max) * 100, 100);
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: heightPercent > 0 ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDayText, { color: theme.colors.subtext }]}>{bar.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* TRANSACTIONS LEDGER */}
        <View style={styles.txHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => Alert.alert('Export', 'Downloading monthly statement PDF...')}>
            <Text style={[styles.exportText, { color: theme.colors.primary }]}>Statement 📄</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          scrollEnabled={false}
          contentContainerStyle={styles.txList}
        />
      </ScrollView>

      {/* CASHOUT MODAL */}
      <Modal
        visible={isCashoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCashoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Confirm Instant Cashout</Text>
            <Text style={[styles.modalSub, { color: theme.colors.subtext }]}>
              Withdraw funds directly into your verified bank account.
            </Text>

            <View style={[styles.bankCard, { backgroundColor: theme.colors.background }]}>
              <Text style={{ fontSize: 20 }}>🏦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bankName, { color: theme.colors.text }]}>Guaranty Trust Bank</Text>
                <Text style={[styles.bankAcc, { color: theme.colors.subtext }]}>0123456789 • Akinwumi A.</Text>
              </View>
            </View>

            <View style={styles.modalAmountRow}>
              <Text style={[styles.modalAmountLabel, { color: theme.colors.subtext }]}>Transfer Amount:</Text>
              <Text style={[styles.modalAmountValue, { color: theme.colors.primary }]}>
                ₦{availableBalance.toLocaleString()}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { backgroundColor: theme.colors.background }]}
                onPress={() => setIsCashoutModalVisible(false)}
                disabled={isProcessing}
              >
                <Text style={[styles.modalBtnCancelText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnConfirm, { backgroundColor: theme.colors.primary }]}
                onPress={handleCashout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Confirm Transfer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* COMMISSION PAY MODAL */}
      <Modal
        visible={isPayCommissionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPayCommissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Settle Platform Commission</Text>
            <Text style={[styles.modalSub, { color: theme.colors.subtext }]}>
              Pay outstanding platform fees to maintain active driver dispatch status.
            </Text>

            <View style={styles.modalAmountRow}>
              <Text style={[styles.modalAmountLabel, { color: theme.colors.subtext }]}>Fee Owed (10%):</Text>
              <Text style={[styles.modalAmountValue, { color: '#E65100' }]}>
                ₦{pendingCommission.toLocaleString()}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { backgroundColor: theme.colors.background }]}
                onPress={() => setIsPayCommissionModalVisible(false)}
                disabled={isProcessing}
              >
                <Text style={[styles.modalBtnCancelText, { color: theme.colors.text }]}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnConfirm, { backgroundColor: theme.colors.primary }]}
                onPress={handlePayCommission}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            </View>
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
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  helpButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
  },
  walletCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 14,
  },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  walletBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  chartCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  chartSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  exportText: {
    fontSize: 13,
    fontWeight: '700',
  },
  txList: {
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  txIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
  },
  bankAcc: {
    fontSize: 12,
    marginTop: 2,
  },
  modalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalAmountValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnConfirm: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
