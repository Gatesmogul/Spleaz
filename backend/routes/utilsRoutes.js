const express = require('express');
const router = express.Router();

/**
 * Static Multilingual Interface Strings Dictionary
 * Supports English ('en'), French ('fr'), and Yoruba ('yo')
 */
const LANGUAGE_STRINGS = {
  en: {
    welcome: 'Welcome to Spleaz',
    request_ride: 'Request a Ride',
    searching_driver: 'Searching for nearby drivers...',
    driver_arrived: 'Your driver has arrived!',
    trip_started: 'Trip in progress',
    trip_completed: 'Trip completed safely',
    payment_successful: 'Payment confirmed',
    cancel_ride: 'Cancel Ride',
  },
  fr: {
    welcome: 'Bienvenue sur Spleaz',
    request_ride: 'Commander un trajet',
    searching_driver: 'Recherche de chauffeurs à proximité...',
    driver_arrived: 'Votre chauffeur est arrivé !',
    trip_started: 'Course en cours',
    trip_completed: 'Course terminée en toute sécurité',
    payment_successful: 'Paiement confirmé',
    cancel_ride: 'Annuler la course',
  },
  yo: {
    welcome: 'E kaabo si Spleaz',
    request_ride: 'Wọ ọkọ ti o fẹ',
    searching_driver: 'A n wa awon direba ti o wa nitosi...',
    driver_arrived: 'Direba rẹ ti de!',
    trip_started: 'A ti bẹrẹ irin-ajo',
    trip_completed: 'Irin-ajo ti pari laalafia',
    payment_successful: 'A ti gba isanwo rẹ',
    cancel_ride: 'Fagilee irin-ajo',
  },
};

/**
 * Geographic Reference Data (Countries, States, and Cities)
 */
const GEO_DATA = {
  Nigeria: {
    Lagos: ['Ikeja', 'Lagos Island', 'Lekki', 'Victoria Island', 'Yaba', 'Surulere'],
    Abuja: ['Central Business District', 'Gwarinpa', 'Maitama', 'Wuse', 'Asokoro'],
    Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Oyigbo'],
    Oyo: ['Ibadan Central', 'Ibadan North', 'Ogbomoso', 'Oyo Town'],
  },
  Ghana: {
    'Greater Accra': ['Accra Central', 'Tema', 'East Legon', 'Madina'],
    Ashanti: ['Kumasi', 'Obuasi', 'Ejisu'],
  },
  Kenya: {
    Nairobi: ['Nairobi Central', 'Westlands', 'Kilimani', 'Karen'],
    Mombasa: ['Mombasa Island', 'Nyali', 'Likoni'],
  },
};

/**
 * @route   GET /api/v1/utils/health
 * @desc    Backend health check & uptime verification
 * @access  Public
 */
router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'online',
    app: 'Spleaz Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/v1/utils/languages
 * @desc    Get localization interface strings by language code
 * @access  Public
 */
router.get('/languages', (req, res) => {
  const lang = (req.query.lang || 'en').toLowerCase();
  const strings = LANGUAGE_STRINGS[lang] || LANGUAGE_STRINGS['en'];

  return res.status(200).json({
    success: true,
    language: LANGUAGE_STRINGS[lang] ? lang : 'en (fallback)',
    data: strings,
  });
});

/**
 * @route   GET /api/v1/utils/geo-data
 * @desc    Fetch supported geographic hierarchy (Countries, States, Cities)
 * @access  Public
 */
router.get('/geo-data', (req, res) => {
  const { country, state } = req.query;

  // Filter by country if provided
  if (country) {
    const countryData = GEO_DATA[country];
    if (!countryData) {
      return res.status(404).json({
        success: false,
        message: `Country '${country}' is not supported yet.`,
      });
    }

    // Filter by state if both country and state are provided
    if (state) {
      const cities = countryData[state];
      if (!cities) {
        return res.status(404).json({
          success: false,
          message: `State '${state}' not found in ${country}.`,
        });
      }
      return res.status(200).json({
        success: true,
        country,
        state,
        cities,
      });
    }

    return res.status(200).json({
      success: true,
      country,
      states: Object.keys(countryData),
      data: countryData,
    });
  }

  // Return full geographic dataset
  return res.status(200).json({
    success: true,
    countries: Object.keys(GEO_DATA),
    data: GEO_DATA,
  });
});

module.exports = router;