"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Star, MapPin, Clock, DollarSign, ExternalLink } from "lucide-react"

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

export default function DestinationRecommendations({ isLoading, destination }: DestinationRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({
    attractions: [],
    restaurants: [],
    hotels: [],
    activities: [],
  })

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll generate mock data based on the destination
    const mockData = generateMockRecommendations(destination)
    setRecommendations(mockData)
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
  return (
    <Card className="overflow-hidden border-border/40 dark:border-border/40 bg-card/50 hover:shadow-md transition-shadow">
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

// Helper function to generate mock recommendations
function generateMockRecommendations(destination: string): Record<string, Recommendation[]> {
  // This would be replaced with actual API calls in a real application
  const baseImageUrl = "/placeholder.svg?height=300&width=400"

  // Generate different recommendations based on destination
  let attractions: Recommendation[] = []
  let restaurants: Recommendation[] = []
  let hotels: Recommendation[] = []
  let activities: Recommendation[] = []

  if (destination.toLowerCase().includes("paris")) {
    attractions = [
      {
        id: "a1",
        name: "Eiffel Tower",
        type: "attraction",
        rating: 4.7,
        image: `${baseImageUrl}&text=Eiffel+Tower`,
        description: "Iconic iron tower offering city views from observation decks.",
        location: "Champ de Mars, 5 Avenue Anatole France",
        price: "€17-€26",
        duration: "2-3 hours",
        tags: ["Landmark", "Views", "Historic"],
        url: "#",
      },
      {
        id: "a2",
        name: "Louvre Museum",
        type: "attraction",
        rating: 4.8,
        image: `${baseImageUrl}&text=Louvre+Museum`,
        description: "World's largest art museum housing the Mona Lisa and other masterpieces.",
        location: "Rue de Rivoli",
        price: "€15-€17",
        duration: "3-4 hours",
        tags: ["Art", "Museum", "Historic"],
        url: "#",
      },
      {
        id: "a3",
        name: "Notre-Dame Cathedral",
        type: "attraction",
        rating: 4.6,
        image: `${baseImageUrl}&text=Notre+Dame`,
        description: "Medieval Catholic cathedral with Gothic architecture and gargoyles.",
        location: "6 Parvis Notre-Dame",
        price: "Free (donations welcome)",
        duration: "1-2 hours",
        tags: ["Historic", "Architecture", "Religious"],
        url: "#",
      },
    ]

    restaurants = [
      {
        id: "r1",
        name: "Le Jules Verne",
        type: "restaurant",
        rating: 4.5,
        image: `${baseImageUrl}&text=Jules+Verne`,
        description: "Upscale dining with panoramic views from the Eiffel Tower's second level.",
        location: "Eiffel Tower, 2nd Floor",
        price: "€€€€",
        tags: ["Fine Dining", "French", "Scenic View"],
        url: "#",
      },
      {
        id: "r2",
        name: "Café de Flore",
        type: "restaurant",
        rating: 4.3,
        image: `${baseImageUrl}&text=Cafe+de+Flore`,
        description: "Historic café known for famous literary and philosophical patrons.",
        location: "172 Boulevard Saint-Germain",
        price: "€€€",
        tags: ["Café", "Historic", "French"],
        url: "#",
      },
      {
        id: "r3",
        name: "L'As du Fallafel",
        type: "restaurant",
        rating: 4.6,
        image: `${baseImageUrl}&text=Fallafel`,
        description: "Popular spot for falafel and Middle Eastern street food in Le Marais.",
        location: "34 Rue des Rosiers",
        price: "€",
        tags: ["Middle Eastern", "Street Food", "Casual"],
        url: "#",
      },
    ]

    hotels = [
      {
        id: "h1",
        name: "Hôtel Plaza Athénée",
        type: "hotel",
        rating: 4.9,
        image: `${baseImageUrl}&text=Plaza+Athenee`,
        description: "Luxury hotel with Eiffel Tower views and Dior Institute spa.",
        location: "25 Avenue Montaigne",
        price: "€€€€€",
        tags: ["Luxury", "Spa", "5-Star"],
        url: "#",
      },
      {
        id: "h2",
        name: "Hôtel des Arts Montmartre",
        type: "hotel",
        rating: 4.4,
        image: `${baseImageUrl}&text=Hotel+des+Arts`,
        description: "Charming boutique hotel in the artistic Montmartre district.",
        location: "5 Rue Tholozé",
        price: "€€€",
        tags: ["Boutique", "Artistic", "Local"],
        url: "#",
      },
      {
        id: "h3",
        name: "Generator Paris",
        type: "hotel",
        rating: 4.2,
        image: `${baseImageUrl}&text=Generator`,
        description: "Modern hostel with private rooms and social spaces for travelers.",
        location: "9-11 Place du Colonel Fabien",
        price: "€",
        tags: ["Budget", "Social", "Modern"],
        url: "#",
      },
    ]

    activities = [
      {
        id: "act1",
        name: "Seine River Cruise",
        type: "activity",
        rating: 4.6,
        image: `${baseImageUrl}&text=Seine+Cruise`,
        description: "Scenic boat tour along the Seine River passing major landmarks.",
        location: "Pont de l'Alma",
        price: "€15-€25",
        duration: "1 hour",
        tags: ["Cruise", "Scenic", "Relaxing"],
        url: "#",
      },
      {
        id: "act2",
        name: "Montmartre Walking Tour",
        type: "activity",
        rating: 4.7,
        image: `${baseImageUrl}&text=Montmartre`,
        description: "Guided tour of the bohemian Montmartre neighborhood and Sacré-Cœur.",
        location: "Place du Tertre",
        price: "€20-€30",
        duration: "2-3 hours",
        tags: ["Walking Tour", "Art", "Historic"],
        url: "#",
      },
      {
        id: "act3",
        name: "Cooking Class: French Pastries",
        type: "activity",
        rating: 4.8,
        image: `${baseImageUrl}&text=Cooking+Class`,
        description: "Learn to make authentic French pastries with a professional chef.",
        location: "Le Foodist, 59 Rue du Cardinal Lemoine",
        price: "€95-€120",
        duration: "3 hours",
        tags: ["Cooking", "Culinary", "Hands-on"],
        url: "#",
      },
    ]
  } else if (destination.toLowerCase().includes("tokyo")) {
    attractions = [
      {
        id: "a1",
        name: "Tokyo Skytree",
        type: "attraction",
        rating: 4.6,
        image: `${baseImageUrl}&text=Tokyo+Skytree`,
        description: "Tallest tower in Japan offering panoramic views of Tokyo.",
        location: "1 Chome-1-2 Oshiage, Sumida City",
        price: "¥1,800-¥3,100",
        duration: "1-2 hours",
        tags: ["Landmark", "Views", "Modern"],
        url: "#",
      },
      {
        id: "a2",
        name: "Senso-ji Temple",
        type: "attraction",
        rating: 4.7,
        image: `${baseImageUrl}&text=Sensoji`,
        description: "Ancient Buddhist temple with iconic red lantern and shopping street.",
        location: "2 Chome-3-1 Asakusa, Taito City",
        price: "Free",
        duration: "1-2 hours",
        tags: ["Temple", "Historic", "Cultural"],
        url: "#",
      },
    ]

    // Add more Tokyo recommendations...
  } else {
    // Generic recommendations for any destination
    attractions = [
      {
        id: "a1",
        name: `${destination} Museum of Art`,
        type: "attraction",
        rating: 4.5,
        image: `${baseImageUrl}&text=Art+Museum`,
        description: `The largest art collection in ${destination} featuring local and international works.`,
        location: `Downtown ${destination}`,
        price: "$15-$20",
        duration: "2-3 hours",
        tags: ["Art", "Museum", "Cultural"],
        url: "#",
      },
      {
        id: "a2",
        name: `${destination} Historical Center`,
        type: "attraction",
        rating: 4.6,
        image: `${baseImageUrl}&text=Historical+Center`,
        description: `Explore the rich history and heritage of ${destination}.`,
        location: `Old Town, ${destination}`,
        price: "$10",
        duration: "2 hours",
        tags: ["Historic", "Walking", "Educational"],
        url: "#",
      },
    ]

    restaurants = [
      {
        id: "r1",
        name: `${destination} Gourmet`,
        type: "restaurant",
        rating: 4.7,
        image: `${baseImageUrl}&text=Local+Cuisine`,
        description: `Fine dining featuring local specialties and international cuisine.`,
        location: `123 Main St, ${destination}`,
        price: "$$$",
        tags: ["Fine Dining", "Local Cuisine", "Upscale"],
        url: "#",
      },
      {
        id: "r2",
        name: "Café Central",
        type: "restaurant",
        rating: 4.4,
        image: `${baseImageUrl}&text=Cafe`,
        description: "Cozy café with great coffee, pastries and light meals.",
        location: `45 Park Ave, ${destination}`,
        price: "$$",
        tags: ["Café", "Casual", "Breakfast"],
        url: "#",
      },
    ]

    hotels = [
      {
        id: "h1",
        name: `Grand ${destination} Hotel`,
        type: "hotel",
        rating: 4.8,
        image: `${baseImageUrl}&text=Luxury+Hotel`,
        description: `Luxury accommodation in the heart of ${destination} with premium amenities.`,
        location: `Downtown ${destination}`,
        price: "$$$$",
        tags: ["Luxury", "Central", "Spa"],
        url: "#",
      },
      {
        id: "h2",
        name: `${destination} Boutique Inn`,
        type: "hotel",
        rating: 4.5,
        image: `${baseImageUrl}&text=Boutique+Hotel`,
        description: "Charming boutique hotel with personalized service and unique rooms.",
        location: `Historic District, ${destination}`,
        price: "$$$",
        tags: ["Boutique", "Charming", "Unique"],
        url: "#",
      },
    ]

    activities = [
      {
        id: "act1",
        name: `${destination} City Tour`,
        type: "activity",
        rating: 4.6,
        image: `${baseImageUrl}&text=City+Tour`,
        description: `Comprehensive guided tour of ${destination}'s main attractions.`,
        location: `Tourist Center, ${destination}`,
        price: "$25-$40",
        duration: "3 hours",
        tags: ["Tour", "Sightseeing", "Guided"],
        url: "#",
      },
      {
        id: "act2",
        name: "Local Cooking Class",
        type: "activity",
        rating: 4.7,
        image: `${baseImageUrl}&text=Cooking+Class`,
        description: `Learn to prepare traditional ${destination} dishes with local chefs.`,
        location: `Culinary School, ${destination}`,
        price: "$75",
        duration: "2-3 hours",
        tags: ["Cooking", "Cultural", "Hands-on"],
        url: "#",
      },
    ]
  }

  return {
    attractions,
    restaurants,
    hotels,
    activities,
  }
}

