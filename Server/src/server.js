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
        Create a highly optimized ${finalPreferences.days}-day travel itinerary for ${destination}, ensuring that each day includes activities **close to each other** to minimize travel time.

        #### **PREFERENCES:**
        - Budget: ${finalPreferences.budget}
        - Interests: ${finalPreferences.interests}
        - Pace: ${finalPreferences.pace}
        - Activities per day: ${finalPreferences.activitiesPerDay} (Varies based on feasibility)

        #### **ITINERARY OPTIMIZATION:**
        - Group activities by **proximity** to minimize travel time.
        - Arrange activities **logically based on best visiting hours** (e.g., morning attractions, lunch at a nearby restaurant, then an evening activity within the same zone).
        - Suggest **local transport options** (walk, taxi, metro, bus) for efficient travel.

        #### **FOR EACH DAY, INCLUDE:**
        - A short, descriptive day title (e.g., "Historical Marvels in Downtown")
        - A day description (80-100 words) explaining the day's theme and optimized routing.
        - ${finalPreferences.activitiesPerDay}-${finalPreferences.activitiesPerDay + 2} activities covering morning, afternoon, and evening.

        #### **FOR EACH ACTIVITY, INCLUDE:**
        - A catchy, descriptive title (15 words max)
        - A compelling description (50-70 words) highlighting what makes it special
        - Exact location & nearby landmarks
        - Estimated cost category ($, $$, $$$)
        - Best time to visit
        - Activity category (attraction, food, transport, accommodation, entertainment)
        - **Optimal travel mode & estimated travel time** from the previous activity
        - A detailed image description for visual representation

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
        Ensure that the **entire itinerary follows an optimized path**, reducing unnecessary travel and enhancing the user experience.
        `;

        // Call AI model to generate the itinerary
        const result = await model.generateContent(prompt);
        let itineraryData;

        try {
            // Extract and parse the JSON response
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                              responseText.match(/```\n([\s\S]*?)\n```/) ||
                              [null, responseText];

            const jsonContent = jsonMatch[1] || responseText;
            itineraryData = JSON.parse(jsonContent);

            // Validate the parsed data structure
            if (!itineraryData.itinerary || !Array.isArray(itineraryData.itinerary)) {
                throw new Error("Invalid itinerary structure");
            }
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return res.status(500).json({ error: "Failed to parse itinerary data" });
        }

        // Process the itinerary to add images for each activity
        const enhancedItinerary = await Promise.all(
            itineraryData.itinerary.map(async (day) => {
                const activitiesWithImages = await Promise.all(
                    day.activities.map(async (activity, index) => {
                        try {
                            // Create a meaningful image query if none exists
                            const imageQuery = activity.imageQuery ||
                                `${activity.title} ${activity.category || ''} ${activity.location || ''}`.trim();

                            // Ensure we have a clean destination string
                            const cleanDestination = destination.trim();

                            // Generate or fetch an appropriate image
                            const imageUrl = await getImageForActivity(imageQuery, cleanDestination);

                            // Verify the imageUrl is valid
                            if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
                                throw new Error("Invalid image URL returned");
                            }

                            // If it's the first activity of the day, travel time is 0
                            const travelTime = index === 0 ? "Start of the day" : activity.travelTimeFromPrevious;

                            return {
                                ...activity,
                                travelTimeFromPrevious: travelTime,
                                imageUrl
                            };
                        } catch (imageError) {
                            console.warn(`Couldn't get image for ${activity.title}:`, imageError);
                            // Provide a meaningful fallback image with proper encoding
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
                    activities: activitiesWithImages
                };
            })
        );

        res.json({ itinerary: enhancedItinerary });
    } catch (error) {
        console.error("Error generating itinerary:", error);
        res.status(500).json({ error: "Failed to generate itinerary" });
    }
});

/**
 * Helper function to get an appropriate image for each activity
 * This could be replaced with an actual API call to Unsplash, Pexels, etc.
 */
/**
 * Improved helper function to get an appropriate image for each activity
 */
async function getImageForActivity(imageQuery, destination) {
    try {
        const PIXABAY_API_KEY = "49234951-834e3e16ef313cb997093d479"; // Your API key

        // Clean and format the search query
        const cleanDestination = destination.trim();
        const cleanImageQuery = (imageQuery || "").trim();

        if (!cleanImageQuery && !cleanDestination) {
            // If both are empty, return a placeholder
            return `/api/placeholder/400/300?text=${encodeURIComponent("Travel Activity")}`;
        }

        // Create a more specific search query by extracting key terms
        // This helps create better image search queries
        const extractKeyTerms = (query) => {
            if (!query) return "";
            // Extract main subjects and remove common words
            return query.split(/\s+/)
                .filter(word =>
                    word.length > 3 &&
                    !['the', 'and', 'for', 'with', 'description', 'detailed', 'generation', 'image'].includes(word.toLowerCase())
                )
                .slice(0, 4) // Take only first 4 meaningful words
                .join(' ');
        };

        // Create primary search query
        const primaryKeywords = extractKeyTerms(cleanImageQuery);
        const searchQuery = `${primaryKeywords} ${cleanDestination}`.trim();

        console.log(`Searching Pixabay for: "${searchQuery}"`);

        // Try with the combined query first
        const response = await fetch(
            `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&per_page=3&safesearch=true`
        );

        if (!response.ok) {
            throw new Error(`Pixabay API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // If we have results, return the first image URL
        if (data.hits && data.hits.length > 0) {
            console.log(`Found ${data.hits.length} images for "${searchQuery}"`);
            return data.hits[0].webformatURL;
        }

        // If no results with combined query, try with destination only if not already tried
        if (searchQuery !== cleanDestination && cleanDestination) {
            console.log(`No results for "${searchQuery}", trying destination only: "${cleanDestination}"`);

            const fallbackResponse = await fetch(
                `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(cleanDestination)}&image_type=photo&per_page=3&safesearch=true`
            );

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.hits && fallbackData.hits.length > 0) {
                    console.log(`Found ${fallbackData.hits.length} images for destination "${cleanDestination}"`);
                    return fallbackData.hits[0].webformatURL;
                }
            }
        }

        // Try with just the activity keywords if destination search failed
        if (primaryKeywords && searchQuery !== primaryKeywords) {
            console.log(`No results for destination, trying activity keywords only: "${primaryKeywords}"`);

            const keywordResponse = await fetch(
                `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(primaryKeywords)}&image_type=photo&per_page=3&safesearch=true`
            );

            if (keywordResponse.ok) {
                const keywordData = await keywordResponse.json();
                if (keywordData.hits && keywordData.hits.length > 0) {
                    console.log(`Found ${keywordData.hits.length} images for keywords "${primaryKeywords}"`);
                    return keywordData.hits[0].webformatURL;
                }
            }
        }

        // Ultimate fallback: use a descriptive placeholder
        console.log(`No images found for "${searchQuery}". Using placeholder.`);
        const placeholderText = cleanDestination || primaryKeywords || "Travel Activity";
        return `/api/placeholder/400/300?text=${encodeURIComponent(placeholderText)}`;
    } catch (error) {
        console.error("Error fetching image from Pixabay:", error);
        return `/api/placeholder/400/300?text=${encodeURIComponent("Travel Activity")}`;
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
