const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authroutes");
const cors = require("cors");
require("dotenv").config();
const travelPreferenceRoutes = require("./routes/travelpreferencesRoutes");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const genAI = new GoogleGenerativeAI("AIzaSyCM_kkJJghMVko8xhVjuYs8sbd_njOLNWw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const axios = require('axios');


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/travel-preferences", travelPreferenceRoutes);
app.get('/api/list-models', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // or the model name you get from the API
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error.message);
        res.status(500).json({ error: "Failed to fetch available models" });
    }
});

/**
 * Enhanced itinerary generation API endpoint with image integration
 * This provides rich, visual travel plans with detailed descriptions
 */
app.post("/api/generate-itinerary", async (req, res) => {
    try {
        const { destination, preferences } = req.body;

        if (!destination) {
            return res.status(400).json({ error: "Missing destination" });
        }

        // Set default preferences if not provided
        const finalPreferences = {
            days: 3,
            budget: "mid-range",
            interests: "general sightseeing",
            pace: "moderate",
            activitiesPerDay: 3, // Default number of activities per day
            ...preferences
        };

        // Optimized AI Prompt for Itinerary Generation
        const prompt = `
        Create a optimized ${finalPreferences.days}-day travel itinerary for ${destination}, ensuring that each day includes activities with all the main ** tourist activities ** things covered.

        #### **PREFERENCES:**
        - Budget: ${finalPreferences.budget}
        - Interests: ${finalPreferences.interests}
        - Pace: ${finalPreferences.pace}
        - Activities per day: ${finalPreferences.activitiesPerDay} to ${finalPreferences.activitiesPerDay + 2} depends(Varies based on feasibility)

        #### **ITINERARY OPTIMIZATION:**
        - Arrange activities **logically based on best visiting hours** (e.g., morning attractions, lunch at a nearby restaurant, then an evening activity within the same zone).
        - Suggest **local transport options** (walk, taxi, metro, bus) for efficient travel.

        #### **LOCATION VERIFICATION REQUIREMENT:**
        - All locations must be real, existing places that can be verified on Google Maps
        - Provide accurate, specific location names that will yield successful search results when entered into Google Maps
        - For each activity, include the full official name of the location

        #### **FOR EACH DAY, INCLUDE:**
        - A short, descriptive day title (e.g., "Historical Marvels in Downtown")
        - A day description (80-100 words) explaining the day's theme and optimized routing.
        - ${finalPreferences.activitiesPerDay}-${finalPreferences.activitiesPerDay + 2} activities covering morning, afternoon, and evening.

        #### **FOR EACH ACTIVITY, INCLUDE:**
        - A catchy, descriptive title (15 words max)
        - A compelling description (50-70 words) highlighting what makes it special
        - Exact location name that will match Google Maps search results
        - Estimated cost category ($, $$, $$$)
        - Best time to visit
        - Activity category (attraction, food, transport, accommodation, entertainment)
        - **Optimal travel mode & estimated travel time** from the previous activity
        - A detailed image description for visual representation

        #### **IMPORTANT REQUIREMENTS:**
        - Provide a COMPLETE itinerary for ALL ${finalPreferences.days} days
        - Do not use placeholders, comments or "continue this pattern" notes
        - Each day must have exactly ${finalPreferences.activitiesPerDay} fully detailed activities
        - All locations must be verifiable through Google Maps
        - Provide the entire response in valid JSON format without any interruptions or comments

        #### **JSON OUTPUT FORMAT:**
        {
        "itinerary": [
            {
            "day": 1,
            "title": "string",
            "description": "string",
            "activities": [
                {
                "title": "string",
                "description": "string",
                "location": "string",
                "cost": "string",
                "time": "string",
                "category": "string",
                "travelMode": "string",
                "travelTimeFromPrevious": "string",
                "imageQuery": "detailed description for image generation"
                }
            ]
            }
        ]
        }
        `;

        // Call AI model to generate the itinerary
        const result = await model.generateContent(prompt);
        let itineraryData;

        try {
            // Extract and parse the JSON response
            const responseText = await result.response.text();

            // Look for code blocks that might contain JSON
            let jsonContent;
            const jsonRegex = /```(?:json)?\s*({[\s\S]*?})\s*```/;
            const jsonMatch = responseText.match(jsonRegex);

            if (jsonMatch && jsonMatch[1]) {
                // Found JSON inside code blocks
                jsonContent = jsonMatch[1];
            } else {
                // Try to extract JSON directly
                const jsonStart = responseText.indexOf("{");
                const jsonEnd = responseText.lastIndexOf("}");

                if (jsonStart === -1 || jsonEnd === -1) {
                    throw new Error("AI response does not contain valid JSON");
                }

                jsonContent = responseText.substring(jsonStart, jsonEnd + 1);
            }

            // Remove any comments from the JSON content before parsing
            jsonContent = jsonContent.replace(/\/\/.*$/gm, "");

            try {
                itineraryData = JSON.parse(jsonContent);
            } catch (parseError) {
                console.error("Error parsing AI response:", parseError, "Response received:", responseText);
                return res.status(500).json({ error: "Failed to parse itinerary data" });
            }
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return res.status(500).json({ error: "Failed to parse itinerary data" });
        }

        // Process the itinerary to add images and place info for each activity
        const enhancedItinerary = await Promise.all(
            itineraryData.itinerary.map(async (day) => {
                const activitiesWithPlaceInfo = await Promise.all(
                    day.activities.map(async (activity, index) => {
                        try {
                            // Create a meaningful search query
                            const searchQuery = activity.location ||
                                               activity.title ||
                                               `${activity.category || ''} in ${destination}`.trim();

                            // Ensure we have a clean destination string
                            const cleanDestination = destination.trim();

                            // Get place info and image from Google Places API
                            const { imageUrl, placeInfo } = await getPlaceInfoForActivity(searchQuery, cleanDestination);

                            // If it's the first activity of the day, travel time is 0
                            const travelTime = index === 0 ? "Start of the day" : activity.travelTimeFromPrevious;

                            // Enhance the activity with place data from Google
                            return {
                                ...activity,
                                travelTimeFromPrevious: travelTime,
                                imageUrl,
                                // Add Google Places specific details if available
                                ...(placeInfo && {
                                    googlePlaceId: placeInfo.placeId,
                                    coordinates: placeInfo.coordinates,
                                    rating: placeInfo.rating,
                                    userRatingsTotal: placeInfo.userRatingsTotal,
                                    formattedAddress: placeInfo.address,
                                    placeTypes: placeInfo.types
                                })
                            };
                        } catch (placeError) {
                            console.warn(`Couldn't get place info for ${activity.title}:`, placeError);
                            // Provide a meaningful fallback
                            const activityName = activity.title ? activity.title.substring(0, 30) : "Activity";
                            const fallbackImageUrl = `/api/placeholder/400/300?text=${encodeURIComponent(activityName)}`;
                            return {
                                ...activity,
                                travelTimeFromPrevious: index === 0 ? "Start of the day" : activity.travelTimeFromPrevious,
                                imageUrl: fallbackImageUrl
                            };
                        }
                    })
                );

                return {
                    ...day,
                    title: day.title || `Day ${day.day} in ${destination}`,
                    description: day.description || `Explore ${destination} on day ${day.day} of your journey.`,
                    activities: activitiesWithPlaceInfo
                };
            })
        );

        res.json({ itinerary: enhancedItinerary });
    } catch (error) {
        console.error("Error generating itinerary:", error);
        res.status(500).json({ error: "Failed to generate itinerary" });
    }
});


