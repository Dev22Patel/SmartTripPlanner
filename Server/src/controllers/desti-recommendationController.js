const axios = require('axios');

const getRecommendations = async (req, res) => {
  const { destination } = req.query;
    console.log("Destination:", destination);
  console.log("Query Params:", req.query);
  if (!destination) {
    return res.status(400).json({ error: 'Destination parameter is required' });
  }

  try {
    const googleMapsApiKey = "AIzaSyBBBRyJOLB08fUPndqiNdC_nkhJrkKi58Y" || process.env.GOOGLE_MAPS_API_KEY;
    let recommendations;

    if (googleMapsApiKey) {
      recommendations = await fetchRecommendationsFromExternalAPIs(destination, googleMapsApiKey);
    } else {
      recommendations = generateMockRecommendations(destination);
    }
    console.log("Recommendations:", recommendations);
    return res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({
      error: 'Failed to fetch recommendations',
      message: error.message
    });
  }
};

const fetchRecommendationsFromExternalAPIs = async (destination, googleMapsApiKey) => {
  const result = {
    attractions: [],
    restaurants: [],
    hotels: [],
    activities: []
  };

  const categories = [
    { key: 'attractions', query: `top attractions in ${destination}` },
    { key: 'restaurants', query: `best restaurants in ${destination}` },
    { key: 'hotels', query: `hotels in ${destination}` },
    { key: 'activities', query: `activities tours in ${destination}` }
  ];

  for (const { key, query } of categories) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json`,
        { params: { query, key: googleMapsApiKey } }
      );

      result[key] = response.data.results.slice(0, 5).map(place =>
        formatGooglePlace(place, key.slice(0, -1), googleMapsApiKey)
      );
    } catch (error) {
      console.error(`Error fetching ${key}:`, error.message);
    }
  }

  return result;
};

const formatGooglePlace = (place, type, apiKey) => {
  const priceSymbols = place.price_level ? '€'.repeat(place.price_level) : '€€';

  const tags = place.types
    ? place.types
        .filter(t => !['point_of_interest', 'establishment'].includes(t))
        .slice(0, 3)
        .map(t => t.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' '))
    : [];

  const photoUrl = place.photos?.[0]
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
    : `/api/placeholder/400/300?text=${encodeURIComponent(place.name)}`;

  return {
    id: place.place_id,
    name: place.name,
    type,
    rating: place.rating || 4.0,
    image: photoUrl,
    description: place.editorial_summary?.overview || `Popular ${type} in ${place.formatted_address}`,
    location: place.vicinity || place.formatted_address,
    price: place.price_level,
    duration: ['attraction', 'activity'].includes(type) ? '1-2 hours' : undefined,
    tags: tags.length ? tags : [capitalize(type), 'Popular', place.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'],
    url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
  };
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  // Fallback function to generate mock data when API keys aren't available
  const generateMockRecommendations = (destination) => {
    const mockData = {
      attractions: [
        {
          id: 'mock-attr-1',
          name: `${destination} Central Park`,
          type: 'attraction',
          rating: 4.7,
          image: `/api/placeholder/400/300?text=Central Park`,
          description: `The main park of ${destination}, featuring beautiful gardens and walking paths.`,
          location: `Central ${destination}`,
          price: '€',
          duration: '1-2 hours',
          tags: ['Park', 'Nature', 'Walking'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-attr-2',
          name: `${destination} Museum of Art`,
          type: 'attraction',
          rating: 4.5,
          image: `/api/placeholder/400/300?text=Museum of Art`,
          description: `The main art museum in ${destination}, featuring both classical and modern exhibitions.`,
          location: `Downtown ${destination}`,
          price: '€€',
          duration: '1-2 hours',
          tags: ['Museum', 'Art', 'Culture'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-attr-3',
          name: `${destination} Historical Center`,
          type: 'attraction',
          rating: 4.4,
          image: `/api/placeholder/400/300?text=Historical Center`,
          description: `Explore the historic center of ${destination} with buildings dating back centuries.`,
          location: `Old Town, ${destination}`,
          price: '€',
          duration: '1-2 hours',
          tags: ['Historic', 'Architecture', 'Walking'],
          url: 'https://www.google.com/maps',
        }
      ],
      restaurants: [
        {
          id: 'mock-rest-1',
          name: `${destination} Fine Dining`,
          type: 'restaurant',
          rating: 4.6,
          image: `/api/placeholder/400/300?text=Fine Dining`,
          description: `Upscale restaurant serving local cuisine with a modern twist in ${destination}.`,
          location: `Central ${destination}`,
          price: '€€€',
          tags: ['Fine Dining', 'Local Cuisine', 'Upscale'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-rest-2',
          name: `${destination} Pizzeria`,
          type: 'restaurant',
          rating: 4.3,
          image: `/api/placeholder/400/300?text=Pizzeria`,
          description: `Popular pizza place loved by locals and tourists alike in ${destination}.`,
          location: `Downtown ${destination}`,
          price: '€€',
          tags: ['Pizza', 'Italian', 'Casual'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-rest-3',
          name: `${destination} Seafood`,
          type: 'restaurant',
          rating: 4.5,
          image: `/api/placeholder/400/300?text=Seafood`,
          description: `Fresh seafood restaurant serving the catch of the day in ${destination}.`,
          location: `Harbor Area, ${destination}`,
          price: '€€€',
          tags: ['Seafood', 'Fresh', 'Local'],
          url: 'https://www.google.com/maps',
        }
      ],
      hotels: [
        {
          id: 'mock-hotel-1',
          name: `${destination} Grand Hotel`,
          type: 'hotel',
          rating: 4.8,
          image: `/api/placeholder/400/300?text=Grand Hotel`,
          description: `Luxury hotel in the heart of ${destination} with full amenities.`,
          location: `Central ${destination}`,
          price: '€€€€',
          tags: ['Luxury', '5-Star', 'Spa'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-hotel-2',
          name: `${destination} Boutique Inn`,
          type: 'hotel',
          rating: 4.5,
          image: `/api/placeholder/400/300?text=Boutique Inn`,
          description: `Charming boutique hotel with personalized service in ${destination}.`,
          location: `Old Town, ${destination}`,
          price: '€€€',
          tags: ['Boutique', 'Charming', 'Historic'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-hotel-3',
          name: `${destination} Budget Stay`,
          type: 'hotel',
          rating: 4.0,
          image: `/api/placeholder/400/300?text=Budget Stay`,
          description: `Affordable accommodation option in ${destination} with all the essentials.`,
          location: `${destination} Outskirts`,
          price: '€',
          tags: ['Budget', 'Clean', 'Value'],
          url: 'https://www.google.com/maps',
        }
      ],
      activities: [
        {
          id: 'mock-act-1',
          name: `${destination} City Tour`,
          type: 'activity',
          rating: 4.6,
          image: `/api/placeholder/400/300?text=City Tour`,
          description: `Guided city tour of all major attractions in ${destination}.`,
          location: `Various locations in ${destination}`,
          price: '€€',
          duration: '1-2 hours',
          tags: ['Tour', 'Walking', 'Guide'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-act-2',
          name: `${destination} Cooking Class`,
          type: 'activity',
          rating: 4.8,
          image: `/api/placeholder/400/300?text=Cooking Class`,
          description: `Learn to cook local dishes with professional chefs in ${destination}.`,
          location: `Central ${destination}`,
          price: '€€€',
          duration: '1-2 hours',
          tags: ['Cooking', 'Class', 'Culture'],
          url: 'https://www.google.com/maps',
        },
        {
          id: 'mock-act-3',
          name: `${destination} Boat Tour`,
          type: 'activity',
          rating: 4.5,
          image: `/api/placeholder/400/300?text=Boat Tour`,
          description: `Scenic boat tour around the waterways of ${destination}.`,
          location: `${destination} Harbor`,
          price: '€€',
          duration: '1-2 hours',
          tags: ['Boat', 'Water', 'Scenic'],
          url: 'https://www.google.com/maps',
        }
      ]
    };

    return mockData;
  }


  module.exports = { getRecommendations };
