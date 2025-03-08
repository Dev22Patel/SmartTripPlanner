import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Edit, Map, Plus, Trash2, CloudSun } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import ActivityItem from "./activity-item"
import type { Day, Activity } from "./itinerary-builder"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WeatherForecast from "@/components/WeatherForcast"
import ActivityMap from "@/components/Activity-map"


interface ItineraryDayProps {
  day: Day
  updateDay: (day: Day) => void
  removeDay: (dayId: string) => void
  destination: string
}

export default function ItineraryDay({ day, updateDay, removeDay, destination }: ItineraryDayProps) {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [isDeleteDayOpen, setIsDeleteDayOpen] = useState(false)
  const [isEditDescriptionOpen, setIsEditDescriptionOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [dayDescription, setDayDescription] = useState(day.description || "")
  const [activeTab, setActiveTab] = useState("activities")
  const [newActivity, setNewActivity] = useState<Activity>({
    id: "",
    title: "",
    description: "",
    time: "",
    location: "",
    cost: "",
    category: "other",
    imageUrl: "",
  })

  const handleAddActivity = () => {
    if (!newActivity.title.trim()) return

    const activityToAdd = {
      ...newActivity,
      id: editingActivity ? editingActivity.id : uuidv4(),
    }

    if (editingActivity) {
      // Update existing activity
      updateDay({
        ...day,
        activities: day.activities.map((activity) =>
          activity.id === activityToAdd.id ? activityToAdd : activity
        ),
      })
    } else {
      // Add new activity
      updateDay({
        ...day,
        activities: [...day.activities, activityToAdd],
      })
    }

    // Reset form and close dialog
    setNewActivity({
      id: "",
      title: "",
      description: "",
      time: "",
      location: "",
      cost: "",
      category: "other",
      imageUrl: "",
    })
    setEditingActivity(null)
    setIsAddActivityOpen(false)
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setNewActivity({ ...activity })
    setIsAddActivityOpen(true)
  }

  const handleDeleteActivity = (activityId: string) => {
    updateDay({
      ...day,
      activities: day.activities.filter((activity) => activity.id !== activityId),
    })
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      updateDay({
        ...day,
        date: date.toISOString().split("T")[0],
      })
    }
  }

  const saveDescription = () => {
    updateDay({
      ...day,
      description: dayDescription
    })
    setIsEditDescriptionOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-sm h-9 px-3"
              >
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(day.date), "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(day.date)}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setIsDeleteDayOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete day</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Day description and weather */}
        <div className="space-y-4 lg:col-span-1">
          {/* Day Description Card */}
          <Card className="bg-muted/40 border border-border/60">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium">Day {day.dayNumber} Overview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditDescriptionOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit Description</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {day.description || "Add a description to summarize this day's activities and theme..."}
              </p>
            </CardContent>
          </Card>

          {/* Weather forecast */}
          <WeatherForecast location={destination} date={day.date} />
        </div>

        {/* Right column - Activities and map */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="activities" className="flex-1">
                Activities
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1">
                <Map className="h-4 w-4 mr-1" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="weather" className="flex-1 lg:hidden">
                <CloudSun className="h-4 w-4 mr-1" />
                Weather
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-4 mt-0">
              {day.activities.length > 0 ? (
                <div className="space-y-3">
                  {day.activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      onEdit={() => handleEditActivity(activity)}
                      onDelete={() => handleDeleteActivity(activity.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed bg-muted/50">
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <p className="text-muted-foreground mb-2">No activities planned for this day</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setIsAddActivityOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Activity
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setIsAddActivityOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  {day.activities.length > 0 ? "Add Another Activity" : "Add Activity"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <ActivityMap activities={day.activities} destination={destination} />
            </TabsContent>

            <TabsContent value="weather" className="mt-0 lg:hidden">
              <WeatherForecast location={destination} date={day.date} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Edit Activity" : "Add New Activity"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                placeholder="Activity title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newActivity.description || ""}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Brief description of the activity"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newActivity.time || ""}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  placeholder="e.g. 9:00 AM - 11:00 AM"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newActivity.category || "other"}
                  onValueChange={(value) =>
                    setNewActivity({
                      ...newActivity,
                      category: value as "food" | "attraction" | "transport" | "accommodation" | "other"
                    })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="attraction">Attraction</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newActivity.location || ""}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                placeholder="Activity location"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={newActivity.cost || ""}
                onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                placeholder="e.g. $15 per person"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={newActivity.imageUrl || ""}
                onChange={(e) => setNewActivity({ ...newActivity, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddActivity}>
              {editingActivity ? "Save Changes" : "Add Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDescriptionOpen} onOpenChange={setIsEditDescriptionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Day Description</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={dayDescription}
              onChange={(e) => setDayDescription(e.target.value)}
              placeholder="Describe what this day is about..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveDescription}>Save Description</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDayOpen} onOpenChange={setIsDeleteDayOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Day</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this day from your itinerary?
              This action cannot be undone and all activities for this day will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeDay(day.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
