
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Star, MapPin, Clock, DollarSign, ExternalLink } from "lucide-react"
import { DragEvent } from "react"

interface Recommendation {
  id: string
  name: string
  type: "attraction" | "restaurant" | "hotel" | "activity"
  rating: number
  image: string
  description: string
  location: string
  price: string
  duration?: string
  tags: string[]
  url: string
}

interface DestinationRecommendationsProps {
  isLoading: boolean
  destination: string
}

export default function DestinationRecommendations({ isLoading: initialLoading, destination }: DestinationRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({
    attractions: [],
    restaurants: [],
    hotels: [],
    activities: [],
  })
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!destination) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`http://localhost:5000/api/recommendations?destination=${encodeURIComponent(destination)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setRecommendations(data)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch recommendations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [destination])

  if (isLoading) {
    return (
      <Card className="border-border/40 dark:border-border/40 bg-card/50">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-24 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/40 dark:border-border/40 bg-card/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Recommendations</CardTitle>
          <CardDescription>Unable to load recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-muted-foreground">
            <p>Sorry, we couldn't load recommendations for {destination}.</p>
            <p className="mt-2 text-sm">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40 dark:border-border/40 bg-card/50 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-2xl">Recommendations</CardTitle>
        <CardDescription>Popular places to visit in {destination}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="attractions" className="w-full">
          <TabsList className="w-full grid grid-cols-4 rounded-none bg-muted/50 dark:bg-muted/20">
            <TabsTrigger value="attractions">Attractions</TabsTrigger>
            <TabsTrigger value="restaurants">Dining</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          {Object.entries(recommendations).map(([category, items]) => (
            <TabsContent key={category} value={category} className="p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground/80">
                  No recommendations available for {destination}.
                </div>
              ) : (
                items.map((item) => <RecommendationCard key={item.id} item={item} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function RecommendationCard({ item }: { item: Recommendation }) {
    // Make the card draggable
    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
      // Set the data that will be transferred
      e.dataTransfer.setData("application/json", JSON.stringify(item))
      e.dataTransfer.effectAllowed = "copy"
    }

    return (
      <Card
        className="overflow-hidden border-border/40 dark:border-border/40 bg-card/50 hover:shadow-md transition-shadow cursor-grab"
        draggable={true}
        onDragStart={handleDragStart}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="h-32 sm:w-32 sm:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />

          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex items-center mt-1 text-sm">
                  <div className="flex items-center text-amber-500 dark:text-amber-400">
                    <Star className="fill-current h-3.5 w-3.5" />
                    <span className="ml-1">{item.rating.toFixed(1)}</span>
                  </div>
                  <span className="mx-2 text-muted-foreground dark:text-muted-foreground/80">•</span>
                  <span className="text-muted-foreground dark:text-muted-foreground/80">{item.type}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-2 line-clamp-2">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground dark:text-muted-foreground/80">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {item.location}
              </div>

              <div className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {item.price}
              </div>

              {item.duration && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.duration}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 dark:bg-muted/20">
                  {tag}
                </Badge>
              ))}
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 flex items-center mt-2 hover:underline"
            >
              View details
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </Card>
    )
  }
