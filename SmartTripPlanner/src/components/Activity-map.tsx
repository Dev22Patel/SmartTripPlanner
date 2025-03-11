import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Clock, Route, MapIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import "./map-style.css"
import "./leaflet-polyline"
import "leaflet-polylinedecorator"
import "leaflet-polylinedecorator/dist/leaflet.polylineDecorator"
// Note: This component requires leaflet to be installed
// npm install leaflet react-leaflet

interface Activity {
  id: string
  title: string
  location: string
  time?: string
  description?: string
  category?: string
  color?: string
}

interface ActivityMapProps {
  activities: Activity[]
  destination: string
  selectedDay?: string
  className?: string
}

const ActivityMap = ({ activities, destination, selectedDay, className }: ActivityMapProps) => {
  // References for map and markers
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routeLayerRef = useRef<any | null>(null)

  // Component state
  const [mapLoaded, setMapLoaded] = useState(false)
  const [viewMode, setViewMode] = useState("all") // "all" or "optimized"
  const [mapType, setMapType] = useState("streets") // "streets", "satellite", "terrain", "dark"
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transitTimes, setTransitTimes] = useState<
    Record<string, { duration: string; distance: string; loading: boolean; error: string | null }>
  >({})
  const [locationData, setLocationData] = useState<Array<Activity & { coords: { lat: number; lng: number } }>>([])
  const [timelineOpen, setTimelineOpen] = useState(true)

  // Add this to keep track of geocoding attempts
  const geocodingAttemptsRef = useRef<Record<string, number>>({})
  // Maximum number of retry attempts for geocoding
  const MAX_GEOCODING_ATTEMPTS = 3

  // Get category color for markers
  const getCategoryColor = (category?: string): string => {
    switch (category?.toLowerCase()) {
      case "food":
        return "#3B82F6" // blue
      case "attraction":
        return "#10B981" // green
      case "transport":
        return "#F59E0B" // amber
      case "accommodation":
        return "#EF4444" // red
      default:
        return "#6366F1" // indigo
    }
  }

  // Initialize map when component mounts
  useEffect(() => {
    // Make sure the map container exists
    const container = document.getElementById("map-container")
    if (!container) {
      setError("Map container not found")
      setIsLoading(false)
      return
    }

    // Clean up any existing map instance
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Only import Leaflet on client-side
    const loadMap = async () => {
      try {
        // Import both Leaflet and its CSS
        const L = await import("leaflet")
        await import("leaflet/dist/leaflet.css")

        // Fix Leaflet default icon issue
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        // Create map with default view, will be updated when we have coordinates
        const mapInstance = L.map("map-container", {
          zoomControl: false, // We'll add custom zoom controls
          attributionControl: true,
          minZoom: 2,
          maxZoom: 18,
        }).setView([0, 0], 2) // Start with world view, will update when we have coordinates

        // Add custom zoom controls in a better position
        L.control
          .zoom({
            position: "bottomright",
          })
          .addTo(mapInstance)

        // Add initial tile layer
        addTileLayer(L, mapInstance, mapType)

        // Save references
        mapRef.current = mapInstance

        // Mark as loaded
        setMapLoaded(true)
        setIsLoading(false)

        // Force a resize to ensure the map renders correctly
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)
      } catch (err) {
        console.error("Failed to load Leaflet:", err)
        setError("Failed to load map library. Please reload the page.")
        setIsLoading(false)
      }
    }

    loadMap()

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Helper function to add the appropriate tile layer
  const addTileLayer = (L: any, map: any, type: string) => {
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Define tile layer options based on map type
    let tileUrl = "",
      attribution = "",
      options: any = {}

    switch (type) {
      case "streets":
        // Carto Voyager - modern street map with good readability
        tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution =
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        break
      case "satellite":
        // ESRI World Imagery - high-quality satellite imagery
        tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution =
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        break
      case "terrain":
        // Stamen Terrain - beautiful terrain map with hillshading
        tileUrl = "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
        attribution =
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        options.subdomains = "abcd"
        break
      case "dark":
        // Carto Dark Matter - elegant dark theme
        tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution =
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        break
      default:
        // Default to streets
        tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution =
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }

    // Add the tile layer to the map
    L.tileLayer(tileUrl, {
      attribution,
      subdomains: options.subdomains || "abcd",
      maxZoom: 19,
      ...options,
    }).addTo(map)
  }

  // Update map when map type changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    try {
      const L = window.L // Leaflet should be globally available now
      addTileLayer(L, mapRef.current, mapType)

      // Invalidate size to ensure proper rendering
      mapRef.current.invalidateSize()
    } catch (err) {
      console.error("Error updating map tiles:", err)
      setError("Failed to update map type. Please try again.")
    }
  }, [mapType, mapLoaded])

  // Update markers when activities change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !activities) return
    loadActivityMarkers()
  }, [activities, mapLoaded, viewMode, selectedDay])

  // Function to geocode using Google Maps Geocoding API
  interface Coordinates {
    lat: number
    lng: number
  }

  const geocodeLocation = async (location: string): Promise<Coordinates | null> => {
    try {
      // Track geocoding attempts to prevent infinite loops
      const locationKey = `${location}-${destination}`
      geocodingAttemptsRef.current[locationKey] = (geocodingAttemptsRef.current[locationKey] || 0) + 1

      if (geocodingAttemptsRef.current[locationKey] > MAX_GEOCODING_ATTEMPTS) {
        console.warn(`Maximum geocoding attempts reached for: ${location}`)
        return null
      }

      const encodedLocation = encodeURIComponent(`${location}, ${destination}`)

      // Using Google Maps Geocoding API
      // Note: Replace YOUR_API_KEY with an actual Google Maps API key
      const googleApiKey = "AIzaSyBBBRyJOLB08fUPndqiNdC_nkhJrkKi58Y" // Replace this with your API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Geocoding service failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      } else {
        // Fallback for locations that can't be found
        console.warn(`Location not found: ${location}. Google API response: ${data.status}`)

        // Fallback to OpenStreetMap Nominatim as backup
        return fallbackGeocodeLocation(location, destination)
      }
    } catch (error) {
      console.error("Google Geocoding error:", error)

      // Try fallback geocoding service
      return fallbackGeocodeLocation(location, destination)
    }
  }

  // Fallback geocoding using OpenStreetMap Nominatim
  const fallbackGeocodeLocation = async (location: string, destination: string): Promise<Coordinates | null> => {
    try {
      const encodedLocation = encodeURIComponent(`${location}, ${destination}`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`,
        {
          headers: {
            // Add a user agent to comply with Nominatim's usage policy
            'User-Agent': 'ActivityMapComponent/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error("Fallback geocoding service failed")
      }

      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        }
      } else {
        console.warn(`Location not found in fallback: ${location}`)
        return null
      }
    } catch (error) {
      console.error("Fallback geocoding error:", error)
      return null
    }
  }

  // Function to calculate transit time using OSRM
  interface TransitTime {
    duration: string
    distance: string
  }

  const calculateTransitTime = async (origin: string, destination: string): Promise<TransitTime> => {
    try {
      // Note: This is using the public OSRM API which has usage limits
      // For a production app, consider using your own OSRM instance or a paid service
      const originCoords = await geocodeLocation(origin)
      const destCoords = await geocodeLocation(destination)

      if (!originCoords || !destCoords) {
        return { duration: "Unknown", distance: "Unknown" }
      }

      const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=false`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Routing service failed")
      }

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const durationMinutes = Math.round(data.routes[0].duration / 60)
        const distanceKm = (data.routes[0].distance / 1000).toFixed(1)

        return {
          duration: `${durationMinutes} min`,
          distance: `${distanceKm} km`,
        }
      } else {
        return { duration: "Unknown", distance: "Unknown" }
      }
    } catch (error) {
      console.error("Transit calculation error:", error)
      return { duration: "Unknown", distance: "Unknown" }
    }
  }

  // Function to geocode locations and add markers
  const loadActivityMarkers = async () => {
    if (!activities || activities.length === 0 || !mapRef.current) {
      return
    }

    const L = window.L // Leaflet should be globally available now
    setIsLoading(true)
    setError(null)

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker)
        }
      })
      markersRef.current = []

      // Clear existing route
      if (routeLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current)
        routeLayerRef.current = null
      }

      // Reset geocoding attempts for this batch
      geocodingAttemptsRef.current = {}

      // Get coordinates for all activities
      const geocodingPromises = activities
        .filter((activity) => activity.location && activity.location.trim() !== "")
        .map(async (activity) => {
          try {
            const coords = await geocodeLocation(activity.location)
            if (!coords) {
              console.warn(`Could not geocode location for ${activity.title}`)
              return null
            }

            return {
              ...activity,
              coords,
            }
          } catch (err) {
            console.warn(`Failed to geocode location for ${activity.title}:`, err)
            return null
          }
        })

      // Use Promise.allSettled to handle all promises, even if some fail
      const results = await Promise.allSettled(geocodingPromises)

      // Extract fulfilled promises and filter out null values
      const validLocations = results
        .filter((result): result is PromiseFulfilledResult<(Activity & { coords: { lat: number; lng: number } }) | null> =>
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .filter((loc): loc is Activity & { coords: { lat: number; lng: number } } =>
          loc !== null
        )

      setLocationData(validLocations)

      if (validLocations.length === 0) {
        setError("Could not geocode any locations. Please check the address format.")
        setIsLoading(false)
        return
      }

      // Calculate center of the map
      const avgLat = validLocations.reduce((sum, loc) => sum + loc.coords.lat, 0) / validLocations.length
      const avgLng = validLocations.reduce((sum, loc) => sum + loc.coords.lng, 0) / validLocations.length

      // Set map view to center of all markers with appropriate zoom
      mapRef.current.setView([avgLat, avgLng], 12)

      // Get optimized route if selected
      let routeOrder = validLocations
      if (viewMode === "optimized" && validLocations.length > 1) {
        routeOrder = optimizeRoute(validLocations)
      }

      // Calculate transit times between consecutive locations
      const times: Record<string, { duration: string; distance: string; loading: boolean; error: string | null }> = {}
      for (let i = 0; i < routeOrder.length - 1; i++) {
        const origin = routeOrder[i].location
        const destination = routeOrder[i + 1].location
        const key = `${routeOrder[i].id || i}-${routeOrder[i + 1].id || i + 1}`

        times[key] = {
          duration: "Calculating...",
          distance: "Calculating...",
          loading: true,
          error: null,
        }
      }
      setTransitTimes(times)

      // Add markers to the map
      routeOrder.forEach((loc, index) => {
        // Get color based on category or use default
        const markerColor = loc.color || getCategoryColor(loc.category)

        // Create custom icon with activity index
        const customIcon = L.divIcon({
          className: "custom-marker-icon",
          html: `
            <div style="
              background-color: ${markerColor};
              color: white;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 3px 10px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })

        // Create marker with enhanced popup
        const marker = L.marker([loc.coords.lat, loc.coords.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(
            `
            <div style="min-width: 220px; max-width: 300px; padding: 4px;">
              <h3 style="font-weight: bold; margin-bottom: 6px; font-size: 16px; color: ${markerColor};">${loc.title}</h3>
              ${
                loc.time
                  ? `<div style="font-size: 13px; color: #6B7280; margin-bottom: 6px; display: flex; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 4px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${loc.time}
              </div>`
                  : ""
              }
              <div style="font-size: 13px; margin-bottom: 8px; display: flex; align-items: flex-start;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 4px; margin-top: 2px;">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${loc.location}</span>
              </div>
              ${loc.description ? `<p style="font-size: 13px; color: #4B5563; margin-top: 8px; line-height: 1.4;">${loc.description.substring(0, 150)}${loc.description.length > 150 ? "..." : ""}</p>` : ""}
              ${loc.category ? `<span style="display: inline-block; background-color: ${markerColor}20; color: ${markerColor}; font-size: 12px; padding: 3px 8px; border-radius: 4px; margin-top: 8px; font-weight: 500;">${loc.category.charAt(0).toUpperCase() + loc.category.slice(1)}</span>` : ""}
            </div>
          `,
            {
              className: "custom-popup",
              closeButton: true,
              autoClose: false,
              closeOnEscapeKey: true,
              closeOnClick: false,
              maxWidth: 300,
            },
          )

        markersRef.current.push(marker)
      })

      // Draw route line between markers if in optimized mode
      if (viewMode === "optimized" && routeOrder.length > 1) {
        // For better routing in optimized mode, we'd use OSRM to get the actual route path
        // For now, just draw styled lines between points
        const points: [number, number][] = routeOrder.map((loc) => [loc.coords.lat, loc.coords.lng])

        // Create a styled polyline with arrow decorations
        routeLayerRef.current = L.polyline(points, {
          color: "#3B82F6",
          weight: 4,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "0, 0",
        }).addTo(mapRef.current)

        // Add arrow decorations to show direction
        const arrowDecorator = L.polylineDecorator(routeLayerRef.current, {
          patterns: [
            {
              offset: "5%",
              repeat: "15%",
              symbol: L.Symbol.arrowHead({
                pixelSize: 12,
                polygon: false,
                pathOptions: {
                  stroke: true,
                  color: "#3B82F6",
                  weight: 3,
                },
              }),
            },
          ],
        }).addTo(mapRef.current)
      }

      // Now calculate the transit times (in background to not block the UI)
      for (let i = 0; i < routeOrder.length - 1; i++) {
        const origin = routeOrder[i].location
        const destination = routeOrder[i + 1].location
        const key = `${routeOrder[i].id || i}-${routeOrder[i + 1].id || i + 1}`

        calculateTransitTime(origin, destination)
          .then((transitData) => {
            setTransitTimes((prev) => ({
              ...prev,
              [key]: {
                duration: transitData.duration,
                distance: transitData.distance,
                loading: false,
                error: null,
              },
            }))
          })
          .catch((err) => {
            setTransitTimes((prev) => ({
              ...prev,
              [key]: {
                duration: "Unknown",
                distance: "Unknown",
                loading: false,
                error: "Failed to calculate",
              },
            }))
          })
      }

      // Force a map update to ensure everything displays correctly
      mapRef.current.invalidateSize()
    } catch (err) {
      console.error("Failed to load activity markers:", err)
      setError("Failed to display activities on the map. Please check your API key and activity locations.")
    } finally {
      setIsLoading(false)
    }
  }

  // Improved route optimization function
  interface LocationWithCoords extends Activity {
    coords: {
      lat: number
      lng: number
    }
  }

  const optimizeRoute = (locations: LocationWithCoords[]): LocationWithCoords[] => {
    // Simple nearest neighbor algorithm
    const start = locations[0]
    const remaining = [...locations.slice(1)]
    const route = [start]

    let current = start
    while (remaining.length > 0) {
      let nearestIndex = 0
      let minDistance = Number.POSITIVE_INFINITY

      remaining.forEach((loc, index) => {
        // Use Haversine formula for more accurate distance calculation on Earth's surface
        const R = 6371 // Earth's radius in km
        const dLat = ((loc.coords.lat - current.coords.lat) * Math.PI) / 180
        const dLon = ((loc.coords.lng - current.coords.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((current.coords.lat * Math.PI) / 180) *
            Math.cos((loc.coords.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = index
        }
      })

      current = remaining[nearestIndex]
      route.push(current)
      remaining.splice(nearestIndex, 1)
    }

    return route
  }

  // Create a direct Google Maps link for better navigation
  const createGoogleMapsLink = (locations: LocationWithCoords[]): string => {
    if (!locations || locations.length === 0) {
      // If no locations, just link to the destination
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`
    }

    if (locations.length === 1) {
      // If single location
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locations[0].location + ", " + destination)}`
    }

    // For multiple locations, create a directions link
    let url = "https://www.google.com/maps/dir/?api=1"

    // Origin (first location)
    url += `&origin=${encodeURIComponent(locations[0].location + ", " + destination)}`

    // Destination (last location)
    url += `&destination=${encodeURIComponent(locations[locations.length - 1].location + ", " + destination)}`

    // Waypoints (locations in between)
    if (locations.length > 2) {
      const waypoints = locations.slice(1, -1).map((loc) => loc.location + ", " + destination)
      url += `&waypoints=${encodeURIComponent(waypoints.join("|"))}`
    }

    return url
  }

  return (
    <Card className={cn("w-full border overflow-hidden bg-card shadow-md", className)}>
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-primary" />
          Activity Map {selectedDay ? `- ${selectedDay}` : ""}
        </CardTitle>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(createGoogleMapsLink(locationData), "_blank")}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in Google Maps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative h-[400px] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-20 backdrop-blur-sm">
              <div className="text-center p-4 max-w-md">
                <p className="text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={loadActivityMarkers}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <div className="bg-card rounded-md shadow-md border p-1">
              <div className="flex flex-col gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMapType("streets")}
                        data-active={mapType === "streets"}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Street Map</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMapType("satellite")}
                        data-active={mapType === "satellite"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Satellite Map</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMapType("terrain")}
                        data-active={mapType === "terrain"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m2 22 10-10 10 10" />
                          <path d="m14 13 6-6" />
                          <path d="M9 6.8 4 12" />
                          <circle cx="12" cy="5" r="3" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Terrain Map</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMapType("dark")}
                        data-active={mapType === "dark"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dark Map</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="bg-card rounded-md shadow-md border p-1">
              <div className="flex flex-col gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("all")}
                        data-active={viewMode === "all"}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show All Locations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("optimized")}
                        data-active={viewMode === "optimized"}
                      >
                        <Route className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Optimized Route</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div id="map-container" className="h-full w-full z-10" />
        </div>

        {/* Timeline View */}
        <Collapsible
          open={timelineOpen}
          onOpenChange={setTimelineOpen}
          className="border-t bg-muted/30"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Activity Timeline</span>
                {locationData.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {locationData.length} {locationData.length === 1 ? "location" : "locations"}
                  </Badge>
                )}
              </div>
              {timelineOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 max-h-[300px] overflow-y-auto group">
              {locationData.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No activities to display</p>
                </div>
              ) : (
                <div className="space-y-3 group-hover:overflow-y-auto group-hover:pr-2 scrollbar-thin scrollbar-thumb-muted/50
                  scrollbar-track-muted/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">  
                  {locationData.map((loc, index) => {
                    const nextLoc = index < locationData.length - 1 ? locationData[index + 1] : null
                    const transitKey = nextLoc ? `${loc.id || index}-${nextLoc.id || index + 1}` : null
                    const transitInfo = transitKey ? transitTimes[transitKey] : null
                    const markerColor = loc.color || getCategoryColor(loc.category)

                    return (
                      <div key={loc.id || index} className="relative">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                            style={{ backgroundColor: markerColor }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                              <h4 className="font-medium text-sm truncate">{loc.title}</h4>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{loc.location}</span>
                              </div>
                              {loc.time && (
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span>{loc.time}</span>
                                </div>
                              )}
                              {loc.category && (
                                <div className="mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{ color: markerColor, borderColor: `${markerColor}40` }}
                                  >
                                    {loc.category}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Transit information between this and next location */}
                        {transitInfo && (
                          <div className="ml-4 pl-8 border-l-2 border-dashed border-muted-foreground/30 my-2 py-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Route className="h-3 w-3 mr-1 flex-shrink-0" />
                              {transitInfo.loading ? (
                                <span>Calculating route...</span>
                              ) : transitInfo.error ? (
                                <span className="text-destructive">{transitInfo.error}</span>
                              ) : (
                                <span>
                                  {transitInfo.distance} • {transitInfo.duration} to next location
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

export default ActivityMap