async function getPlaceInfoForActivity(activityQuery, destination) {
    try {
        const GOOGLE_API_KEY = "AIzaSyBBBRyJOLB08fUPndqiNdC_nkhJrkKi58Y"; // Your Google API key

        // Clean and format the search query
        const cleanDestination = destination.trim();
        const cleanActivityQuery = (activityQuery || "").trim();

        if (!cleanActivityQuery && !cleanDestination) {
            // If both are empty, return a placeholder
            return {
                imageUrl: `/api/placeholder/400/300?text=${encodeURIComponent("Travel Activity")}`,
                placeInfo: null
            };
        }

        // Add a cache to prevent duplicate API queries
        if (!global.placesCache) {
            global.placesCache = new Map();
        }

        // Create several search query variations to try
        const searchQueries = [
            // Try specific activity with destination
            `${cleanActivityQuery} ${cleanDestination}`.trim(),
            // Try with just the activity query
            cleanActivityQuery,
            // Try destination with category extracted from query
            `${cleanDestination} ${cleanActivityQuery.includes('temple') ? 'temple' :
                                  cleanActivityQuery.includes('palace') ? 'palace' :
                                  cleanActivityQuery.includes('market') ? 'market' :
                                  cleanActivityQuery.includes('beach') ? 'beach' :
                                  cleanActivityQuery.includes('restaurant') ? 'restaurant' :
                                  cleanActivityQuery.includes('park') ? 'park' : 'attraction'}`.trim()
        ].filter(q => q.length > 3); // Filter out any too-short queries

        // Generate a cache key based on all search variations
        const cacheKey = searchQueries.join('|');

        // Check if we've already searched for this
        if (global.placesCache.has(cacheKey)) {
            console.log(`Using cached place data for "${cacheKey}"`);
            return global.placesCache.get(cacheKey);
        }

        // Try each search query until we find results
        for (const query of searchQueries) {
            console.log(`Searching Google Places for: "${query}"`);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`
            );

            if (!response.ok) continue;

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} places for "${query}"`);

                // Get the first (most relevant) result
                const place = data.results[0];

                // Extract useful information
                const placeInfo = {
                    name: place.name,
                    address: place.formatted_address,
                    rating: place.rating,
                    userRatingsTotal: place.user_ratings_total,
                    coordinates: `${place.geometry.location.lat},${place.geometry.location.lng}`,
                    placeId: place.place_id,
                    types: place.types
                };

                // Get a photo if available
                let imageUrl = `/api/placeholder/400/300?text=${encodeURIComponent(place.name)}`;

                if (place.photos && place.photos.length > 0) {
                    const photoReference = place.photos[0].photo_reference;
                    imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
                }

                const result = {
                    imageUrl,
                    placeInfo
                };

                // Cache the result
                global.placesCache.set(cacheKey, result);

                return result;
            }
        }

        // Ultimate fallback: use a descriptive placeholder
        console.log(`No places found for "${cleanActivityQuery}". Using placeholder.`);
        const placeholderText = cleanActivityQuery || cleanDestination || "Travel Activity";
        const result = {
            imageUrl: `/api/placeholder/400/300?text=${encodeURIComponent(placeholderText)}`,
            placeInfo: null
        };

        // Cache even the placeholder to be consistent
        global.placesCache.set(cacheKey, result);

        return result;
    } catch (error) {
        console.error("Error fetching data from Google Places API:", error);
        return {
            imageUrl: `/api/placeholder/400/300?text=${encodeURIComponent("Travel Activity")}`,
            placeInfo: null
        };
    }
}


  app.post('/api/routes', async (req, res) => {
    try {
      console.log('Routes API request body:', req.body);
      const { origin, destination, travelMode = 'TRANSIT' } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({
          error: 'Missing required parameters: origin and destination'
        });
      }

      const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

      if (!API_KEY) {
        console.error('Google Maps API key is missing');
        return res.status(500).json({
          error: 'Server configuration error - API key missing'
        });
      }

      console.log(`Fetching routes from ${origin} to ${destination} using ${travelMode} mode`);

      const response = await axios({
        method: 'post',
        url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs.steps.transitDetails'
        },
        data: {
          origin: {
            address: origin
          },
          destination: {
            address: destination
          },
          travelMode: travelMode,
          computeAlternativeRoutes: true,
          transitPreferences: {
            routingPreference: "LESS_WALKING"
          }
        }
      });

      // Format the response
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const durationInSeconds = route.duration ? parseInt(route.duration.match(/\d+/)[0]) : 0;
        const distanceInMeters = route.distanceMeters || 0;

        // Format duration nicely
        let formattedDuration = 'Unknown';
        if (durationInSeconds) {
          const hours = Math.floor(durationInSeconds / 3600);
          const minutes = Math.floor((durationInSeconds % 3600) / 60);
          formattedDuration = hours > 0
            ? `${hours} hr ${minutes} min`
            : `${minutes} min`;
        }

        // Format distance nicely
        let formattedDistance = 'Unknown';
        if (distanceInMeters) {
          formattedDistance = distanceInMeters >= 1000
            ? `${(distanceInMeters / 1000).toFixed(1)} km`
            : `${distanceInMeters} m`;
        }

        res.json({
          status: 'OK',
          duration: formattedDuration,
          distance: formattedDistance,
          fullRouteData: response.data
        });
      } else {
        res.status(404).json({ error: 'No route found' });
      }
    } catch (error) {
      console.error('Routes API error details:', error.message);
      // Log more details if available
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
      }
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  app.get('/api/directions', async (req, res) => {
    try {
        console.log('Request query parameters:', req.query);
      const { origin, destination } = req.query;

      if (!origin || !destination) {
        return res.status(400).json({
          error: 'Missing required parameters: origin and destination'
        });
      }

      const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

      if (!API_KEY) {
        console.error('Google Maps API key is missing');
        return res.status(500).json({
          error: 'Server configuration error - API key missing'
        });
      }

      console.log(`Fetching directions from ${origin} to ${destination}`);

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin,
            destination,
            key: API_KEY
          }
        }
      );

      console.log('Google API Status:', response.data.status);

      // Check if Google's API returned an error
      if (response.data.status !== 'OK') {
        console.error('Google Maps API error:', response.data.status, response.data.error_message);
        return res.status(400).json({
          error: `Google Maps API error: ${response.data.status}`,
          message: response.data.error_message
        });
      }

      // Format response before sending back to client
      const leg = response.data.routes[0]?.legs[0];
      if (leg) {
        res.json({
          status: 'OK',
          duration: leg.duration.text,
          distance: leg.distance.text
        });
      } else {
        res.status(404).json({ error: 'No route found' });
      }
    } catch (error) {
      console.error('Proxy error details:', error.message);
      // Log more details if available
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
      }
      res.status(500).json({ error: 'Failed to fetch directions' });
    }
  });

// Add this to your Express server
app.get('/api/geocode', async (req, res) => {
    try {
      const { address } = req.query;

      if (!address) {
        return res.status(400).json({
          error: 'Missing required parameter: address'
        });
      }

      const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

      if (!API_KEY) {
        console.error('Google Maps API key is missing');
        return res.status(500).json({
          error: 'Server configuration error - API key missing'
        });
      }

      // Make request to Google Maps Geocoding API
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address,
            key: API_KEY
          }
        }
      );

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        console.error('Geocoding API error:', response.data.status);
        return res.status(400).json({
          error: `Geocoding API error: ${response.data.status}`,
          message: response.data.error_message || 'No results found'
        });
      }

      // Extract location data
      const location = response.data.results[0].geometry.location;

      res.json({
        status: 'OK',
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      });
    } catch (error) {
      console.error('Geocoding error:', error.message);
      res.status(500).json({ error: 'Failed to geocode address' });
    }
  });


// Start Server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
