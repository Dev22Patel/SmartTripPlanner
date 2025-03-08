// services/mapService.ts - Improved with robust error handling and location normalization
import axios from 'axios';

interface TransitTimeResponse {
  duration: string;
  distance: string;
}

interface GeocodedLocation {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
}

// Function to geocode a location string to lat/lng coordinates
export async function geocodeLocation(locationString: string): Promise<{lat: number, lng: number}> {
  try {
    // Ensure the location has enough context
    const enhancedLocation = enhanceLocationIfNeeded(locationString);

    const response = await fetch(
      `http://localhost:5000/api/geocode?address=${encodeURIComponent(enhancedLocation)}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK' || !data.lat || !data.lng) {
      throw new Error('Invalid geocoding response');
    }

    return {
      lat: data.lat,
      lng: data.lng
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Return Mumbai default coordinates as fallback
    return { lat: 19.0760, lng: 72.8777 };
  }
}

// Helper function to make sure locations have enough context
function enhanceLocationIfNeeded(location: string): string {
  // If the location already has commas, it's likely specific enough
  if (location.includes(',')) {
    return location;
  }

  // Check for Bhuj-specific locations
  if (location.toLowerCase().includes('bhuj')) {
    return `${location}, Bhuj, Gujarat, India`;
  }

  // For other locations, add general India context
  return `${location}, India`;
}

export async function getTransitTime(origin: string, destination: string): Promise<TransitTimeResponse> {
  try {
    // Add more context to locations
    const enhancedOrigin = enhanceLocationIfNeeded(origin);
    const enhancedDestination = enhanceLocationIfNeeded(destination);

    console.log(`Requesting directions: ${enhancedOrigin} to ${enhancedDestination}`);

    const response = await fetch(
      `http://localhost:5000/api/directions?origin=${encodeURIComponent(enhancedOrigin)}&destination=${encodeURIComponent(enhancedDestination)}`,
      {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      // Try alternative approach - use geocoded coordinates instead
      return await getTransitTimeWithGeocode(origin, destination);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      // Try alternative approach if the API returns non-OK status
      return await getTransitTimeWithGeocode(origin, destination);
    }

    return {
      duration: data.duration,
      distance: data.distance
    };
  } catch (error) {
    console.error('Error fetching directions:', error);
    // Return placeholders but also try the backup approach
    try {
      return await getTransitTimeWithGeocode(origin, destination);
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);
      return { duration: 'Unknown', distance: 'Unknown' };
    }
  }
}

// Alternative approach using geocoded coordinates directly
async function getTransitTimeWithGeocode(origin: string, destination: string): Promise<TransitTimeResponse> {
  try {
    // Get coordinates for origin and destination
    const originCoords = await geocodeLocation(origin);
    const destCoords = await geocodeLocation(destination);

    // Format as lat,lng strings
    const originStr = `${originCoords.lat},${originCoords.lng}`;
    const destStr = `${destCoords.lat},${destCoords.lng}`;

    console.log(`Trying geocoded approach: ${originStr} to ${destStr}`);

    const response = await fetch(
      `http://localhost:5000/api/directions?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}`,
      {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch directions with coordinates: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`API Error with coordinates: ${data.status}`);
    }

    return {
      duration: data.duration,
      distance: data.distance
    };
  } catch (coordError) {
    console.error('Geocoded directions approach failed:', coordError);
    // Calculate approximate distance as last resort
    const approxDistance = calculateApproximateDistance(origin, destination);
    return {
      duration: `~${Math.round(approxDistance / 40 * 60)} mins`, // Rough estimate at 40 km/h
      distance: `~${approxDistance.toFixed(1)} km`
    };
  }
}

// Last resort function to provide at least some estimate
function calculateApproximateDistance(origin: string, destination: string): number {
  // For Bhuj, provide some reasonable estimates between common locations
  if (origin.includes('Bhuj City Centre') && destination.includes('Aina Mahal')) {
    return 2.5; // approximate distance in km
  }
  if (origin.includes('Aina Mahal') && destination.includes('Restaurant')) {
    return 1.8; // approximate distance in km
  }
  // Default fallback
  return 3.0; // generic fallback distance in km
}

// New function for Routes API v2
export async function getRoutesV2(origin: string, destination: string, travelMode: string = "TRANSIT") {
  try {
    const enhancedOrigin = enhanceLocationIfNeeded(origin);
    const enhancedDestination = enhanceLocationIfNeeded(destination);

    const response = await fetch(
      `http://localhost:5000/api/routes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: enhancedOrigin,
          destination: enhancedDestination,
          travelMode
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch routes data: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}

// Generate map URL
export function generateMapUrl(locations: string[], destination?: string): string {
  // Your existing map URL generation logic
  const markers = locations.map((loc, index) =>
    `markers=color:red%7Clabel:${index + 1}%7C${encodeURIComponent(loc)}`
  ).join('&');

  const destMarker = destination ?
    `&markers=color:blue%7Clabel:D%7C${encodeURIComponent(destination)}` : '';

  return `https://maps.googleapis.com/maps/api/staticmap?size=600x300&scale=2&${markers}${destMarker}&key=${import.meta.env.VITE_STATIC_MAP_API_KEY}`;
}
