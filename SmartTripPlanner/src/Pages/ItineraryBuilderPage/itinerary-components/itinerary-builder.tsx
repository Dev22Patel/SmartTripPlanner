import { useEffect, useState, useCallback, useMemo } from "react"
import { AppDispatch } from "@/store/index"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/index"
import {
  fetchItinerary,
  updatePreferences,
  setDestination,
  saveItineraryToDb,
} from "@/store/itinerarySlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, Calendar, Loader2 } from 'lucide-react'
import ItineraryDay from "./itinerary-day"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"

export interface Activity {
    id: string
    title: string
    time?: string
    description?: string
    location?: string
    cost?: string
    category?: "food" | "attraction" | "transport" | "accommodation" | "other" | "entertainment" | "shopping"
    imageUrl?: string
}

export interface Day {
  id: string
  dayNumber: number
  date: string
  description?: string
  activities: Activity[]
}

export default function ItineraryBuilder({ isLoading = false, destination = "Unknown Destination" }) {
  const { toast } = useToast()
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  // Get itinerary state from Redux
  const { itinerary, loading, error, preferences, saveLoading } = useSelector((state: RootState) => state.itinerary)
  const [days, setDays] = useState<Day[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [activeTab, setActiveTab] = useState("0")

  // Only run once when destination changes or on initial load
  useEffect(() => {
    dispatch(setDestination(destination))
    // Only fetch if we don't already have data
    if (isInitialLoad) {
      dispatch(fetchItinerary({ destination, preferences }))
    }
  }, [dispatch, destination, isInitialLoad, preferences])

  // Process itinerary data only when it changes
  useEffect(() => {
    if (itinerary.length > 0) {
      const processedDays = itinerary.map((day) => ({
        id: uuidv4(),
        dayNumber: day.day,
        date: (() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + (day.day - 1));
          return startDate.toISOString().split("T")[0];
        })(),
        description: day.description || "",
        activities: day.activities.map((activity) => ({
          id: uuidv4(),
          title: activity.title,
          description: activity.description,
          location: activity.location || "",
          time: activity.time || "",
          cost: activity.cost || "",
          category: activity.category as "food" | "attraction" | "transport" | "accommodation" | "other" || "other",
          imageUrl: activity.imageUrl || `/placeholder.svg?height=200&width=300`,
        })),
      }));

      setDays(processedDays);
      setIsInitialLoad(false);
    }
  }, [itinerary]);

  // Memoize handlers to prevent recreation on each render
  const addDay = useCallback(() => {
    setDays(prevDays => {
      if (prevDays.length === 0) {
        // If no days exist, create the first day with current date
        return [{
          id: uuidv4(),
          dayNumber: 1,
          date: new Date().toISOString().split("T")[0],
          activities: [],
        }];
      }

      const lastDay = prevDays[prevDays.length - 1];
      // Create a new date object from the last day's date
      const newDate = new Date(lastDay.date);
      // Increment by one day
      newDate.setDate(newDate.getDate() + 1);

      const newDay = {
        id: uuidv4(),
        dayNumber: lastDay.dayNumber + 1,
        date: newDate.toISOString().split("T")[0],
        activities: [],
      };

      // Set the active tab to the new day (outside this callback to avoid dependency loop)
      setTimeout(() => setActiveTab(String(prevDays.length)), 0);

      return [...prevDays, newDay];
    });
  }, []);

  const removeDay = useCallback((dayId: string) => {
    setDays(prevDays => {
      if (prevDays.length === 1) {
        toast({
          title: "Cannot remove day",
          description: "Your itinerary must have at least one day.",
          variant: "destructive",
        });
        return prevDays;
      }

      const dayIndex = prevDays.findIndex(day => day.id === dayId);
      const newDays = prevDays.filter((day) => day.id !== dayId);

      // Renumber days
      newDays.forEach((day, index) => {
        day.dayNumber = index + 1;
      });

      // Update active tab if needed
      if (activeTab === String(dayIndex)) {
        setTimeout(() => {
          setActiveTab(String(Math.min(dayIndex, newDays.length - 1)));
        }, 0);
      }

      return newDays;
    });
  }, [activeTab, toast]);

  const updateDay = useCallback((updatedDay: Day) => {
    setDays(prevDays =>
      prevDays.map((day) => (day.id === updatedDay.id ? updatedDay : day))
    );
  }, []);

  const saveItinerary = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }

    // Update local preferences
    dispatch(updatePreferences({ days: days.length }));

    try {
      // Save to database
      await dispatch(saveItineraryToDb({
        destination,
        days: days.map(day => ({
          dayNumber: day.dayNumber,
          date: day.date,
          description: day.description || "",
          activities: day.activities.map(activity => ({
            title: activity.title,
            time: activity.time || "",
            description: activity.description || "",
            location: activity.location || "",
            cost: activity.cost || "",
            category: activity.category || "other",
            imageUrl: activity.imageUrl || ""
          }))
        }))
      })).unwrap();

      toast({
        title: "Itinerary saved",
        description: `Your ${destination} itinerary has been saved successfully.`,
      });

      navigate('/profile');
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was a problem saving your itinerary. Please try again.",
        variant: "destructive",
      });
    }
  }, [days, destination, dispatch, navigate, toast]);

  // Memoize loading state to prevent unnecessary rerenders
  const isLoadingState = useMemo(() =>
    isInitialLoad || loading || isLoading,
    [isInitialLoad, loading, isLoading]
  );

  // Loading state
  if (isLoadingState) {
    return (
      <Card className="shadow-md border-border/40 dark:border-border/40 bg-card/50">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 mb-6">
            <Loader2 className="animate-spin w-full h-full text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Creating Your Dream Itinerary</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Our AI is crafting a personalized trip to {destination} based on your preferences...
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-md border-border/40 dark:border-border/40 bg-card/50">
        <CardContent className="pt-6">
          <div className="text-center p-6">
            <p className="text-destructive text-lg">Error: {error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => dispatch(fetchItinerary({ destination, preferences }))}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render main component
  return (
    <Card className="shadow-md border-border/40 dark:border-border/40 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">
              Your {destination} Itinerary
            </CardTitle>
            <CardDescription>Build your day-by-day plan for an unforgettable trip</CardDescription>
          </div>
          <Button
            onClick={saveItinerary}
            size="sm"
            className="flex items-center gap-1"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {days.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 border-b overflow-x-auto scrollbar-hide">
              <TabsList className="h-12 w-full justify-start bg-transparent p-0 mb-0">
                {days.map((day, index) => (
                  <TabsTrigger
                    key={day.id}
                    value={String(index)}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent px-4 py-2"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">Day {day.dayNumber}</span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {days.map((day, index) => (
              <TabsContent key={day.id} value={String(index)} className="pt-4 px-6 focus-visible:outline-none focus-visible:ring-0">
                <ItineraryDay
                  day={day}
                  updateDay={updateDay}
                  removeDay={removeDay}
                  destination={destination}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center p-10">
            <p className="text-muted-foreground mb-4">No days in your itinerary yet. Add your first day to get started!</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 pb-6 px-6">
        <Button
          onClick={addDay}
          variant="outline"
          className="w-full flex items-center gap-1 border-dashed"
        >
          <Plus className="h-4 w-4" />
          {days.length === 0 ? "Start Your Itinerary" : "Add Day"}
        </Button>
      </CardFooter>
    </Card>
  );
}
