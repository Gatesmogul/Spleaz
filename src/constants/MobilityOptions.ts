// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type MobilityCategory =
  | 'STANDARD'
  | 'COMFORT'
  | 'EXECUTIVE'
  | 'GREEN'
  | 'DELIVERY';

export interface MobilityOption {
  id: MobilityCategory;
  name: string;
  tagline: string;
  description: string;
  capacity: number; // Max passengers or package limit
  iconName: string; // Identifier for vector icons or local assets
  baseFare: number; // Starting fare in base currency
  perKmRate: number; // Cost per kilometer
  perMinuteRate: number; // Cost per minute
  minFare: number; // Minimum fare threshold
  estimatedEtaMinutes: number; // Default base ETA to pickup
  badgeText?: string; // Optional badge e.g. "Popular", "Eco-Friendly", "Fast"
  isAvailable: boolean;
}

export interface FareEstimate {
  optionId: MobilityCategory;
  totalFare: number;
  formattedFare: string;
  distanceKm: number;
  durationMinutes: number;
  currencySymbol: string;
}

// ==========================================
// 2. MOBILITY OPTIONS DATASET
// ==========================================

export const MOBILITY_OPTIONS: MobilityOption[] = [
  {
    id: 'STANDARD',
    name: 'Spleaz Go',
    tagline: 'Affordable everyday rides',
    description: 'Comfortable compact cars for reliable daily commuting.',
    capacity: 4,
    iconName: 'car-side',
    baseFare: 500,
    perKmRate: 150,
    perMinuteRate: 25,
    minFare: 800,
    estimatedEtaMinutes: 3,
    badgeText: 'Popular',
    isAvailable: true,
  },
  {
    id: 'COMFORT',
    name: 'Spleaz Comfort',
    tagline: 'Newer cars with extra legroom',
    description: 'Top-rated drivers with spacious sedans and climate control.',
    capacity: 4,
    iconName: 'car-estate',
    baseFare: 800,
    perKmRate: 220,
    perMinuteRate: 35,
    minFare: 1200,
    estimatedEtaMinutes: 5,
    isAvailable: true,
  },
  {
    id: 'EXECUTIVE',
    name: 'Spleaz Executive',
    tagline: 'Premium luxury vehicles',
    description: 'High-end luxury cars for business trips and special events.',
    capacity: 4,
    iconName: 'car-sports',
    baseFare: 1500,
    perKmRate: 400,
    perMinuteRate: 60,
    minFare: 2500,
    estimatedEtaMinutes: 8,
    badgeText: 'VIP',
    isAvailable: true,
  },
  {
    id: 'GREEN',
    name: 'Spleaz Eco',
    tagline: 'Zero-emission electric rides',
    description: 'Quiet and sustainable rides in hybrid and fully electric cars.',
    capacity: 4,
    iconName: 'leaf',
    baseFare: 600,
    perKmRate: 160,
    perMinuteRate: 28,
    minFare: 900,
    estimatedEtaMinutes: 4,
    badgeText: 'Eco-Friendly',
    isAvailable: true,
  },
  {
    id: 'DELIVERY',
    name: 'Spleaz Express',
    tagline: 'Fast package & parcel delivery',
    description: 'Send parcels and documents across the city with direct tracking.',
    capacity: 1, // 1 package slot
    iconName: 'package-variant',
    baseFare: 400,
    perKmRate: 120,
    perMinuteRate: 20,
    minFare: 600,
    estimatedEtaMinutes: 6,
    isAvailable: true,
  },
];

// ==========================================
// 3. HELPER UTILITY FUNCTIONS
// ==========================================

/**
 * Get option details by ID
 */
export const getMobilityOptionById = (
  id: MobilityCategory
): MobilityOption | undefined => {
  return MOBILITY_OPTIONS.find((option) => option.id === id);
};

/**
 * Calculate fare estimate for a given mobility option
 */
export const calculateFare = (
  option: MobilityOption,
  distanceKm: number,
  durationMinutes: number,
  surgeMultiplier: number = 1.0,
  currencySymbol: string = '₦'
): FareEstimate => {
  const rawCalculated =
    option.baseFare +
    distanceKm * option.perKmRate +
    durationMinutes * option.perMinuteRate;

  const adjustedFare = Math.max(rawCalculated * surgeMultiplier, option.minFare);
  const roundedFare = Math.ceil(adjustedFare / 50) * 50; // Round up to nearest 50

  return {
    optionId: option.id,
    totalFare: roundedFare,
    formattedFare: `${currencySymbol}${roundedFare.toLocaleString()}`,
    distanceKm,
    durationMinutes,
    currencySymbol,
  };
};

/**
 * Get fare estimates for all available mobility options for a route
 */
export const getAllFareEstimates = (
  distanceKm: number,
  durationMinutes: number,
  surgeMultiplier: number = 1.0,
  currencySymbol: string = '₦'
): FareEstimate[] => {
  return MOBILITY_OPTIONS.filter((opt) => opt.isAvailable).map((option) =>
    calculateFare(
      option,
      distanceKm,
      durationMinutes,
      surgeMultiplier,
      currencySymbol
    )
  );
};

export default MOBILITY_OPTIONS;