import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import CustomButton from '../common/CustomButton';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier?: number;
  discountAmount?: number;
}

export interface UpfrontPriceCardProps {
  /**
   * Title of the selected mobility type (e.g., "Spleaz Standard")
   */
  mobilityTitle: string;
  /**
   * Total upfront calculated fare amount
   */
  totalFare: number;
  /**
   * Currency symbol/code to display
   * @default '$'
   */
  currency?: string;
  /**
   * Optional detailed breakdown of the fare
   */
  fareBreakdown?: FareBreakdown;
  /**
   * Estimated duration of the trip in minutes
   */
  durationMinutes?: number;
  /**
   * Estimated distance in kilometers or miles
   */
  distanceText?: string;
  /**
   * Currently selected payment method string (e.g., "Cash", "Card •••• 4242", "Wallet")
   * @default 'Cash'
   */
  paymentMethod?: string;
  /**
   * Callback fired when rider clicks the primary request button
   */
  onRequestRide: () => void;
  /**
   * Callback fired when rider clicks to change payment method
   */
  onChangePaymentMethod?: () => void;
  /**
   * Loading state for the request button
   */
  isLoading?: boolean;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const UpfrontPriceCard: React.FC<UpfrontPriceCardProps> = ({
  mobilityTitle,
  totalFare,
  currency = '$',
  fareBreakdown,
  durationMinutes,
  distanceText,
  paymentMethod = 'Cash',
  onRequestRide,
  onChangePaymentMethod,
  isLoading = false,
  containerStyle,
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const toggleBreakdown = () => {
    setShowBreakdown((prev) => !prev);
  };

  const discount = fareBreakdown?.discountAmount || 0;
  const finalPrice = Math.max(0, totalFare - discount);

  return (
    <View style={[styles.card, containerStyle]}>
      {/* Top Main Fare Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.mobilityTitle}>{mobilityTitle}</Text>
          <View style={styles.estimateMetaRow}>
            {durationMinutes !== undefined && (
              <Text style={styles.estimateMetaText}>⏱️ {durationMinutes} mins</Text>
            )}
            {durationMinutes !== undefined && distanceText && (
              <Text style={styles.metaDot}>•</Text>
            )}
            {distanceText && (
              <Text style={styles.estimateMetaText}>📍 {distanceText}</Text>
            )}
          </View>
        </View>

        {/* Fare Display */}
        <View style={styles.priceContainer}>
          <Text style={styles.totalPrice}>
            {currency}
            {finalPrice.toFixed(2)}
          </Text>

          {/* Toggle Fare Breakdown Accordion */}
          {fareBreakdown && (
            <TouchableOpacity
              onPress={toggleBreakdown}
              activeOpacity={0.7}
              style={styles.breakdownToggle}
            >
              <Text style={styles.breakdownToggleText}>
                {showBreakdown ? 'Hide details ▲' : 'Fare details ▼'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Expandable Fare Breakdown */}
      {showBreakdown && fareBreakdown && (
        <View style={styles.breakdownBox}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Fare</Text>
            <Text style={styles.breakdownValue}>
              {currency}
              {fareBreakdown.baseFare.toFixed(2)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Distance & Time Rate</Text>
            <Text style={styles.breakdownValue}>
              {currency}
              {(fareBreakdown.distanceFare + fareBreakdown.timeFare).toFixed(2)}
            </Text>
          </View>

          {fareBreakdown.surgeMultiplier && fareBreakdown.surgeMultiplier > 1 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Demand Surge</Text>
              <Text style={styles.surgeValue}>
                {fareBreakdown.surgeMultiplier}x
              </Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.discountLabel}>Promo Discount</Text>
              <Text style={styles.discountValue}>
                -{currency}
                {discount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {/* Payment Method Selector Row */}
      <View style={styles.paymentRow}>
        <View style={styles.paymentLeft}>
          <Text style={styles.paymentIcon}>💳</Text>
          <View>
            <Text style={styles.paymentMethodLabel}>Payment Method</Text>
            <Text style={styles.paymentMethodValue}>{paymentMethod}</Text>
          </View>
        </View>

        {onChangePaymentMethod && (
          <TouchableOpacity
            onPress={onChangePaymentMethod}
            activeOpacity={0.7}
            style={styles.changePaymentBtn}
          >
            <Text style={styles.changePaymentText}>Change</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Request Action Button */}
      <CustomButton
        title={`Confirm & Request ${mobilityTitle}`}
        onPress={onRequestRide}
        isLoading={isLoading}
        style={styles.confirmButton}
      />
    </View>
  );
};

// ==========================================
// 3. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  mobilityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  estimateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  estimateMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metaDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  breakdownToggle: {
    marginTop: 4,
    paddingVertical: 2,
  },
  breakdownToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Breakdown accordion box
  breakdownBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  surgeValue: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '800',
  },
  discountLabel: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },

  // Payment method selection
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentMethodLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentMethodValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  changePaymentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  changePaymentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  confirmButton: {
    marginBottom: 0,
  },
});

export default UpfrontPriceCard;