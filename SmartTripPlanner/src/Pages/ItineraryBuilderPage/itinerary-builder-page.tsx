import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ItineraryBuilder from "./itinerary-components/itinerary-builder"
import DestinationRecommendations from "./itinerary-components/destination-recommendations"
import { Separator } from "@/components/ui/separator"
import { MapPin } from "lucide-react"
import './itinerary.css'

export default function ItineraryBuilderPage() {
    const [searchParams] = useSearchParams()
    const destination = searchParams.get("destination") || "Unknown Destination"
    const [isLoading, setIsLoading] = useState(true)

    // Define the scrollable container styles directly
    const stickyContainerStyle: React.CSSProperties = {
      position: 'sticky',
      top: '1rem',
      alignSelf: 'start',
      height: 'calc(100vh - 100px)',
      overflow: 'hidden', // Start with hidden
    }

    const scrollableContentStyle: React.CSSProperties = {
      height: '100%',
      overflowY: 'auto',
      paddingRight: '1rem',
      maxHeight: 'calc(100vh - 100px)',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(59, 130, 246, 0.5) transparent'
    }

    // Add hover effect with JavaScript
    const handleMouseEnter = (e:any) => {
      e.currentTarget.style.overflowY = 'scroll';
    }

    const handleMouseLeave = (e:any) => {
      e.currentTarget.style.overflowY = 'auto';
    }

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }, []);

    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 max-w-7xl mb-32">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-black dark:text-white">Plan Your Perfect Trip</h1>
            <div className="flex items-center justify-center text-lg text-muted-foreground">
              <MapPin className="h-5 w-5 mr-1 text-primary" />
              <span>
                Destination: <span className="font-medium text-primary">{destination}</span>
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left container - ItineraryBuilder - No scrolling, full height */}
            <div className="lg:col-span-2">
              <ItineraryBuilder isLoading={isLoading} destination={destination} />
            </div>

            {/* Right container with direct styles and event handlers */}
            <div style={stickyContainerStyle}>
              <div
                style={scrollableContentStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <DestinationRecommendations isLoading={isLoading} destination={destination} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
