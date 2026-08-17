import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../common/CustomButton';
import CustomInput from '../common/CustomInput';
import { driverApi, CommissionReceiptUploadPayload } from '../../api/driver';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface ReceiptUploaderProps {
  /**
   * Optional specific ride ID associated with this commission payment
   */
  rideId?: string;
  /**
   * Pre-filled commission amount due
   */
  defaultAmount?: number;
  /**
   * Currency symbol/code (e.g. "$", "NGN", "USD")
   * @default '$'
   */
  currency?: string;
  /**
   * Callback fired upon successful receipt upload
   */
  onSuccess?: () => void;
  /**
   * Callback fired when user cancels or closes the uploader
   */
  onCancel?: () => void;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  rideId,
  defaultAmount,
  currency = '$',
  onSuccess,
  onCancel,
  containerStyle,
}) => {
  const [amountPaid, setAmountPaid] = useState<string>(
    defaultAmount ? defaultAmount.toString() : ''
  );
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ------------------------------------------
  // Camera & Gallery Image Picker Handlers
  // ------------------------------------------
  const requestMediaPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, Spleaz needs media library access to pick receipt photos.'
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, Spleaz needs camera access to capture receipt photos.'
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
      setErrorMessage(null);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
      setErrorMessage(null);
    }
  };

  // ------------------------------------------
  // Form Submission
  // ------------------------------------------
  const handleSubmit = async () => {
    // Basic validation
    if (!amountPaid || isNaN(Number(amountPaid)) || Number(amountPaid) <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }

    if (!selectedImageUri) {
      setErrorMessage('Please capture or select a receipt photo.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload: CommissionReceiptUploadPayload = {
        rideId,
        amountPaid: parseFloat(amountPaid),
        paymentReference: paymentReference.trim() || undefined,
        receiptImageUri: selectedImageUri,
      };

      await driverApi.uploadCommissionReceipt(payload);

      Alert.alert(
        'Receipt Uploaded',
        'Your commission receipt has been submitted for verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[ReceiptUploader Error]:', error);
      setErrorMessage(
        error?.response?.data?.message || 'Failed to upload receipt. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.card, containerStyle]}>
      {/* Title */}
      <Text style={styles.title}>Upload Commission Receipt</Text>
      <Text style={styles.subtitle}>
        Provide proof of payment for commission settlement
      </Text>

      {/* Amount Input */}
      <CustomInput
        label={`Amount Paid (${currency})`}
        placeholder="e.g. 25.00"
        keyboardType="decimal-pad"
        value={amountPaid}
        onChangeText={(text) => {
          setAmountPaid(text);
          if (errorMessage) setErrorMessage(null);
        }}
      />

      {/* Transaction Ref Input */}
      <CustomInput
        label="Bank / Transfer Reference (Optional)"
        placeholder="e.g. TXN100293848"
        value={paymentReference}
        onChangeText={setPaymentReference}
      />

      {/* Image Upload Area */}
      <Text style={styles.label}>Receipt Photo</Text>
      {selectedImageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={() => setSelectedImageUri(null)}
          >
            <Text style={styles.changePhotoText}>Remove & Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoActionsRow}>
          <TouchableOpacity
            style={styles.pickButton}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <Text style={styles.pickButtonIcon}>📷</Text>
            <Text style={styles.pickButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickButton}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            <Text style={styles.pickButtonIcon}>🖼️</Text>
            <Text style={styles.pickButtonText}>Pick Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <CustomButton
          title="Submit Receipt"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />

        {onCancel && (
          <CustomButton
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            disabled={isSubmitting}
            style={styles.cancelButton}
          />
        )}
      </View>
    </View>
  );
};

// ==========================================
// 3. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pickButton: {
    flex: 1,
    height: 90,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickButtonIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  changePhotoButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 12,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    marginTop: 8,
    gap: 10,
  },
  submitButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginBottom: 0,
  },
});

export default ReceiptUploader;