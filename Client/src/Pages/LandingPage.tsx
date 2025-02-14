import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plane, Map, Calendar, Hotel, Utensils, CreditCard, Search } from 'lucide-react'
import RetroProjectBoard from '@/components/ui/smaple';
import RetroDiagram from '@/components/ui/TripDiagram';

export default function Dashboard() {
  const [destination, setDestination] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-bl dark:from-zinc-900 dark:via-zinc-950 dark:to-black text-gray-900 dark:text-gray-100 overflow-hidden">
      <main className="z-10 container mx-auto px-20 py-20 mb-20">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          {...fadeIn}
        >
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-500 font-mono">
            Welcome to Your Smart Trip Planner!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-mono">
            Plan your perfect journey with our intelligent travel companion
          </p>
        </motion.div>

        <hr></hr>
        <div className='mt-10'>
        <h1 className='text-6xl font-extrabold text-center font-mono'>WHERE TO?</h1>
        </div>
        <motion.div
          className="max-w-3xl mx-auto mb-16 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Where do you want to go?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-grow py-6 px-6 text-lg text-gray-900 dark:text-white rounded-full focus:ring-2 focus:ring-violet-500 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            />
            <Button
              className="sm:flex-shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 px-8 py-6 text-base font-medium text-white transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
              onClick={() => console.log('Planning trip to', destination)}
            >
            <Search className="w-5 h-5 mr-2" />
              Plan Trip
            </Button>
          </div>
        </motion.div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {[
            { icon: Plane, title: 'Flight Booking', description: 'Find and book the best flights for your journey.' },
            { icon: Hotel, title: 'Accommodation', description: 'Discover perfect places to stay during your trip.' },
            { icon: Map, title: 'Itinerary Planning', description: 'Create personalized day-by-day travel plans.' },
            { icon: Calendar, title: 'Scheduling', description: 'Optimize your daily activities for the best experience.' },
            { icon: Utensils, title: 'Dining', description: 'Explore local cuisines and restaurant reservations.' },
            { icon: CreditCard, title: 'Budget Tracking', description: 'Keep your travel expenses in check. ok bie bie ' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
            >
              <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group font-mono">
                <CardHeader>
                  <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-3 rounded-xl w-fit group-hover:from-violet-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className='mt-32'>
        <RetroProjectBoard />
        </div>
        <div className='mt-20'>
        <RetroDiagram />
        </div>
      </main>
    </div>
  );
}
