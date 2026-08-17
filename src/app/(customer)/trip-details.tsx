import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

export default function TripDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tripId?: string }>();
  const { theme } = useTheme();

  const tripId = params.tripId ? String(params.tripId) : '';

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
            Trip Details
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.subtext }]}>
            Trip ID
          </Text>

          <Text style={[styles.value, { color: theme.colors.text }]}>
            {tripId || 'Unavailable'}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Trip information
          </Text>

          <Text
            style={[
              styles.description,
              { color: theme.colors.subtext },
            ]}
          >
            Detailed trip information will be loaded from the Spleaz MongoDB
            backend when the trip ID is available.
          </Text>
        </View>

        {tripId ? (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() =>
              router.push({
                pathname: '/(customer)/tracking/[rideId]',
                params: { rideId: tripId },
              })
            }
            accessibilityRole="button"
            accessibilityLabel="View trip tracking"
          >
            <Text style={styles.buttonText}>View Trip Tracking</Text>
          </TouchableOpacity>
        ) : null}
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
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
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
  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});