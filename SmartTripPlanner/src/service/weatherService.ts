// services/weatherService.js
interface WeatherData {
    condition: string;
    temp_c: number;
}

interface WeatherResponse {
    ok: boolean;
    json: () => Promise<WeatherData>;
}

export async function getWeatherForecast(location: string, date: string): Promise<WeatherData | null> {
    try {
        // You'll need to replace this with your actual weather API call
        // For example, using OpenWeatherMap, WeatherAPI, or similar service
        const response: WeatherResponse = await fetch(`/api/weather?location=${encodeURIComponent(location)}&date=${date}`);

        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

interface WeatherRecommendations {
    advice: string;
    tips: string[];
}

export function getWeatherRecommendations(weatherData: WeatherData | null): WeatherRecommendations | null {
    if (!weatherData) return null;

    const { condition, temp_c } = weatherData;
    const lowerCondition = condition.toLowerCase();

    // Basic recommendations based on weather conditions
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
        return {
            advice: "Rainy conditions expected",
            tips: ["Pack an umbrella", "Consider indoor activities", "Waterproof footwear recommended"]
        };
    } else if (lowerCondition.includes('snow')) {
        return {
            advice: "Snowy conditions expected",
            tips: ["Dress in warm layers", "Check for weather-related closures", "Wear appropriate footwear"]
        };
    } else if (temp_c > 30) {
        return {
            advice: "Hot conditions expected",
            tips: ["Stay hydrated", "Apply sunscreen", "Plan for breaks in air-conditioned spaces"]
        };
    } else if (temp_c < 5) {
        return {
            advice: "Cold conditions expected",
            tips: ["Dress in warm layers", "Consider hot beverages during outdoor activities", "Check heating at accommodations"]
        };
    } else if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
        return {
            advice: "Clear conditions expected",
            tips: ["Great day for outdoor activities", "Don't forget sun protection", "Consider early starts for popular attractions"]
        };
    } else {
        return {
            advice: "Moderate conditions expected",
            tips: ["Comfortable for most activities", "Check local forecast for changes", "Pack a light jacket just in case"]
        };
    }
}
