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

app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const { destination, preferences } = req.body;
      if (!destination || !preferences) {
        return res.status(400).json({ error: "Missing destination or preferences" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Enhanced prompt that requests images for each activity
      const prompt = `Create a detailed ${preferences.days}-day travel plan for ${destination} considering ${preferences.interests} and a ${preferences.budget} budget.
      For each day and activity, please include:
      1. A brief title for the activity
      2. A short description
      3. An image_query that describes what kind of image would best represent this activity or location (e.g., "Eiffel Tower Paris skyline", "Traditional Thai street food Bangkok")

      Format each day as follows:
      Day 1:
      - Morning Activity: [Title] | [Description] | [image_query]
      - Afternoon Activity: [Title] | [Description] | [image_query]
      - Evening Activity: [Title] | [Description] | [image_query]`;

      const result = await model.generateContent(prompt);
      const itinerary = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No itinerary generated.";

      // Parse the itinerary to extract image queries
      const parsedItinerary = parseItineraryWithImageQueries(itinerary);

      // Fetch images for each activity using a service like Unsplash or Pexels API
      const enhancedItinerary = await enrichItineraryWithImages(parsedItinerary);

      res.json({ itinerary: enhancedItinerary });
    } catch (error) {
      console.error("Error generating itinerary:", error.message);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

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
