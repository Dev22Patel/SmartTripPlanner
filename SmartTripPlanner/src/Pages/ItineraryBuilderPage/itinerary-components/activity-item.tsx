"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Clock, DollarSign, Edit2, MapPin, Trash2, Utensils,
  Landmark, Bus, Home, Briefcase, ImageIcon, Eye, Info
} from 'lucide-react'
import type { Activity } from "./itinerary-builder"
import ActivityDetailDrawer from "./activity-detail-drawer"

interface ActivityItemProps {
  activity: Activity
  onEdit: () => void
  onDelete: () => void
}

const getCategoryIcon = (category: "food" | "attraction" | "transport" | "accommodation" | "other" | undefined) => {
  switch (category) {
    case "food":
      return <Utensils className="h-4 w-4" />
    case "attraction":
      return <Landmark className="h-4 w-4" />
    case "transport":
      return <Bus className="h-4 w-4" />
    case "accommodation":
      return <Home className="h-4 w-4" />
    case "other":
      return <Briefcase className="h-4 w-4" />
    default:
      return <Briefcase className="h-4 w-4" />
  }
}

const getCategoryColor = (category: "food" | "attraction" | "transport" | "accommodation" | "other" | undefined) => {
  switch (category) {
    case "food":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "attraction":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "transport":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "accommodation":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "other":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export default function ActivityItem({ activity, onEdit, onDelete }: ActivityItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Handle successful image load
  const handleImageLoad = () => {
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
      return `/api/placeholder/400/300?text=${encodeURIComponent(activity.title || "Activity")}`;
    }
    return activity.imageUrl;
  };

  // Format category name for display
  const categoryName = activity.category
    ? activity.category.charAt(0).toUpperCase() + activity.category.slice(1)
    : "Other";

  return (
    <>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          {/* Main layout - Image on top, content below for all screen sizes */}
          <div className="flex flex-col">
            {/* Image Section */}
            <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              {/* Loading state */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-400 animate-pulse" />
                </div>
              )}

              {/* Main image */}
              <img
                src={getImageUrl()}
                alt={activity.title || "Activity"}
                className={cn(
                  "w-full h-full object-cover",
                  imageLoading && "opacity-0",
                  !imageLoading && "opacity-100 transition-opacity duration-300"
                )}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />

              {/* Category badge */}
              <Badge
                className={cn(
                  "absolute top-3 left-3 py-1 px-2 font-medium text-xs",
                  getCategoryColor(activity.category)
                )}
              >
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon(activity.category)}
                  <span>{categoryName}</span>
                </span>
              </Badge>
            </div>

            {/* Content Section */}
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{activity.title}</h3>

              {activity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {activity.description}
                </p>
              )}

              {/* Details section */}
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {activity.time && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{activity.time}</span>
                  </div>
                )}

                {activity.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="truncate max-w-32">{activity.location}</span>
                  </div>
                )}

                {/* {activity.cost && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{activity.cost}</span>
                  </div>
                )} */}
              </div>

              {/* Action buttons - Clearly labeled with text for non-technical users */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  View Details
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <ActivityDetailDrawer
        activity={activity}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}
