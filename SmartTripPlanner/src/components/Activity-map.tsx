import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Route, Map as MapIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Note: This component requires leaflet to be installed
// npm install leaflet react-leaflet

interface Activity {
  id: string;
  title: string;
  location: string;
  time?: string;
  description?: string;
  category?: string;
}

interface ActivityMapProps {
  activities: Activity[];
  destination: string;
  selectedDay?: string;
}

const ActivityMap = ({ activities, destination, selectedDay }: ActivityMapProps) => {
  // References for map and markers
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Component state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "all" or "optimized"
  const [mapType, setMapType] = useState("streets"); // "streets", "satellite", "terrain"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitTimes, setTransitTimes] = useState<Record<string, { duration: string; distance: string; loading: boolean; error: string | null }>>({});
  const [locationData, setLocationData] = useState<Array<Activity & { coords: { lat: number; lng: number } }>>([]);

  // Initialize map when component mounts
  useEffect(() => {
    // Make sure the map container exists
    const container = document.getElementById('map-container');
    if (!container) {
      setError('Map container not found');
      setIsLoading(false);
      return;
    }

    // Clean up any existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Only import Leaflet on client-side
    const loadMap = async () => {
      try {
        // Import both Leaflet and its CSS
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        // Fix Leaflet default icon issue
        // No need to delete _getIconUrl as it does not exist
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map with default view, will be updated when we have coordinates
        const mapInstance = L.map('map-container', {
          zoomControl: true,
          attributionControl: true
        }).setView([0, 0], 2); // Start with world view, will update when we have coordinates

        // Add tile layer with reliable provider
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(mapInstance);

        // Add error handling for tile loading
        tileLayer.on('tileerror', function(err) {
          console.error('Tile loading error:', err);
          setError('Failed to load map tiles. Please check your connection.');
        });

        // Save references
        mapRef.current = mapInstance;

        // Mark as loaded
        setMapLoaded(true);
        setIsLoading(false);

        // Force a resize to ensure the map renders correctly
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 100);
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Failed to load map library. Please reload the page.');
        setIsLoading(false);
      }
    };

    loadMap();

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map when map type changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    try {
      const L = window.L; // Leaflet should be globally available now

      // Remove existing tile layer
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          if (mapRef.current) {
            mapRef.current.removeLayer(layer);
          }
        }
      });

      // Add new tile layer based on selected map type
      let tileUrl: string = '', attribution: string = '';

      if (mapType === 'streets') {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      } else if (mapType === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      } else if (mapType === 'terrain') {
        tileUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png';
        attribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      }

      const tileLayer = L.tileLayer(tileUrl, {
        attribution,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapRef.current);

      // Add error handling for tile loading
      tileLayer.on('tileerror', function(err) {
        console.error('Tile loading error:', err);
      });

      // Invalidate size to ensure proper rendering
      mapRef.current.invalidateSize();
    } catch (err) {
      console.error('Error updating map tiles:', err);
      setError('Failed to update map type. Please try again.');
    }
  }, [mapType, mapLoaded]);

  // Update markers when activities change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !activities) return;
    loadActivityMarkers();
  }, [activities, mapLoaded, viewMode, selectedDay]);

  // Function to geocode using Nominatim OpenStreetMap service
interface Coordinates {
    lat: number;
    lng: number;
}

interface GeocodeResponse {
    lat: string;
    lon: string;
}

