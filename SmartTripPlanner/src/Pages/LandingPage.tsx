import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plane, Map, Calendar, Hotel, Utensils, CreditCard, Search } from 'lucide-react'
import RetroProjectBoard from '@/components/ui/smaple';
import RetroDiagram from '@/components/ui/TripDiagram';
import BentoGrid from '@/components/ui/BentoGrid';
import ColourfulText from '@/components/ui/colourful-text';
import { Spotlight } from '@/components/ui/spotlight-new';
import SearchInput from '@/features/searchFunctionality/searchBar';
import SearchBar from '@/features/searchFunctionality/searchBar';

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
        <Spotlight />
      <main className="z-10 container mx-auto px-20 py-20 mb-20">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          {...fadeIn}
        >
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-zinc-700 dark:text-white/90 font-mono">
            Welcome to Your <ColourfulText text="Smart" /> Trip Planner!
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
          className="max-w-3xl mx-auto mb-20 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
            <SearchBar />
        </motion.div>


        <BentoGrid />
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
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
        </div> */}
        <div className='mt-32'>
        <RetroProjectBoard />
        </div>
        <div className='    -mb-32'>
        <h2 className='mt-20 -mb-20 text-center font-mono text-4xl font-bold'>How We Deliver</h2>
        <RetroDiagram />
        </div>
      </main>
    </div>
  );
}
