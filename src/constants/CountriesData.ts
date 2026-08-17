// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface CityData {
  id: string;
  name: string;
}

export interface StateData {
  id: string;
  name: string;
  code?: string;
  cities: CityData[];
}

export interface CountryData {
  id: string;
  name: string;
  isoCode: string; // ISO 3166-1 alpha-2 (e.g., 'US', 'NG', 'GB')
  dialCode: string; // e.g., '+1', '+234', '+44'
  flagEmoji: string; // e.g., '🇺🇸', '🇳🇬', '🇬🇧'
  currencySymbol: string; // e.g., '$', '₦', '£'
  currencyCode: string; // e.g., 'USD', 'NGN', 'GBP'
  states: StateData[];
}

// ==========================================
// 2. DATASET DEFINITION
// ==========================================

export const COUNTRIES_DATA: CountryData[] = [
  {
    id: 'NG',
    name: 'Nigeria',
    isoCode: 'NG',
    dialCode: '+234',
    flagEmoji: '🇳🇬',
    currencySymbol: '₦',
    currencyCode: 'NGN',
    states: [
      {
        id: 'NG-LA',
        name: 'Lagos',
        code: 'LA',
        cities: [
          { id: 'NG-LA-1', name: 'Ikeja' },
          { id: 'NG-LA-2', name: 'Lagos Island' },
          { id: 'NG-LA-3', name: 'VGC / Lekki' },
          { id: 'NG-LA-4', name: 'Victoria Island' },
          { id: 'NG-LA-5', name: 'Yaba' },
          { id: 'NG-LA-6', name: 'Surulere' },
        ],
      },
      {
        id: 'NG-FC',
        name: 'Federal Capital Territory',
        code: 'FC',
        cities: [
          { id: 'NG-FC-1', name: 'Abuja Central' },
          { id: 'NG-FC-2', name: 'Gwarinpa' },
          { id: 'NG-FC-3', name: 'Maitama' },
          { id: 'NG-FC-4', name: 'Wuse 2' },
        ],
      },
      {
        id: 'NG-RI',
        name: 'Rivers',
        code: 'RI',
        cities: [
          { id: 'NG-RI-1', name: 'Port Harcourt' },
          { id: 'NG-RI-2', name: 'Obio-Akpor' },
        ],
      },
    ],
  },
  {
    id: 'US',
    name: 'United States',
    isoCode: 'US',
    dialCode: '+1',
    flagEmoji: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    states: [
      {
        id: 'US-CA',
        name: 'California',
        code: 'CA',
        cities: [
          { id: 'US-CA-1', name: 'Los Angeles' },
          { id: 'US-CA-2', name: 'San Francisco' },
          { id: 'US-CA-3', name: 'San Diego' },
          { id: 'US-CA-4', name: 'San Jose' },
        ],
      },
      {
        id: 'US-NY',
        name: 'New York',
        code: 'NY',
        cities: [
          { id: 'US-NY-1', name: 'New York City' },
          { id: 'US-NY-2', name: 'Buffalo' },
          { id: 'US-NY-3', name: 'Rochester' },
        ],
      },
      {
        id: 'US-TX',
        name: 'Texas',
        code: 'TX',
        cities: [
          { id: 'US-TX-1', name: 'Austin' },
          { id: 'US-TX-2', name: 'Houston' },
          { id: 'US-TX-3', name: 'Dallas' },
        ],
      },
    ],
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    isoCode: 'GB',
    dialCode: '+44',
    flagEmoji: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    states: [
      {
        id: 'GB-ENG',
        name: 'England',
        code: 'ENG',
        cities: [
          { id: 'GB-ENG-1', name: 'London' },
          { id: 'GB-ENG-2', name: 'Manchester' },
          { id: 'GB-ENG-3', name: 'Birmingham' },
        ],
      },
      {
        id: 'GB-SCT',
        name: 'Scotland',
        code: 'SCT',
        cities: [
          { id: 'GB-SCT-1', name: 'Edinburgh' },
          { id: 'GB-SCT-2', name: 'Glasgow' },
        ],
      },
    ],
  },
  {
    id: 'CA',
    name: 'Canada',
    isoCode: 'CA',
    dialCode: '+1',
    flagEmoji: '🇨🇦',
    currencySymbol: 'CA$',
    currencyCode: 'CAD',
    states: [
      {
        id: 'CA-ON',
        name: 'Ontario',
        code: 'ON',
        cities: [
          { id: 'CA-ON-1', name: 'Toronto' },
          { id: 'CA-ON-2', name: 'Ottawa' },
        ],
      },
      {
        id: 'CA-BC',
        name: 'British Columbia',
        code: 'BC',
        cities: [
          { id: 'CA-BC-1', name: 'Vancouver' },
          { id: 'CA-BC-2', name: 'Victoria' },
        ],
      },
    ],
  },
  {
    id: 'GH',
    name: 'Ghana',
    isoCode: 'GH',
    dialCode: '+233',
    flagEmoji: '🇬🇭',
    currencySymbol: 'GH₵',
    currencyCode: 'GHS',
    states: [
      {
        id: 'GH-AA',
        name: 'Greater Accra',
        code: 'AA',
        cities: [
          { id: 'GH-AA-1', name: 'Accra' },
          { id: 'GH-AA-2', name: 'Tema' },
        ],
      },
      {
        id: 'GH-AH',
        name: 'Ashanti',
        code: 'AH',
        cities: [{ id: 'GH-AH-1', name: 'Kumasi' }],
      },
    ],
  },
];

// ==========================================
// 3. HELPER UTILITY FUNCTIONS
// ==========================================

/**
 * Retrieve all available countries
 */
export const getAllCountries = (): CountryData[] => {
  return COUNTRIES_DATA;
};

/**
 * Find a country by its ISO code (e.g., 'US', 'NG')
 */
export const getCountryByIso = (isoCode: string): CountryData | undefined => {
  return COUNTRIES_DATA.find(
    (c) => c.isoCode.toUpperCase() === isoCode.toUpperCase()
  );
};

/**
 * Get states for a given country ISO code
 */
export const getStatesForCountry = (countryIsoCode: string): StateData[] => {
  const country = getCountryByIso(countryIsoCode);
  return country ? country.states : [];
};

/**
 * Get cities for a given state ID within a country ISO code
 */
export const getCitiesForState = (
  countryIsoCode: string,
  stateId: string
): CityData[] => {
  const states = getStatesForCountry(countryIsoCode);
  const state = states.find((s) => s.id === stateId || s.code === stateId);
  return state ? state.cities : [];
};

/**
 * Default fallback country (Nigeria)
 */
export const DEFAULT_COUNTRY: CountryData = COUNTRIES_DATA[0];

export default COUNTRIES_DATA;