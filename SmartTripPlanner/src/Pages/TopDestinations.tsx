import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Users, TrendingUp } from "lucide-react";

// Import local destinations
import destinationsData from "@/data/destinations.json";

interface Destination {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  category: string;
  popularity: number;
}

export default function TopDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("popular");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinations(activeCategory);
  }, [activeCategory]);

  const fetchDestinations = (category: string) => {
    setLoading(true);
    try {
      const filteredDestinations = destinationsData.filter(
        (destination) => destination.category === category
      );
      setDestinations(filteredDestinations);
    } catch (error) {
      console.error("Error loading destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Amazing Destinations</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Explore the world's most fascinating places, from hidden gems to popular attractions.
        </p>
      </div>

      <Tabs defaultValue="popular" className="w-full" onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          {/* <TabsTrigger value="nearby">Nearby</TabsTrigger> */}
          <TabsTrigger value="recommended">For You</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            destinations.length > 0 ? (
              destinations.map((destination) => (
              <Card 
                key={destination.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/50 text-white px-2 py-1 rounded-full text-sm flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {destination.rating}
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {destination.name}
                    {destination.popularity > 80 && (
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {destination.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {destination.description}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {destination.reviews.toLocaleString()} reviews
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/destination/${destination.name}`)}
                  >
                    Plan Trip
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <img
                src="https://images.unsplash.com/photo-1614332287897-cdc485fa562d"
                alt="Coming Soon"
                className="h-64 mb-6"
              />
              <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
              <p className="text-muted-foreground">We're working hard to bring you more exciting destinations!</p>
            </div>
          )
          )}
        </div>
      </Tabs>
    </div>
  );
}
