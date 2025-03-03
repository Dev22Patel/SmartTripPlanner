import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Save } from "lucide-react"
import ItineraryDay from "./itinerary-day"
import { useToast } from "@/components/ui/toast"
import { v4 as uuidv4 } from "uuid"

export interface Activity {
  id: string
  title: string
  time: string
  description: string
  location?: string
  cost?: string
  category?: "food" | "attraction" | "transport" | "accommodation" | "other"
}

export interface Day {
  id: string
  dayNumber: number
  date: string
  activities: Activity[]
}

interface ItineraryBuilderProps {
  isLoading: boolean
  destination: string
}

export default function ItineraryBuilder({ isLoading, destination }: ItineraryBuilderProps) {
  const { toast } = useToast()
  const [days, setDays] = useState<Day[]>([
    {
      id: uuidv4(),
      dayNumber: 1,
      date: new Date().toISOString().split("T")[0],
      activities: [],
    },
  ])

  const addDay = () => {
    const lastDay = days[days.length - 1]
    const newDate = new Date(lastDay.date)
    newDate.setDate(newDate.getDate() + 1)

    setDays([
      ...days,
      {
        id: uuidv4(),
        dayNumber: lastDay.dayNumber + 1,
        date: newDate.toISOString().split("T")[0],
        activities: [],
      },
    ])
  }

  const removeDay = (dayId: string) => {
    if (days.length === 1) {
      toast({
        title: "Cannot remove day",
        description: "Your itinerary must have at least one day.",
        variant: "destructive",
      })
      return
    }

    const newDays = days.filter((day) => day.id !== dayId)
    // Renumber days
    newDays.forEach((day, index) => {
      day.dayNumber = index + 1
    })

    setDays(newDays)
  }

  const updateDay = (updatedDay: Day) => {
    setDays(days.map((day) => (day.id === updatedDay.id ? updatedDay : day)))
  }

  const saveItinerary = () => {
    // In a real app, this would save to a database
    toast({
      title: "Itinerary saved",
      description: `Your ${destination} itinerary has been saved successfully.`,
    })

    // For demo purposes, save to localStorage
    localStorage.setItem(
      "itinerary",
      JSON.stringify({
        destination,
        days,
        lastUpdated: new Date().toISOString(),
      }),
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex justify-between items-center">
          <span>Your {destination} Itinerary</span>
          <Button onClick={saveItinerary} size="sm" className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </CardTitle>
        <CardDescription>Build your day-by-day plan for an unforgettable trip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {days.map((day) => (
          <ItineraryDay key={day.id} day={day} updateDay={updateDay} removeDay={removeDay} />
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={addDay} variant="outline" className="w-full flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Day
        </Button>
      </CardFooter>
    </Card>
  )
}
