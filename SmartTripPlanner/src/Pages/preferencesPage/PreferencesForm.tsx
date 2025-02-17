import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
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
  })
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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

  const renderResults = () => {
    if (!prediction) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-6">Your Recommended Destinations</h2>

        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Top Recommendation</h3>
            <p className="text-2xl font-bold text-blue-600">{prediction.predicted_destination}</p>
            <p className="text-sm text-gray-600">
              Confidence: {(prediction.confidence_score * 100).toFixed(1)}%
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Alternative Destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction.alternative_destinations.map((alt, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <p className="font-medium">{alt.destination}</p>
                  <p className="text-sm text-gray-600">
                    Confidence: {(alt.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = (): JSX.Element | null => {
    if (currentStep === 5) {
      return renderResults();
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Destination Types</h2>
            {renderBentoGrid(destinationTypes, "destinationType")}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Budget Range</h2>
            {renderBentoGrid(budgetOptions, "budget")}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Select Trip Duration</h2>
            {renderBentoGrid(durationOptions, "duration")}
          </div>
        )

      case 4:
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

  const navigate = useNavigate()

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Failed to get predictions')
      }

      const data = await response.json()
      setPrediction(data)
      setCurrentStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
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
            {currentStep > 1 && currentStep < 5 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                {isLoading ? 'Processing...' : 'Get Recommendations'}
                {!isLoading && <Check className="ml-2 h-4 w-4" />}
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/landing-page")}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreferenceForm
