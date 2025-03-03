
import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Activity } from "./itinerary-builder"

interface AddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (activity: Omit<Activity, "id">) => void
  onUpdate: (activity: Activity) => void
  activity: Activity | null
}

export default function AddActivityDialog({ open, onOpenChange, onAdd, onUpdate, activity }: AddActivityDialogProps) {
  const [formData, setFormData] = useState<Omit<Activity, "id">>({
    title: "",
    time: "",
    description: "",
    location: "",
    cost: "",
    category: "other",
  })

  useEffect(() => {
    if (activity) {
      setFormData(activity)
    } else {
      setFormData({
        title: "",
        time: "",
        description: "",
        location: "",
        cost: "",
        category: "other",
      })
    }
  }, [activity])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.time) {
      return
    }

    if (activity) {
      onUpdate({ ...formData, id: activity.id } as Activity)
    } else {
      onAdd(formData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Activity Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Visit Eiffel Tower"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the activity"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="e.g., 5 Avenue Anatole France"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                name="cost"
                value={formData.cost || ""}
                onChange={handleChange}
                placeholder="e.g., $25 per person"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || "other"}
              onValueChange={(value) => handleSelectChange(value, "category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="attraction">Attraction & Sightseeing</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{activity ? "Update Activity" : "Add Activity"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
