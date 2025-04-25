
import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ItineraryBuilder from "./itinerary-components/itinerary-builder"
import DestinationRecommendations from "./itinerary-components/destination-recommendations"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import "./itinerary.css"
import ColourfulText from "@/components/ui/colourful-text"
import DragOverlay from "@/components/DragOverlay"

export default function ItineraryBuilderPage() {
  const [searchParams] = useSearchParams()
  const destination = searchParams.get("destination") || "Unknown Destination"
  const [isLoading, setIsLoading] = useState(true)

  // Define the scrollable container styles directly
  const stickyContainerStyle: React.CSSProperties = {
    position: "sticky",
    top: "1rem",
    alignSelf: "start",
    height: "calc(100vh - 100px)",
    overflow: "hidden",
  }

  const scrollableContentStyle: React.CSSProperties = {
    height: "100%",
    overflowY: "auto",
    paddingRight: "1rem",
    maxHeight: "calc(100vh - 100px)",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(59, 130, 246, 0.5) transparent",
  }

  // Add hover effect with JavaScript
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.overflowY = "scroll"
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.overflowY = "auto"
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const [isDragging, setIsDragging] = useState(false)

  // Add these event handlers to the component
  const handleDragEnter = () => setIsDragging(true)
  const handleDragLeave = () => setIsDragging(false)
  const handleDragEnd = () => setIsDragging(false)

  // Add event listeners to the document for global drag state
  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragend', handleDragEnd)
    document.addEventListener('drop', handleDragEnd)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragend', handleDragEnd)
      document.removeEventListener('drop', handleDragEnd)
    }
  }, [])


  return (
    <div className="min-h-screen bg-background transition-colors duration-300 mt-20">

        <DragOverlay isDragging={isDragging} />

      <div className="container mx-auto px-4 py-6 max-w-7xl mb-32">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white"><ColourfulText text="Trip Planner"/></h1>
          </div>

          <div className="flex items-center justify-center text-lg text-muted-foreground">
            <MapPin className="h-5 w-5 mr-1 text-primary" />
            <span>
              Destination: <span className="font-medium text-primary">{destination}</span>
            </span>
          </div>

          <div className="flex items-center mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Build your perfect trip by adding activities to each day. Drag activities to reorder them or move
                    between days.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-muted-foreground">Build your day-by-day plan for an unforgettable trip</p>
          </div>
        </div>

        <Separator className="my-6 mt-3 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left container - ItineraryBuilder - With drag highlight */}
            <div className={`lg:col-span-2 ${isDragging ? 'ring-2 ring-primary/30 rounded-lg transition-all' : ''}`}>
            <ItineraryBuilder
                isLoading={isLoading}
                destination={destination}
            />
            </div>

            {/* Right container - No changes needed here */}
            <div style={stickyContainerStyle} className="bg-background rounded-lg">
            <div
                style={scrollableContentStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="scrollbar-hide"
            >
                <DestinationRecommendations
                isLoading={isLoading}
                destination={destination}
                />
            </div>
            </div>
        </div>
        </div>
      </div>
  )
}
