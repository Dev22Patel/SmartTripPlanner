import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { AppDispatch } from "@/store/index"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/index"
import { fetchItinerary, updatePreferences, setDestination } from "@/store/itinerarySlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save } from "lucide-react"
import ItineraryDay from "./itinerary-day"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/toast"

export interface Activity {
  id: string
  title: string
  time?: string
  description?: string
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

export default function ItineraryBuilder() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const destination = queryParams.get('destination') || 'Unknown Destination'
  const toast = useToast();
  const dispatch: AppDispatch = useDispatch()

  // Get itinerary state from Redux
  const { itinerary, loading, error, preferences } = useSelector((state: RootState) => state.itinerary)
  const [days, setDays] = useState<Day[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    dispatch(setDestination(destination))
    dispatch(fetchItinerary({ destination, preferences }))
  }, [dispatch, destination, preferences])

  useEffect(() => {
    if (itinerary.length > 0) {
      setDays(
        itinerary.map((day) => ({
          id: uuidv4(),
          dayNumber: day.day,
          date: new Date().toISOString().split("T")[0],
          activities: day.activities.map((activity) => ({
            id: uuidv4(),
            title: activity.title,
            description: activity.description,
            location: "",
            cost: "",
            category: "other",
          })),
        }))
      )
      setIsInitialLoad(false)
    }
  }, [itinerary])

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
      toast({ title: "Cannot remove day", description: "Your itinerary must have at least one day.", variant: "destructive" })
      return
    }
    const newDays = days.filter((day) => day.id !== dayId)
    newDays.forEach((day, index) => (day.dayNumber = index + 1))
    setDays(newDays)
  }

  const updateDay = (updatedDay: Day) => {
    setDays(days.map((day) => (day.id === updatedDay.id ? updatedDay : day)))
  }

  const saveItinerary = () => {
    dispatch(updatePreferences({ days: days.length }))
    toast({ title: "Itinerary saved", description: `Your ${destination} itinerary has been saved successfully.` })
  }

  if (isInitialLoad || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 mb-6">
            <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Creating Your Dream Itinerary</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Our AI is crafting a personalized trip to {destination} based on your preferences...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
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
