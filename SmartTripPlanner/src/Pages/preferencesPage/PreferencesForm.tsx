import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setTravelPrediction } from "@/store/PredictionSlice" // Assuming you have this action creator
import { destinationTypes, budgetOptions, durationOptions, activities } from "./data"
import type { Preferences } from "./types"

interface PredictionResult {
  predicted_destination: string;
  confidence_score: number;
  alternative_destinations: Array<{
    destination: string;
    confidence: number;
  }>;
}

const PreferenceForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [preferences, setPreferences] = useState<Preferences>({
    destinationType: [],
    budget: "",
    duration: "",
    activities: [],
    locationType: "", //india or abroad
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleMultiSelect = (category: keyof Preferences, value: string): void => {
    setPreferences((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? (prev[category] as string[]).filter((item) => item !== value)
        : [...(prev[category] as string[]), value],
    }))
  }

  const handleSingleSelect = (category: keyof Preferences, value: string): void => {
    setPreferences((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const renderBentoGrid = (items: string[], category: keyof Preferences) => {
    const isMultiSelect = Array.isArray(preferences[category])
    const getIsSelected = (item: string) =>
      isMultiSelect ? (preferences[category] as string[]).includes(item) : preferences[category] === item

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Button
            key={item}
            variant={getIsSelected(item) ? "default" : "outline"}
            onClick={() => (isMultiSelect ? handleMultiSelect(category, item) : handleSingleSelect(category, item))}
            className={`h-16 w-full transition-all hover:scale-[1.02] hover:shadow-lg
              ${getIsSelected(item) ? "shadow-md" : ""}`}
          >
            <span className="text-sm">{item}</span>
            {getIsSelected(item) && <Check className="ml-2 h-4 w-4" />}
          </Button>
        ))}
      </div>
    )
  }

  const renderStep = (): JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Where would you like to travel?</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={preferences.locationType === "india" ? "default" : "outline"}
                onClick={() => handleSingleSelect("locationType", "india")}
                className={`h-24 w-full transition-all hover:scale-[1.02] hover:shadow-lg
                  ${preferences.locationType === "india" ? "shadow-md" : ""}`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">Explore India</span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">Discover beautiful destinations in India</span>
                </div>
                {preferences.locationType === "india" && <Check className="absolute top-3 right-3 h-5 w-5" />}
              </Button>
              <Button
                variant={preferences.locationType === "worldwide" ? "default" : "outline"}
                onClick={() => handleSingleSelect("locationType", "worldwide")}
                className={`h-24 w-full transition-all hover:scale-[1.02] hover:shadow-lg
                  ${preferences.locationType === "worldwide" ? "shadow-md" : ""}`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">Worldwide</span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">Explore international destinations</span>
                </div>
                {preferences.locationType === "worldwide" && <Check className="absolute top-3 right-3 h-5 w-5" />}
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Destination Types</h2>
            {renderBentoGrid(destinationTypes, "destinationType")}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Budget Range</h2>
            {renderBentoGrid(budgetOptions, "budget")}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Trip Duration</h2>
            {renderBentoGrid(durationOptions, "duration")}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Activities</h2>
            {renderBentoGrid(activities, "activities")}
          </div>
        )
      default:
        return null
    }
  }

  const handlePredictAndRedirect = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Determine which API endpoint to call based on location preference
      const endpoint = preferences.locationType === "india"
        ? 'http://localhost:8000/api/predict/india'
        : 'http://localhost:8000/api/predict/not-india'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Failed to get predictions')
      }

      const predictionData: PredictionResult = await response.json()

      // Store prediction result in Redux
      dispatch(setTravelPrediction(predictionData))

      // Navigate to dashboard
      navigate("/landing-page")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Shape Your Perfect Journey</h1>
        <p className="text-lg text-gray-600 dark:text-white/80 max-w-2xl">
          Tell us what inspires you, and we'll craft travel experiences that match your unique style
        </p>
      </div>

      <Card className="w-full max-w-5xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-1/5 h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep ? "bg-blue-500 scale-110" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 text-center mt-2">Step {currentStep} of 5</div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={currentStep === 1 && !preferences.locationType}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePredictAndRedirect}
                disabled={isLoading}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                {isLoading ? 'Processing...' : 'Go to Dashboard'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreferenceForm
