"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, DollarSign, Edit2, MapPin, Trash2, Utensils, Landmark, Bus, Home, Briefcase } from 'lucide-react'
import Image from "next/image"
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
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "attraction":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "transport":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "accommodation":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "other":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  }
}

export default function ActivityItem({ activity, onEdit, onDelete }: ActivityItemProps) {
  return (
    <Card className="overflow-hidden border-border/40 dark:border-border/40 bg-card/50 hover:shadow-md transition-shadow group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {activity.imageUrl && (
            <div className="relative w-full sm:w-1/4 h-40 sm:h-auto overflow-hidden">
              <Image
                src={activity.imageUrl || "/placeholder.svg"}
                alt={activity.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
              <Badge
                variant="outline"
                className={cn(
                  "absolute top-2 left-2 text-xs font-medium",
                  getCategoryColor(activity.category)
                )}
              >
                <span className="flex items-center gap-1">
                  {getCategoryIcon(activity.category)}
                  <span>{activity.category?.charAt(0).toUpperCase() + activity.category?.slice(1) || "Other"}</span>
                </span>
              </Badge>
            </div>
          )}

          <div className={cn(
            "flex-1 p-4",
            !activity.imageUrl && "pl-12" // Add padding when no image
          )}>
            {!activity.imageUrl && (
              <Badge
                variant="outline"
                className={cn(
                  "float-left -ml-8 mr-2 text-xs",
                  getCategoryColor(activity.category)
                )}
              >
                <span className="flex items-center gap-1">
                  {getCategoryIcon(activity.category)}
                  <span className="sr-only">{activity.category || "Other"}</span>
                </span>
              </Badge>
            )}

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
