/**
 * Dynamic Pricing Service for Spleaz
 * Calculates real-time upfront ride estimates based on distance, duration, demand surge, and local conditions.
 */

// Core rate parameters (Configurable per city/region)
const PRICING_CONFIG = {
  BASE_FARE: 500,           // Flat starting fare (e.g. ₦500 / $0.50)
  PER_KM_RATE: 150,         // Charge per kilometer
  PER_MINUTE_RATE: 25,      // Charge per estimated travel minute
  MINIMUM_FARE: 700,        // Absolute minimum cost for a trip
  COMMISSION_PERCENT: 15,   // Platform commission fee (15%)
  CURRENCY_ROUNDING: 50,    // Round up to nearest 50 currency units for clean cash handling
};

/**
 * Calculates straight-line distance between two GPS coordinates using the Haversine formula
 * 
 * @param {number} lat1 - Pickup latitude
 * @param {number} lon1 - Pickup longitude
 * @param {number} lat2 - Dropoff latitude
 * @param {number} lon2 - Dropoff longitude
 * @returns {number} Distance in kilometers
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const TO_RAD = Math.PI / 180;
  const EARTH_RADIUS_KM = 6371;

  const dLat = (lat2 - lat1) * TO_RAD;
  const dLon = (lon2 - lon1) * TO_RAD;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * TO_RAD) *
      Math.cos(lat2 * TO_RAD) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = EARTH_RADIUS_KM * c;

  // Apply a 1.25 multiplier to estimate actual road driving distance from straight-line coordinates
  return Number((straightDistance * 1.25).toFixed(2));
};

/**
 * Estimates travel duration based on distance and average urban traffic speed
 * 
 * @param {number} distanceInKm - Distance in kilometers
 * @param {number} averageSpeedKmh - Speed in km/h (default 30 km/h urban speed)
 * @returns {number} Duration in minutes
 */
const estimateDurationMinutes = (distanceInKm, averageSpeedKmh = 30) => {
  const hours = distanceInKm / averageSpeedKmh;
  const minutes = Math.ceil(hours * 60);
  return Math.max(minutes, 5); // Minimum estimated duration of 5 minutes
};

/**
 * Calculates demand surge multiplier based on active requests vs available nearby drivers
 * 
 * @param {number} activeRequests - Active pending ride requests in zone
 * @param {number} availableDrivers - Online drivers available in zone
 * @returns {number} Surge multiplier (1.0x to 2.5x)
 */
const calculateSurgeMultiplier = (activeRequests = 1, availableDrivers = 1) => {
  if (availableDrivers <= 0) return 2.0; // High surge if no drivers available

  const ratio = activeRequests / availableDrivers;

  if (ratio > 3.0) return 2.5;
  if (ratio > 2.0) return 2.0;
  if (ratio > 1.5) return 1.5;
  if (ratio > 1.2) return 1.2;

  return 1.0; // Standard 1.0x multiplier
};

/**
 * Main dynamic pricing calculator function
 * 
 * @param {Object} params
 * @param {Array<number>} params.pickupCoordinates - [longitude, latitude]
 * @param {Array<number>} params.dropoffCoordinates - [longitude, latitude]
 * @param {number} [params.activeRequests=1] - Active ride requests in vicinity
 * @param {number} [params.availableDrivers=1] - Available drivers in vicinity
 * @param {number} [params.weatherMultiplier=1.0] - Rain or extreme weather factor (e.g. 1.2)
 * @returns {Object} Comprehensive fare calculation breakdown
 */
const calculateUpfrontFare = ({
  pickupCoordinates,
  dropoffCoordinates,
  activeRequests = 1,
  availableDrivers = 1,
  weatherMultiplier = 1.0,
}) => {
  if (
    !pickupCoordinates ||
    !dropoffCoordinates ||
    pickupCoordinates.length !== 2 ||
    dropoffCoordinates.length !== 2
  ) {
    throw new Error('Invalid coordinates supplied for fare calculation.');
  }

  const [pickupLng, pickupLat] = pickupCoordinates;
  const [dropoffLng, dropoffLat] = dropoffCoordinates;

  // 1. Calculate road distance and travel time
  const distanceKm = calculateHaversineDistance(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng
  );
  const durationMins = estimateDurationMinutes(distanceKm);

  // 2. Determine surge and environmental multipliers
  const surgeMultiplier = calculateSurgeMultiplier(
    activeRequests,
    availableDrivers
  );
  const totalMultiplier = Number((surgeMultiplier * weatherMultiplier).toFixed(2));

  // 3. Calculate raw subtotal fare
  const distanceCost = distanceKm * PRICING_CONFIG.PER_KM_RATE;
  const timeCost = durationMins * PRICING_CONFIG.PER_MINUTE_RATE;
  const rawSubtotal = PRICING_CONFIG.BASE_FARE + distanceCost + timeCost;

  // 4. Apply multipliers
  let totalFare = rawSubtotal * totalMultiplier;

  // 5. Enforce minimum fare policy
  totalFare = Math.max(totalFare, PRICING_CONFIG.MINIMUM_FARE);

  // 6. Round up to nearest currency threshold (e.g., ₦50) for clean payments
  const roundedFare =
    Math.ceil(totalFare / PRICING_CONFIG.CURRENCY_ROUNDING) *
    PRICING_CONFIG.CURRENCY_ROUNDING;

  // 7. Calculate platform commission split
  const commissionAmount = Math.round(
    (roundedFare * PRICING_CONFIG.COMMISSION_PERCENT) / 100
  );
  const driverEarnings = roundedFare - commissionAmount;

  return {
    fare: roundedFare,
    distanceText: `${distanceKm} km`,
    durationText: `${durationMins} mins`,
    distanceKm,
    durationMins,
    surgeMultiplier,
    commissionAmount,
    driverEarnings,
    pricingBreakdown: {
      baseFare: PRICING_CONFIG.BASE_FARE,
      distanceCost: Math.round(distanceCost),
      timeCost: Math.round(timeCost),
      surgeMultiplier,
      weatherMultiplier,
    },
  };
};

module.exports = {
  calculateHaversineDistance,
  estimateDurationMinutes,
  calculateSurgeMultiplier,
  calculateUpfrontFare,
  PRICING_CONFIG,
};