import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type MobilityType = 'STANDARD' | 'PREMIUM' | 'SHARED';

export interface MobilityOption {
  id: MobilityType;
  title: string;
  description: string;
  etaMinutes: number;
  capacity: number;
  estimatedPrice: number;
  icon: string;
  badge?: string;
}

export interface MobilitySelectorProps {
  /**
   * Currently selected mobility type ID
   */
  selectedType: MobilityType;
  /**
   * Callback fired when customer selects a mobility option
   */
  onSelectOption: (option: MobilityOption) => void;
  /**
   * Currency symbol/code to display
   * @default '$'
   */
  currency?: string;
  /**
   * Price multiplier applied based on demand surge or discount (e.g. 1.2 = 20% surge)
   * @default 1.0
   */
  priceMultiplier?: number;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. DEFAULT MOBILITY OPTIONS DATA
// ==========================================

const DEFAULT_OPTIONS: MobilityOption[] = [
  {
    id: 'STANDARD',
    title: 'Spleaz Standard',
    description: 'Affordable, reliable everyday rides',
    etaMinutes: 3,
    capacity: 4,
    estimatedPrice: 12.5,
    icon: '🚗',
    badge: 'Popular',
  },
  {
    id: 'PREMIUM',
    title: 'Spleaz Premium',
    description: 'Top-rated drivers & luxury vehicles',
    etaMinutes: 5,
    capacity: 4,
    estimatedPrice: 22.0,
    icon: '🚘',
    badge: 'Comfort',
  },
  {
    id: 'SHARED',
    title: 'Spleaz Shared',
    description: 'Split fare with co-riders along your route',
    etaMinutes: 7,
    capacity: 2,
    estimatedPrice: 7.8,
    icon: '👥',
    badge: 'Save 35%',
  },
];

// ==========================================
// 3. COMPONENT IMPLEMENTATION
// ==========================================

export const MobilitySelector: React.FC<MobilitySelectorProps> = ({
  selectedType,
  onSelectOption,
  currency = '$',
  priceMultiplier = 1.0,
  containerStyle,
}) => {
  const renderOptionItem = ({ item }: { item: MobilityOption }) => {
    const isSelected = selectedType === item.id;
    const finalPrice = (item.estimatedPrice * priceMultiplier).toFixed(2);

    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
        ]}
        onPress={() => onSelectOption(item)}
        activeOpacity={0.85}
      >
        {/* Left Side: Vehicle Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.vehicleIcon}>{item.icon}</Text>
        </View>

        {/* Center: Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.optionTitle}>{item.title}</Text>
            {item.badge && (
              <View
                style={[
                  styles.badge,
                  item.id === 'SHARED' ? styles.badgeGreen : styles.badgeDark,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.id === 'SHARED'
                      ? styles.badgeTextGreen
                      : styles.badgeTextDark,
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.optionDescription} numberOfLines={1}>
            {item.description}
          </Text>

          {/* Meta Details: ETA & Capacity */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⏱️ {item.etaMinutes} mins away</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>👤 {item.capacity} seats</Text>
          </View>
        </View>

        {/* Right Side: Price */}
        <View style={styles.priceContainer}>
          <Text style={[styles.priceText, isSelected && styles.priceTextSelected]}>
            {currency}
            {finalPrice}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.headerTitle}>Select Ride Type</Text>
      <FlatList
        data={DEFAULT_OPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderOptionItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

// ==========================================
// 4. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  listContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleIcon: {
    fontSize: 22,
  },
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  metaDot: {
    fontSize: 11,
    color: '#94A3B8',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDark: {
    backgroundColor: '#0F172A',
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextDark: {
    color: '#FFFFFF',
  },
  badgeTextGreen: {
    color: '#15803D',
  },
  priceContainer: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  priceTextSelected: {
    color: '#0F172A',
    fontSize: 17,
  },
});

export default MobilitySelector;