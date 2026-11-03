// Assumption: Location service provides fast in-memory Vedic city lookup with exact coordinates and GMT offset.
const PREDEFINED_LOCATIONS = [
  {
    placeId: 'loc_01',
    mainText: 'Mumbai',
    secondaryText: 'Maharashtra, India',
    formattedAddress: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_02',
    mainText: 'Pune',
    secondaryText: 'Maharashtra, India',
    formattedAddress: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_03',
    mainText: 'New Delhi',
    secondaryText: 'Delhi, India',
    formattedAddress: 'New Delhi, Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_04',
    mainText: 'Bengaluru',
    secondaryText: 'Karnataka, India',
    formattedAddress: 'Bengaluru, Karnataka, India',
    latitude: 12.9716,
    longitude: 77.5946,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_05',
    mainText: 'Ahmedabad',
    secondaryText: 'Gujarat, India',
    formattedAddress: 'Ahmedabad, Gujarat, India',
    latitude: 23.0225,
    longitude: 72.5714,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_06',
    mainText: 'Kolkata',
    secondaryText: 'West Bengal, India',
    formattedAddress: 'Kolkata, West Bengal, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_07',
    mainText: 'Chennai',
    secondaryText: 'Tamil Nadu, India',
    formattedAddress: 'Chennai, Tamil Nadu, India',
    latitude: 13.0827,
    longitude: 80.2707,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_08',
    mainText: 'Hyderabad',
    secondaryText: 'Telangana, India',
    formattedAddress: 'Hyderabad, Telangana, India',
    latitude: 17.3850,
    longitude: 78.4867,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_09',
    mainText: 'Jaipur',
    secondaryText: 'Rajasthan, India',
    formattedAddress: 'Jaipur, Rajasthan, India',
    latitude: 26.9124,
    longitude: 75.7873,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
  {
    placeId: 'loc_10',
    mainText: 'Varanasi',
    secondaryText: 'Uttar Pradesh, India',
    formattedAddress: 'Varanasi, Uttar Pradesh, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timeZone: 'Asia/Kolkata',
    gmtOffset: '+05:30',
  },
];

class LocationService {
  search(query = '') {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return { predictions: PREDEFINED_LOCATIONS.slice(0, 5) };
    }

    const matched = PREDEFINED_LOCATIONS.filter(
      (loc) =>
        loc.mainText.toLowerCase().includes(q) ||
        loc.secondaryText.toLowerCase().includes(q) ||
        loc.formattedAddress.toLowerCase().includes(q)
    );

    if (matched.length > 0) {
      return { predictions: matched };
    }

    // Dynamic fallback for any query
    const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
    return {
      predictions: [
        {
          placeId: `loc_${Date.now()}`,
          mainText: capitalized,
          secondaryText: 'India',
          formattedAddress: `${capitalized}, India`,
          latitude: 19.0760,
          longitude: 72.8777,
          timeZone: 'Asia/Kolkata',
          gmtOffset: '+05:30',
        },
      ],
    };
  }
}

module.exports = new LocationService();

