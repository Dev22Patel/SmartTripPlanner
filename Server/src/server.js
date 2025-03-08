const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authroutes");
const cors = require("cors");
require("dotenv").config();
const travelPreferenceRoutes = require("./routes/travelpreferencesRoutes");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const genAI = new GoogleGenerativeAI("AIzaSyD0uYe2qALWg7niW-HR357N0PW6_SgpFPQ");

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
        ...preferences
      };

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Enhanced prompt for detailed, visual itinerary generation with day descriptions
      const prompt = `
        Create a detailed, visually-rich ${finalPreferences.days}-day travel itinerary for ${destination}.

        PREFERENCES:
        - Budget: ${finalPreferences.budget}
        - Interests: ${finalPreferences.interests}
        - Pace: ${finalPreferences.pace}

        FOR EACH DAY, INCLUDE:
        - A short descriptive day title (e.g., "Cultural Immersion Day")
        - A day description (80-100 words) explaining the theme or focus of the day and how activities connect
        - 3-5 activities covering morning, afternoon, and evening
        - For each activity, provide:
          * A catchy, descriptive title (15 words max)
          * A compelling description (50-70 words) highlighting what makes this special
          * Approximate location
          * Estimated cost category ($, $$, $$$)
          * Best time to visit
          * Activity category (attraction, food, transport, accommodation, entertainment)
          * A detailed image description that would make a perfect visual representation

        FORMATTING:
        Return a structured JSON with this exact format:
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
                  "imageQuery": "detailed description for image generation"
                }
              ]
            }
          ]
        }

        Make sure each activity is unique and authentic to the destination. Focus on both must-see attractions and hidden gems. Include local food recommendations and practical transportation tips. Create an immersive journey that follows a logical flow through the destination.
      `;

      const result = await model.generateContent(prompt);
      let itineraryData;

      try {
        // Extract and parse the JSON response
        const responseText = result.response.text();
        // Find JSON content between triple backticks if present
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                          responseText.match(/```\n([\s\S]*?)\n```/) ||
                          [null, responseText];

        const jsonContent = jsonMatch[1] || responseText;
        itineraryData = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return res.status(500).json({ error: "Failed to parse itinerary data" });
      }

      // Process the itinerary to add images for each activity
      const enhancedItinerary = await Promise.all(
        itineraryData.itinerary.map(async (day) => {
          const activitiesWithImages = await Promise.all(
            day.activities.map(async (activity) => {
              try {
                // Generate or fetch an appropriate image based on the imageQuery
                const imageUrl = await getImageForActivity(activity.imageQuery, destination);

                return {
                  ...activity,
                  imageUrl
                };
              } catch (imageError) {
                console.warn(`Couldn't get image for ${activity.title}:`, imageError);
                return {
                  ...activity,
                  imageUrl: `/api/placeholder/400/300?text=${encodeURIComponent(activity.title)}`
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
  async function getImageForActivity(imageQuery, destination) {
    try {
      // For a real implementation, you would call an image API here
      // Example with Unsplash:
      /*
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          `${imageQuery} ${destination}`
        )}&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
          }
        }
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
      */

      // For demo purposes, return a placeholder
      return `/api/placeholder/400/300?text=${encodeURIComponent(imageQuery.substring(0, 30))}`;
    } catch (error) {
      console.error("Error fetching image:", error);
      return `/api/placeholder/400/300`;
    }
  }

  // Helper function to parse the itinerary text and extract image queries
  function parseItineraryWithImageQueries(itineraryText) {
    const days = itineraryText.split('Day').filter(Boolean);

    return days.map((day, index) => {
      const dayNumber = index + 1;
      const activities = day.split('\n').filter(Boolean).map(activity => {
        // Extract information from each activity line
        // Format expected: "- Activity: Title | Description | image_query"
        const parts = activity.split('|').map(part => part.trim());

        if (parts.length >= 3) {
          const activityLine = parts[0];
          const title = activityLine.split(':')[1]?.trim() || activityLine;
          return {
            title,
            description: parts[1] || "",
            imageQuery: parts[2] || `${title} ${dayNumber}`
          };
        }

        return { title: activity, description: "", imageQuery: `${activity} ${dayNumber}` };
      });

      return {
        day: dayNumber,
        title: `Day ${dayNumber}`,
        activities
      };
    });
  }

  // Function to add image URLs to each activity
  async function enrichItineraryWithImages(parsedItinerary) {
    // You would need to implement this using an image API like Unsplash, Pexels, etc.
    // For example with Unsplash API:

    const enrichedItinerary = [...parsedItinerary];

    for (const day of enrichedItinerary) {
      for (const activity of day.activities) {
        try {
          // Example using Unsplash API (you would need to set up your API key)
          // const response = await axios.get('https://api.unsplash.com/search/photos', {
          //   params: { query: activity.imageQuery, per_page: 1 },
          //   headers: { 'Authorization': `Client-ID YOUR_UNSPLASH_API_KEY` }
          // });
          // activity.imageUrl = response.data.results[0]?.urls.regular || "";

          // For placeholder purposes:
          activity.imageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(activity.imageQuery)}`;
        } catch (error) {
          console.error(`Failed to fetch image for ${activity.imageQuery}:`, error);
          activity.imageUrl = "";
        }
      }
    }

    return enrichedItinerary;
  }


// Start Server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
