import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface CancellationReason {
  id: string;
  label: string;
  appliesFee: boolean;
}

const CANCELLATION_REASONS: CancellationReason[] = [
  {
    id: '1',
    label: 'Driver is taking too long to arrive',
    appliesFee: false,
  },
  {
    id: '2',
    label: 'Driver requested to cancel',
    appliesFee: false,
  },
  {
    id: '3',
    label: 'Accidentally requested the wrong ride option',
    appliesFee: true,
  },
  {
    id: '4',
    label: 'Pickup location was incorrect',
    appliesFee: true,
  },
  {
    id: '5',
    label: 'Found alternative transportation',
    appliesFee: true,
  },
  {
    id: '6',
    label: 'Other reason',
    appliesFee: true,
  },
];

export default function CancelRideScreen() {
  const router = useRouter();

  const { rideId } = useLocalSearchParams<{
    rideId?: string;
  }>();

  const { theme } = useTheme();

  const [selectedReasonId, setSelectedReasonId] =
    useState<string>('');

  const [customReasonText, setCustomReasonText] =
    useState<string>('');

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const selectedReason = CANCELLATION_REASONS.find(
    (reason) => reason.id === selectedReasonId
  );

  const handleConfirmCancellation = (): void => {
    if (!selectedReasonId) {
      Alert.alert(
        'Select a Reason',
        'Please choose a reason for cancelling your ride.'
      );
      return;
    }

    if (
      selectedReasonId === '6' &&
      !customReasonText.trim()
    ) {
      Alert.alert(
        'Provide Details',
        'Please type your cancellation reason in the text box.'
      );
      return;
    }

    Alert.alert(
      'Confirm Cancellation',
      selectedReason?.appliesFee
        ? 'A standard cancellation fee of $1 will be charged to your wallet.'
        : 'No fee will be charged for this cancellation.',
      [
        {
          text: 'Keep Ride',
          style: 'cancel',
        },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: processCancellation,
        },
      ]
    );
  };

  const processCancellation = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Temporary simulated API request.
      // Replace this block with the real cancellation API call
      // when the backend endpoint is connected.
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1200);
      });

      Alert.alert(
        'Trip Cancelled',
        'Your ride request has been successfully cancelled.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace('/(customer)/(drawer)'),
          },
        ]
      );
    } catch (error) {
      console.error(
        'Failed to cancel trip:',
        error
      );

      Alert.alert(
        'Error',
        'Failed to cancel the trip. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor:
              theme.colors.surface,
            borderBottomColor:
              theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text
            style={[
              styles.backIcon,
              {
                color: theme.colors.text,
              },
            ]}
          >
            ✕
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Cancel Trip
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* RIDE IDENTIFIER & WARNING BANNER */}
        <View
          style={[
            styles.rideInfoCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.rideIdText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            TRIP #{rideId || 'SPL-9281'}
          </Text>

          {selectedReason?.appliesFee ? (
            <View
              style={[
                styles.feeNoticeBanner,
                {
                  backgroundColor: '#FFF3E0',
                  borderColor: '#FFE0B2',
                },
              ]}
            >
              <Text
                style={styles.feeNoticeIcon}
              >
                ⚠️
              </Text>

              <Text
                style={[
                  styles.feeNoticeText,
                  {
                    color: '#E65100',
                  },
                ]}
              >
                A cancellation fee of{' '}
                <Text
                  style={{
                    fontWeight: '800',
                  }}
                >
                  ₦300
                </Text>{' '}
                applies because driver has been
                en-route for over 2 minutes.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.feeNoticeBanner,
                {
                  backgroundColor: '#E8F5E9',
                  borderColor: '#C8E6C9',
                },
              ]}
            >
              <Text
                style={styles.feeNoticeIcon}
              >
                ✅
              </Text>

              <Text
                style={[
                  styles.feeNoticeText,
                  {
                    color: '#2E7D32',
                  },
                ]}
              >
                Free cancellation period active.
                No fee will be charged.
              </Text>
            </View>
          )}
        </View>

        {/* SECTION TITLE */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Why are you cancelling?
        </Text>

        {/* REASON LIST */}
        <View style={styles.reasonList}>
          {CANCELLATION_REASONS.map(
            (item) => {
              const isSelected =
                item.id === selectedReasonId;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[
                    styles.reasonCard,
                    {
                      backgroundColor:
                        theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() =>
                    setSelectedReasonId(item.id)
                  }
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: isSelected,
                  }}
                  accessibilityLabel={
                    item.label
                  }
                >
                  <View
                    style={styles.radioContainer}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            {
                              backgroundColor:
                                theme.colors.primary,
                            },
                          ]}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color:
                            theme.colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* CUSTOM REASON */}
        {selectedReasonId === '6' && (
          <View
            style={styles.customInputContainer}
          >
            <TextInput
              style={[
                styles.customTextInput,
                {
                  backgroundColor:
                    theme.colors.surface,
                  borderColor:
                    theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Please describe your reason..."
              placeholderTextColor={
                theme.colors.subtext
              }
              multiline
              numberOfLines={3}
              value={customReasonText}
              onChangeText={
                setCustomReasonText
              }
              textAlignVertical="top"
              accessibilityLabel="Cancellation reason details"
            />
          </View>
        )}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              theme.colors.surface,
            borderTopColor:
              theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.keepRideButton,
            {
              backgroundColor:
                theme.colors.background,
            },
          ]}
          onPress={() => router.back()}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Keep ride"
        >
          <Text
            style={[
              styles.keepRideText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Keep Ride
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelConfirmButton,
            {
              backgroundColor: selectedReasonId
                ? '#E53935'
                : theme.colors.border,
            },
          ]}
          disabled={
            !selectedReasonId ||
            isSubmitting
          }
          onPress={
            handleConfirmCancellation
          }
          accessibilityRole="button"
          accessibilityLabel="Confirm cancellation"
          accessibilityState={{
            disabled:
              !selectedReasonId ||
              isSubmitting,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <Text
              style={
                styles.cancelConfirmText
              }
            >
              Confirm Cancel
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 32,
    height: 32,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  rideInfoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },

  rideIdText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  feeNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  feeNoticeIcon: {
    fontSize: 16,
  },

  feeNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },

  reasonList: {
    gap: 10,
  },

  reasonCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },

  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  customInputContainer: {
    marginTop: 14,
  },

  customTextInput: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },

  footer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
  },

  keepRideButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  keepRideText: {
    fontSize: 15,
    fontWeight: '700',
  },

  cancelConfirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});