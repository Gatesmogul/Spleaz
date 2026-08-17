import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

interface UnpaidTrip {
  id: string;
  rideCode: string;
  date: string;
  grossFare: number;
  commissionDue: number;
}

export default function DriverCommissionUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string }>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Mock list of trips requiring commission verification
  const [unpaidTrips] = useState<UnpaidTrip[]>([
    {
      id: 'trip-901',
      rideCode: 'SPL-9281',
      date: 'Today, 2:15 PM',
      grossFare: 4500,
      commissionDue: 450,
    },
    {
      id: 'trip-902',
      rideCode: 'SPL-8820',
      date: 'Yesterday, 6:30 PM',
      grossFare: 6000,
      commissionDue: 600,
    },
  ]);

  const [selectedTripId, setSelectedTripId] = useState<string>(
    params.rideId || unpaidTrips[0]?.id || ''
  );
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const selectedTrip = unpaidTrips.find((t) => t.id === selectedTripId) || unpaidTrips[0];

  // Request permissions and select image from gallery
  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Sorry, we need camera roll permissions to upload payment proof.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  // Open camera to capture physical receipt
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take receipt photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  // Upload handler with progress simulation
  const handleSubmitReceipt = () => {
    if (!receiptImage) {
      Alert.alert('Missing Proof', 'Please attach or snap a photo of your payment receipt.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const timer1 = setTimeout(() => setUploadProgress(65), 800);
    const timer2 = setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);

      Alert.alert(
        'Receipt Submitted',
        `Your receipt for ride ${selectedTrip?.rideCode} has been received. Verification usually takes less than 30 minutes.`,
        [
          {
            text: 'Back to Wallet',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Upload Commission Receipt
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SELECT TRIP CARD */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Select Trip</Text>
        <View style={styles.tripSelectorList}>
          {unpaidTrips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            return (
              <TouchableOpacity
                key={trip.id}
                activeOpacity={0.8}
                style={[
                  styles.tripChoiceCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedTripId(trip.id)}
              >
                <View style={styles.tripCardHeader}>
                  <Text style={[styles.tripCode, { color: theme.colors.text }]}>
                    Ride {trip.rideCode}
                  </Text>
                  <Text style={[styles.dueTag, { color: theme.colors.primary }]}>
                    Fee: ₦{trip.commissionDue.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.tripCardSub}>
                  <Text style={[styles.subDate, { color: theme.colors.subtext }]}>
                    {trip.date}
                  </Text>
                  <Text style={[styles.grossFare, { color: theme.colors.subtext }]}>
                    Gross: ₦{trip.grossFare.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* BANK ACCOUNT TRANSFER INFORMATION */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
          2. Platform Account Details
        </Text>
        <View
          style={[
            styles.bankInfoCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.bankRow}>
            <Text style={[styles.bankLabel, { color: theme.colors.subtext }]}>Bank Name</Text>
            <Text style={[styles.bankValue, { color: theme.colors.text }]}>GTBank Nigeria</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={[styles.bankLabel, { color: theme.colors.subtext }]}>Account Name</Text>
            <Text style={[styles.bankValue, { color: theme.colors.text }]}>
              Spleaz Driver Operations
            </Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={[styles.bankLabel, { color: theme.colors.subtext }]}>Account No.</Text>
            <Text style={[styles.bankValue, { color: theme.colors.primary, fontWeight: '900' }]}>
              0123456789
            </Text>
          </View>
        </View>

        {/* PROOF OF PAYMENT UPLOAD */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
          3. Attach Payment Proof
        </Text>

        {receiptImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setReceiptImage(null)}
            >
              <Text style={{ color: '#FFF', fontWeight: '800' }}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={handleTakePhoto}
            >
              <Text style={{ fontSize: 28, marginBottom: 4 }}>📷</Text>
              <Text style={[styles.uploadBoxText, { color: theme.colors.text }]}>Take Snap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.uploadBox,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={handleSelectImage}
            >
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🖼️</Text>
              <Text style={[styles.uploadBoxText, { color: theme.colors.text }]}>
                Choose Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OPTIONAL REFERENCE NUMBER */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
          4. Bank Ref / Session ID (Optional)
        </Text>
        <TextInput
          style={[
            styles.refInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="e.g. 1000049281928301"
          placeholderTextColor={theme.colors.subtext}
          value={paymentReference}
          onChangeText={setPaymentReference}
        />

        {/* PROGRESS INDICATOR */}
        {isUploading && (
          <View style={styles.progressSection}>
            <View
              style={[
                styles.progressBarBg,
                { backgroundColor: theme.colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: theme.colors.primary, width: `${uploadProgress}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.subtext }]}>
              Uploading receipt... {uploadProgress}%
            </Text>
          </View>
        )}

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor:
                receiptImage && !isUploading ? theme.colors.primary : theme.colors.border,
            },
          ]}
          disabled={!receiptImage || isUploading}
          onPress={handleSubmitReceipt}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Receipt for Verification</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  tripSelectorList: {
    gap: 10,
  },
  tripChoiceCard: {
    padding: 14,
    borderRadius: 14,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripCode: {
    fontSize: 15,
    fontWeight: '800',
  },
  dueTag: {
    fontSize: 14,
    fontWeight: '900',
  },
  tripCardSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  subDate: {
    fontSize: 12,
  },
  grossFare: {
    fontSize: 12,
  },
  bankInfoCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: 13,
  },
  bankValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  progressSection: {
    marginTop: 16,
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 11,
    textAlign: 'center',
  },
  submitButton: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
