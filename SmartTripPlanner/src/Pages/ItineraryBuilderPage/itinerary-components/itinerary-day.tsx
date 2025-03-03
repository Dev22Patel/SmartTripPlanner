
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, Plus, Trash2 } from "lucide-react"
import type { Day, Activity } from "./itinerary-builder"
import ActivityItem from "./activity-item"
import AddActivityDialog from "./add-activity-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"

interface ItineraryDayProps {
  day: Day
  updateDay: (day: Day) => void
  removeDay: (dayId: string) => void
}

export default function ItineraryDay({ day, updateDay, removeDay }: ItineraryDayProps) {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      updateDay({
        ...day,
        date: date.toISOString().split("T")[0],
      })
    }
  }

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity = {
      ...activity,
      id: uuidv4(),
    }

    updateDay({
      ...day,
      activities: [...day.activities, newActivity],
    })
  }

  const updateActivity = (updatedActivity: Activity) => {
    updateDay({
      ...day,
      activities: day.activities.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)),
    })
    setEditingActivity(null)
  }

  const removeActivity = (activityId: string) => {
    updateDay({
      ...day,
      activities: day.activities.filter((activity) => activity.id !== activityId),
    })
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setIsAddActivityOpen(true)
  }

  return (
    <Card className="border border-muted">
      <CardHeader className="bg-muted/50 flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Day {day.dayNumber}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed flex gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(day.date), "MMM d, yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={new Date(day.date)} onSelect={handleDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeDay(day.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {day.activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No activities planned for this day yet.</div>
        ) : (
          <div className="space-y-3">
            {day.activities
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onEdit={() => handleEditActivity(activity)}
                  onDelete={() => removeActivity(activity.id)}
                />
              ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 border-dashed"
          onClick={() => {
            setEditingActivity(null)
            setIsAddActivityOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Activity
        </Button>
      </CardContent>

      <AddActivityDialog
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onAdd={addActivity}
        onUpdate={updateActivity}
        activity={editingActivity}
      />
    </Card>
  )
}
