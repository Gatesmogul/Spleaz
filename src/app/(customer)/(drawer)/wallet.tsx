import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const balance = useMemo(() => {
    const value = Number(
      (user as { walletBalance?: number | string } | null)?.walletBalance ?? 0
    );

    return Number.isFinite(value) ? value : 0;
  }, [user]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.surface },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backText, { color: theme.colors.text }]}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Wallet
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.balanceLabel}>Available Balance</Text>

          <Text style={styles.balance}>
            ₦
            {balance.toLocaleString('en-NG', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Wallet
          </Text>

          <Text style={[styles.description, { color: theme.colors.subtext }]}>
            Your Spleaz wallet balance and transaction history will appear
            here.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => {
            // Connect this action to the payout/withdrawal API when enabled.
          }}
          accessibilityRole="button"
          accessibilityLabel="Manage wallet"
        >
          <Text style={styles.actionText}>Manage Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 42,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});