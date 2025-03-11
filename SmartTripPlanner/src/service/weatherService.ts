const API_KEY = "6a212f58935562b3a672ee1b9d1991c1"; // Replace with your API Key
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"; // OpenWeather 5-day forecast API

interface GeoData {
    lat: number;
    lon: number;
}

interface Weather {
    description: string;
}

interface Main {
    temp: number;
    temp_min: number;
    temp_max: number;
}

interface Forecast {
    dt: number;
    weather: Weather[];
    main: Main;
}

interface WeatherData {
    list: Forecast[];
}

export async function getWeatherForecast(location: string, date: string): Promise<{
    condition: string;
    temp_c: number;
    min_temp_c: number;
    max_temp_c: number;
    date: string;
} | null>

{
    console.log(location);
    try {
        // Convert location name to coordinates using OpenWeather's Geocoding API
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`);
        const geoData: GeoData[] = await geoResponse.json();

        if (!geoData.length) throw new Error("Invalid location");

        const { lat, lon } = geoData[0];

        // Fetch weather forecast using coordinates
        const weatherResponse = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const weatherData: WeatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.list) throw new Error("Invalid weather data");

        // Find the closest matching forecast based on the given date
        const selectedForecast = weatherData.list.find(forecast => {
            const forecastDate = new Date(forecast.dt * 1000).toISOString().split("T")[0];
            return forecastDate === date;
        });

        if (!selectedForecast) throw new Error("No weather data for this date");

        return {
            condition: selectedForecast.weather[0].description,
            temp_c: selectedForecast.main.temp,
            min_temp_c: selectedForecast.main.temp_min,
            max_temp_c: selectedForecast.main.temp_max,
            date: date
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}


interface WeatherRecommendations {
    advice: string;
    tips: string[];
}

interface WeatherData {
    condition: string;
    temp_c: number;
    min_temp_c: number;
    max_temp_c: number;
    date: string;
}

export function getWeatherRecommendations(weatherData: WeatherData | null): WeatherRecommendations | null {
    if (!weatherData) return null;

    const { condition, temp_c } = weatherData;
    const lowerCondition = condition.toLowerCase();

    if (lowerCondition.includes("rain") || lowerCondition.includes("shower")) {
        return {
            advice: "Rainy conditions expected",
            tips: [
                "Pack an umbrella",
                "Wear waterproof footwear",
                "Drive safely, roads may be slippery"
            ]
        };
    } else if (lowerCondition.includes("snow")) {
        return {
            advice: "Snowy conditions expected",
            tips: [
                "Dress in warm layers",
                "Be cautious of icy roads",
                "Check for weather-related travel delays"
            ]
        };
    } else if (temp_c > 30) {
        return {
            advice: "Hot weather conditions",
            tips: [
                "Stay hydrated",
                "Wear sunscreen and sunglasses",
                "Avoid outdoor activities during peak heat"
            ]
        };
    } else if (temp_c < 5) {
        return {
            advice: "Cold weather conditions",
            tips: [
                "Wear warm clothing",
                "Protect yourself from wind chills",
                "Consider hot beverages for warmth"
            ]
        };
    } else if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
        return {
            advice: "Clear skies ahead!",
            tips: [
                "Great time for outdoor activities",
                "Use sunscreen if spending long hours outside",
                "Enjoy the pleasant weather!"
            ]
        };
    } else {
        return {
            advice: "Mild weather conditions",
            tips: [
                "Comfortable for most activities",
                "Carry a light jacket just in case",
                "Keep an eye on any weather updates"
            ]
        };
    }
}
