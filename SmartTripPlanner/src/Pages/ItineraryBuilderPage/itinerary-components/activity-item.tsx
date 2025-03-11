"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, DollarSign, Edit2, MapPin, Trash2, Utensils, Landmark, Bus, Home, Briefcase, ImageIcon } from 'lucide-react'
import type { Activity } from "./itinerary-builder"

interface ActivityItemProps {
  activity: Activity
  onEdit: () => void
  onDelete: () => void
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

export default function ActivityItem({ activity, onEdit, onDelete }: ActivityItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Function to handle image loading errors
  const handleImageError = () => {
    console.log(`Image error for: ${activity.title}`);
    setImageError(true);
    setImageLoading(false);
  };

  // Function to handle successful image load
  const handleImageLoad = () => {
    console.log(`Image loaded for: ${activity.title}`);
    setImageLoading(false);
  };

  // Check if we have a valid image URL
  const hasValidImageUrl = activity.imageUrl &&
    typeof activity.imageUrl === 'string' &&
    activity.imageUrl.trim() !== '' &&
    !activity.imageUrl.includes('undefined');

  // Determine if we should show the image section
  const shouldShowImage = hasValidImageUrl && !imageError;

  // Get a fallback image URL if needed
  const getImageUrl = () => {
    if (!shouldShowImage) {
      // Create a placeholder with the activity title and category
      const placeholderText = `${activity.title?.substring(0, 15) || "Activity"} (${activity.category || "misc"})`;
      return `/api/placeholder/400/300?text=${encodeURIComponent(placeholderText)}`;
    }
    return activity.imageUrl;
  };

  return (
    <Card className="overflow-hidden border-border/40 dark:border-border/40 bg-card/50 hover:shadow-md transition-shadow group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-1/4 h-40 sm:h-auto overflow-hidden bg-muted">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
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
            {/* Semi-transparent overlay to improve badge visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-16 pointer-events-none"></div>
            <Badge
              variant="outline"
              className={cn(
                "absolute top-2 left-2 text-xs font-medium backdrop-blur-sm shadow-sm",
                getCategoryColor(activity.category)
              )}
            >
              <span className="flex items-center gap-1">
                {getCategoryIcon(activity.category)}
                <span>{((activity.category ?? "other").charAt(0).toUpperCase() + (activity.category ?? "other").slice(1))}</span>
              </span>
            </Badge>
          </div>

          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{activity.title}</h3>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted/50 dark:hover:bg-muted/20"
                  onClick={onEdit}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
              {activity.time && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-primary/70" />
                  {activity.time}
                </div>
              )}

              {activity.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                  {activity.location}
                </div>
              )}

              {activity.cost && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-primary/70" />
                  {activity.cost}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
