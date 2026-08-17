const { Client } = require('@googlemaps/google-maps-services-js');

// 1. Initialize the official Google Maps API Client
const googleMapsClient = new Client({});

// Retrieve API key from environment variables
const getApiKey = () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('[Google Maps Config Error]: GOOGLE_MAPS_API_KEY is missing in environment variables.');
  }
  return apiKey;
};

/**
 * Calculates travel distance and estimated duration (ETA) between origins and destinations.
 * @param {Array<string|{lat: number, lng: number}>} origins - Pickup locations or Driver locations
 * @param {Array<string|{lat: number, lng: number}>} destinations - Dropoff locations
 * @returns {Promise<{distanceInMeters: number, durationInSeconds: number, distanceText: string, durationText: string}>}
 */
const haversineDistance = (a, b) => {
  const lat1 = Number(a.lat ?? a.latitude); const lon1 = Number(a.lng ?? a.longitude);
  const lat2 = Number(b.lat ?? b.latitude); const lon2 = Number(b.lng ?? b.longitude);
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2-lat1); const dLon = toRad(lon2-lon1);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
};

const getDistanceAndDuration = async (origins, destinations) => {
  const origin = origins[0]; const destination = destinations[0];
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY.includes('your_google')) throw new Error('Google Maps API key is not configured');
    const response = await googleMapsClient.distancematrix({params:{origins,destinations,key:process.env.GOOGLE_MAPS_API_KEY},timeout:5000});
    const element=response.data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') throw new Error(`Distance Matrix failed: ${element?.status || 'UNKNOWN'}`);
    return {distanceInMeters:element.distance.value,distanceText:element.distance.text,durationInSeconds:element.duration.value,durationText:element.duration.text};
  } catch (error) {
    if (!origin || !destination) throw error;
    const meters=haversineDistance(origin,destination);
    const durationSeconds=(meters/1000/25)*3600;
    return {distanceInMeters:meters,distanceText:`${(meters/1000).toFixed(1)} km`,durationInSeconds,durationText:`${Math.max(1,Math.round(durationSeconds/60))} mins`};
  }
};

/**
 * Converts a string address into latitude and longitude coordinates.
 * @param {string} address - Physical address string (e.g. "Victoria Island, Lagos")
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
 */
const geocodeAddress = async (address) => {
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address,
        key: getApiKey(),
      },
      timeout: 5000,
    });

    const result = response.data.results[0];

    if (!result) {
      throw new Error(`No geocoding results found for address: "${address}"`);
    }

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error('[Google Maps - Geocode Error]:', error.response?.data?.error_message || error.message);
    throw error;
  }
};

/**
 * Converts latitude and longitude coordinates into a human-readable address.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{formattedAddress: string, placeId: string}>}
 */
const reverseGeocodeCoordinates = async (lat, lng) => {
  try {
    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: getApiKey(),
      },
      timeout: 5000,
    });

    const result = response.data.results[0];

    if (!result) {
      throw new Error(`No address found for coordinates: ${lat}, ${lng}`);
    }

    return {
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('[Google Maps - Reverse Geocode Error]:', error.response?.data?.error_message || error.message);
    throw error;
  }
};

/**
 * Gets route polyline and directions step-by-step between pickup and dropoff.
 * @param {{lat: number, lng: number}} origin - Pickup coordinate
 * @param {{lat: number, lng: number}} destination - Dropoff coordinate
 * @returns {Promise<{overviewPolyline: string, distance: object, duration: object}>}
 */
const getDirections = async (origin, destination) => {
  try {
    const response = await googleMapsClient.directions({
      params: {
        origin,
        destination,
        key: getApiKey(),
      },
      timeout: 5000,
    });

    const route = response.data.routes[0];

    if (!route) {
      throw new Error('No route found between specified points.');
    }

    const leg = route.legs[0];

    return {
      overviewPolyline: route.overview_polyline.points,
      distance: leg.distance,
      duration: leg.duration,
    };
  } catch (error) {
    console.error('[Google Maps - Directions Error]:', error.response?.data?.error_message || error.message);
    throw error;
  }
};

module.exports = {
  googleMapsClient,
  getDistanceAndDuration,
  geocodeAddress,
  reverseGeocodeCoordinates,
  getDirections,
};