import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { menuItems } from "@/components/layout/menuItems";

export default function Products() {
  const navigate = useNavigate();
  // Combine services and products arrays
  const allProducts = [...menuItems.services, ...menuItems.products];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Travel Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProducts.map((product, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(product.href)}
          >
            <CardHeader>
              <img 
                src={product.image || `/images/${product.title.toLowerCase().replace(' ', '-')}.jpg`} 
                alt={product.title} 
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800';
                }}
              />
              <CardTitle className="mt-4">{product.title}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add any additional content here */}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(product.href);
                }}
              >
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}