
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Share2,
  Star,
  Utensils,
  Landmark,
  Bus,
  Home,
  Briefcase,
  ImageIcon
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Activity } from "./itinerary-builder"

interface ActivityDetailDrawerProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
}

const getCategoryIcon = (category: "food" | "attraction" | "transport" | "accommodation" | "other" | undefined) => {
  switch (category) {
    case "food":
      return <Utensils className="h-5 w-5" />
    case "attraction":
      return <Landmark className="h-5 w-5" />
    case "transport":
      return <Bus className="h-5 w-5" />
    case "accommodation":
      return <Home className="h-5 w-5" />
    case "other":
      return <Briefcase className="h-5 w-5" />
    default:
      return <Briefcase className="h-5 w-5" />
  }
}

const getCategoryColor = (category: "food" | "attraction" | "transport" | "accommodation" | "other" | undefined) => {
  switch (category) {
    case "food":
      return "bg-blue-100/90 text-blue-800 border-blue-300 dark:bg-blue-900/80 dark:text-blue-300 dark:border-blue-700"
    case "attraction":
      return "bg-green-100/90 text-green-800 border-green-300 dark:bg-green-900/80 dark:text-green-300 dark:border-green-700"
    case "transport":
      return "bg-yellow-100/90 text-yellow-800 border-yellow-300 dark:bg-yellow-900/80 dark:text-yellow-300 dark:border-yellow-700"
    case "accommodation":
      return "bg-red-100/90 text-red-800 border-red-300 dark:bg-red-900/80 dark:text-red-300 dark:border-red-700"
    case "other":
      return "bg-gray-100/90 text-gray-800 border-gray-300 dark:bg-gray-900/80 dark:text-gray-300 dark:border-gray-700"
    default:
      return "bg-gray-100/90 text-gray-800 border-gray-300 dark:bg-gray-900/80 dark:text-gray-300 dark:border-gray-700"
  }
}

export default function ActivityDetailDrawer({ activity, isOpen, onClose }: ActivityDetailDrawerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Functions to handle image states
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Check if we have a valid image URL
  const hasValidImageUrl = activity?.imageUrl &&
    typeof activity.imageUrl === 'string' &&
    activity.imageUrl.trim() !== '' &&
    !activity.imageUrl.includes('undefined');

  // Determine if we should show the image section
  const shouldShowImage = hasValidImageUrl && !imageError;

  // Get a fallback image URL if needed
  const getImageUrl = () => {
    if (!shouldShowImage) {
      // Create a placeholder with the activity title and category
      const placeholderText = `${activity?.title?.substring(0, 15) || "Activity"} (${activity?.category || "misc"})`;
      return `/api/placeholder/800/400?text=${encodeURIComponent(placeholderText)}`;
    }
    return activity?.imageUrl;
  };

  if (!activity) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-4xl mx-auto w-full">
          {/* Image section */}
          <div className="relative w-full h-64 md:h-80 overflow-hidden bg-muted">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
              </div>
            )}
            <img
              src={getImageUrl() || "/placeholder.svg"}
              alt={activity.title || "Activity image"}
              className={cn(
                "object-cover w-full h-full",
                imageLoading && "opacity-0",
                !imageLoading && "opacity-100 transition-opacity duration-300"
              )}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Gradient overlay for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

            {/* Category badge */}
            <Badge
              variant="outline"
              className={cn(
                "absolute top-4 left-4 text-sm font-medium backdrop-blur-sm shadow-sm",
                getCategoryColor(activity.category)
              )}
            >
              <span className="flex items-center gap-1.5">
                {getCategoryIcon(activity.category)}
                <span>{((activity.category ?? "other").charAt(0).toUpperCase() + (activity.category ?? "other").slice(1))}</span>
              </span>
            </Badge>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">{activity.title}</h2>
            </div>
          </div>

          <div className="px-4 pb-6 pt-6 md:px-6">
            {/* Info cards section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {activity.time && (
                <div className="flex items-center p-3 rounded-lg border bg-card/50">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">{activity.time}</p>
                  </div>
                </div>
              )}

              {activity.location && (
                <div className="flex items-center p-3 rounded-lg border bg-card/50">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{activity.location}</p>
                  </div>
                </div>
              )}

              {activity.cost && (
                <div className="flex items-center p-3 rounded-lg border bg-card/50">
                  <DollarSign className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-medium">{activity.cost}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Full description */}
            {activity.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            )}

            {/* Additional notes section - you can expand with more fields */}
            {activity.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">{activity.notes}</p>
                </div>
              </div>
            )}

            {/* Contact information if available */}
            {(activity.website || activity.phone) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="flex flex-col space-y-2">
                  {activity.website && (
                    <a href={activity.website} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  {activity.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{activity.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <DrawerFooter className="px-0 pt-2">
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <DrawerClose asChild>
                  <Button className="flex-1">Close</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
