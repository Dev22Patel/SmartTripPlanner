import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import ActivityItem from "./activity-item";
import AddActivityDialog from "./add-activity-dialog";

// Define TypeScript types
interface Activity {
  id: string;
  name: string;
  title: string;
  time: string;
  description?: string;
}

interface ItineraryDayProps {
  day: {
    id: string;
    dayNumber: number;
    date: string;
    activities: Activity[];
  };
  updateItineraryDay: (day: ItineraryDayProps["day"]) => void;
  removeItineraryDay: (id: string) => void;
}

export default function ItineraryDay({ day, updateDay, removeDay }: ItineraryDayProps) {
  const dispatch = useDispatch();
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      dispatch(updateDay({
        ...day,
        date: date.toISOString().split("T")[0],
      }));
    }
  };

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activity,
      id: uuidv4(),
      time: activity.time || "00:00", // Default time if missing
    };

    dispatch(updateDay({
      ...day,
      activities: [...day.activities, newActivity],
    }));
  };


  const handleUpdateActivity = (updatedActivity: Activity) => {
    dispatch(updateDay({
      ...day,
      activities: day.activities.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      ),
    }));
    setEditingActivity(null);
  };

  const handleRemoveActivity = (activityId: string) => {
    dispatch(updateDay({
      ...day,
      activities: day.activities.filter((activity) => activity.id !== activityId),
    }));
  };

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
            onClick={() => dispatch(removeDay(day.id))}
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
            .sort((a, b) => (a.time && b.time ? a.time.localeCompare(b.time) : 0)) // Ensuring time exists
            .map((activity) => (
                <ActivityItem
                key={activity.id}
                activity={activity}
                onEdit={() => {
                    setEditingActivity(activity);
                    setIsAddActivityOpen(true);
                }}
                onDelete={() => handleRemoveActivity(activity.id)}
                />
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 border-dashed"
          onClick={() => {
            setEditingActivity(null);
            setIsAddActivityOpen(true);
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
        onUpdate={handleUpdateActivity}
        activity={editingActivity}
      />
    </Card>
  );
}
