import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, DollarSign, Edit2, MapPin, Trash2 } from "lucide-react"

interface Activity {
  title: string
  description: string
  category: string | null
  time?: string
  location?: string
  cost?: string
}

interface ActivityItemProps {
  activity: Activity
  onEdit: () => void
  onDelete: () => void
}

const getCategoryIcon = (category: string | null) => {
  // Implement your logic to get the icon based on category
  // For example:
  switch (category) {
    case "Work":
      return <Edit2 className="h-6 w-6" />
    case "Personal":
      return <Clock className="h-6 w-6" />
    default:
      return <Edit2 className="h-6 w-6" />
  }
}

const getCategoryColor = (category: string | null) => {
  // Implement your logic to get the color based on category
  // For example:
  switch (category) {
    case "Work":
      return "bg-blue-500 text-white"
    case "Personal":
      return "bg-green-500 text-white"
    default:
      return ""
  }
}

export default function ActivityItem({ activity, onEdit, onDelete }: ActivityItemProps) {
  return (
    <Card className="overflow-hidden border-border/40 dark:border-border/40 bg-card/50 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-start">
          <div className="p-3 flex items-center justify-center bg-muted/30 dark:bg-muted/20 h-full">
            <div className="text-2xl">{getCategoryIcon(activity.category)}</div>
          </div>

          <div className="flex-1 p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{activity.title}</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
                  {activity.description}
                </div>
              </div>

              <Badge variant="outline" className={cn("ml-2 text-xs", getCategoryColor(activity.category))}>
                {activity.category || "Other"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground dark:text-muted-foreground/80">
              {activity.time && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              )}

              {activity.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {activity.location}
                </div>
              )}

              {activity.cost && (
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {activity.cost}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted/50 dark:hover:bg-muted/20"
              onClick={onEdit}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