const geocodeLocation = async (location: string): Promise<Coordinates | null> => {
    try {
        const encodedLocation = encodeURIComponent(`${location}, ${destination}`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`);

        if (!response.ok) {
            throw new Error('Geocoding service failed');
        }

        const data: GeocodeResponse[] = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        } else {
            // Fallback for locations that can't be found
            console.warn(`Location not found: ${location}`);
            return null;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
};

  // Function to calculate transit time using OSRM
interface TransitTime {
    duration: string;
    distance: string;
}

const calculateTransitTime = async (origin: string, destination: string): Promise<TransitTime> => {
    try {
        // Note: This is using the public OSRM API which has usage limits
        // For a production app, consider using your own OSRM instance or a paid service
        const originCoords = await geocodeLocation(origin);
        const destCoords = await geocodeLocation(destination);

        if (!originCoords || !destCoords) {
            return { duration: 'Unknown', distance: 'Unknown' };
        }

        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=false`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Routing service failed');
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const durationMinutes = Math.round(data.routes[0].duration / 60);
            const distanceKm = (data.routes[0].distance / 1000).toFixed(1);

            return {
                duration: `${durationMinutes} min`,
                distance: `${distanceKm} km`
            };
        } else {
            return { duration: 'Unknown', distance: 'Unknown' };
        }
    } catch (error) {
        console.error('Transit calculation error:', error);
        return { duration: 'Unknown', distance: 'Unknown' };
    }
};

  // Function to geocode locations and add markers
  const loadActivityMarkers = async () => {
    if (!activities || activities.length === 0 || !mapRef.current) {
      return;
    }

    const L = window.L; // Leaflet should be globally available now
    setIsLoading(true);
    setError(null);

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      // Clear existing route
      if (routeLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // Get coordinates for all activities
      const locationsWithCoords = await Promise.all(
        activities
          .filter(activity => activity.location && activity.location.trim() !== '')
          .map(async (activity) => {
            try {
              const coords = await geocodeLocation(activity.location);
              if (!coords) {
                return null;
              }

              return {
                ...activity,
                coords
              };
            } catch (err) {
              console.warn(`Failed to geocode location for ${activity.title}:`, err);
              return null;
            }
          })
      );

      // Filter out failed geocoding results
      const validLocations = locationsWithCoords.filter(loc => loc !== null);
      setLocationData(validLocations);

      if (validLocations.length === 0) {
        setIsLoading(false);
        return;
      }

      // Calculate center of the map
      const avgLat = validLocations.reduce((sum, loc) => sum + loc.coords.lat, 0) / validLocations.length;
      const avgLng = validLocations.reduce((sum, loc) => sum + loc.coords.lng, 0) / validLocations.length;

      // Set map view to center of all markers with appropriate zoom
      mapRef.current.setView([avgLat, avgLng], 12);

      // Get optimized route if selected
      let routeOrder = validLocations;
      if (viewMode === "optimized" && validLocations.length > 1) {
        routeOrder = optimizeRoute(validLocations);
      }

      // Calculate transit times between consecutive locations
      const times: Record<string, { duration: string; distance: string; loading: boolean; error: string | null }> = {};
      for (let i = 0; i < routeOrder.length - 1; i++) {
        const origin = routeOrder[i].location;
        const destination = routeOrder[i + 1].location;
        const key = `${routeOrder[i].id || i}-${routeOrder[i + 1].id || (i + 1)}`;

        times[key] = {
          duration: 'Calculating...',
          distance: 'Calculating...',
          loading: true,
          error: null
        };
      }
      setTransitTimes(times);

      // Add markers to the map
      routeOrder.forEach((loc, index) => {
        // Create custom icon with activity index
        const customIcon = L.divIcon({
          className: 'custom-marker-icon',
          html: `<div style="background-color: #3B82F6; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        // Create marker
        const marker = L.marker([loc.coords.lat, loc.coords.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${loc.title}</h3>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">${loc.time || 'No time specified'}</div>
              <div style="font-size: 13px; margin-bottom: 6px;">${loc.location}</div>
              ${loc.description ? `<p style="font-size: 12px; color: #4B5563; margin-top: 8px;">${loc.description.substring(0, 100)}${loc.description.length > 100 ? '...' : ''}</p>` : ''}
              ${loc.category ? `<span style="background-color: #EFF6FF; color: #3B82F6; font-size: 11px; padding: 2px 6px; border-radius: 4px;">${loc.category}</span>` : ''}
            </div>
          `);

        markersRef.current.push(marker);
      });

      // Draw route line between markers if in optimized mode
      if (viewMode === "optimized" && routeOrder.length > 1) {
        // For better routing in optimized mode, we'd use OSRM to get the actual route path
        // For now, just draw straight lines between points
        const points = routeOrder.map(loc => [loc.coords.lat, loc.coords.lng]);
        routeLayerRef.current = L.polyline(points, {
          color: '#3B82F6',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5'
        }).addTo(mapRef.current);
      }

      // Now calculate the transit times (in background to not block the UI)
      for (let i = 0; i < routeOrder.length - 1; i++) {
        const origin = routeOrder[i].location;
        const destination = routeOrder[i + 1].location;
        const key = `${routeOrder[i].id || i}-${routeOrder[i + 1].id || (i + 1)}`;

        calculateTransitTime(origin, destination).then(transitData => {
          setTransitTimes(prev => ({
            ...prev,
            [key]: {
              duration: transitData.duration,
              distance: transitData.distance,
              loading: false,
              error: null
            }
          }));
        }).catch(err => {
          setTransitTimes(prev => ({
            ...prev,
            [key]: {
              duration: 'Unknown',
              distance: 'Unknown',
              loading: false,
              error: 'Failed to calculate'
            }
          }));
        });
      }

      // Force a map update to ensure everything displays correctly
      mapRef.current.invalidateSize();

    } catch (err) {
      console.error('Failed to load activity markers:', err);
      setError('Failed to display activities on the map.');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved route optimization function
interface LocationWithCoords extends Activity {
    coords: {
        lat: number;
        lng: number;
    };
}

const optimizeRoute = (locations: LocationWithCoords[]): LocationWithCoords[] => {
    // Simple nearest neighbor algorithm
    const start = locations[0];
    const remaining = [...locations.slice(1)];
    const route = [start];

    let current = start;
    while (remaining.length > 0) {
        let nearestIndex = 0;
        let minDistance = Infinity;

        remaining.forEach((loc, index) => {
            // Use Haversine formula for more accurate distance calculation on Earth's surface
            const R = 6371; // Earth's radius in km
            const dLat = (loc.coords.lat - current.coords.lat) * Math.PI / 180;
            const dLon = (loc.coords.lng - current.coords.lng) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(current.coords.lat * Math.PI / 180) * Math.cos(loc.coords.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = index;
            }
        });

        current = remaining[nearestIndex];
        route.push(current);
        remaining.splice(nearestIndex, 1);
    }

    return route;
};

  // Create a direct Google Maps link for better navigation
interface LocationWithCoords extends Activity {
    coords: {
        lat: number;
        lng: number;
    };
}

const createGoogleMapsLink = (locations: LocationWithCoords[]): string => {
    if (!locations || locations.length === 0) {
        // If no locations, just link to the destination
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
    }

    if (locations.length === 1) {
        // If single location
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locations[0].location + ', ' + destination)}`;
    }

    // For multiple locations, create a directions link
    let url = 'https://www.google.com/maps/dir/?api=1';

    // Origin (first location)
    url += `&origin=${encodeURIComponent(locations[0].location + ', ' + destination)}`;

    // Destination (last location)
    url += `&destination=${encodeURIComponent(locations[locations.length - 1].location + ', ' + destination)}`;

    // Waypoints (locations in between)
    if (locations.length > 2) {
        const waypoints = locations.slice(1, -1).map(loc => loc.location + ', ' + destination);
        url += `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
    }

    return url;
};

  return (
    <Card className="w-full border overflow-hidden bg-muted/30">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-lg font-medium">Activity Map {selectedDay ? `- ${selectedDay}` : ''}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative h-[400px] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-20">
              <div className="text-center p-4">
                <p className="text-destructive mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadActivityMarkers}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Map controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <div className="bg-card p-2 rounded-md shadow-md">
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Label htmlFor="view-mode" className="text-xs mb-1 block">View</Label>
                  <Select
                    value={viewMode}
                    onValueChange={setViewMode}
                  >
                    <SelectTrigger id="view-mode" className="h-8">
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="optimized">Optimized Route</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label htmlFor="map-type" className="text-xs mb-1 block">Map Type</Label>
                  <Select
                    value={mapType}
                    onValueChange={setMapType}
                  >
                    <SelectTrigger id="map-type" className="h-8">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streets">Streets</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="terrain">Terrain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => window.open(createGoogleMapsLink(locationData), '_blank')}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Open in Google Maps
              </Button>
            </div>

            {viewMode === "optimized" && markersRef.current.length > 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="self-end px-2 py-1">
                      <Route className="h-3 w-3 mr-1" />
                      Optimized Route
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Route optimized to minimize travel distance between locations.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Map container */}
          <div id="map-container" className="h-full w-full z-0"></div>

          {/* Fallback message when no activities have locations */}
          {(mapLoaded && !isLoading && !error && locationData.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-card p-4 rounded-lg shadow-lg text-center max-w-sm pointer-events-auto">
                <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground mb-1">No locations found for activities</p>
                <p className="text-xs text-muted-foreground/70">
                  Add locations to your activities to see them on the map
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium mb-3">Destinations Timeline</h3>
          <div className="space-y-2">
            {locationData.map((loc, index) => (
              <div key={loc.id || index}>
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-3">
                    <Badge className="h-6 w-6 rounded-full flex items-center justify-center p-0 bg-primary">
                      {index + 1}
                    </Badge>
                    {index < locationData.length - 1 && (
                      <div className="h-12 w-0.5 bg-border mt-1 mb-1"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{loc.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {loc.location}
                    </p>
                    {loc.time && (
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {loc.time}
                      </p>
                    )}

                    {/* Transit time to next location */}
                    {index < locationData.length - 1 && (
                      <div className="mt-2 mb-3 ml-1 p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-primary" />
                          <span className="text-xs">
                            {transitTimes[`${loc.id}-${locationData[index + 1].id}`]?.loading ?
                              "Calculating..." :
                              transitTimes[`${loc.id || index}-${locationData[index + 1].id || (index + 1)}`]?.duration || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-primary" />
                          <span className="text-xs">
                            {transitTimes[`${loc.id || index}-${locationData[index + 1].id || (index + 1)}`]?.loading ?
                              "Calculating..." :
                              transitTimes[`${loc.id || index}-${locationData[index + 1].id || (index + 1)}`]?.distance || "Unknown"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityMap;
