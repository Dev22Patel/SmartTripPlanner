import ColourfulText from "../ui/colourful-text";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <>
      <hr />
      <footer className="bg-white/80 dark:bg-zinc-950/90 py-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-4 mb-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                {/* <Skull className="w-6 h-6 text-black dark:text-white" /> */}
                <motion.div
        className="h-full w-full object-cover absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_80%)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      />
      <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-center text-white relative z-2 font-mono">
        <ColourfulText text="Smart Trip Planner" /> <br />
      </h1>
                {/* <Coffee className="w-6 h-6 text-black dark:text-white" /> */}
              </div>
              {/* <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mx-auto">
                Crafting digital nightmares and coding fever dreams since the last full moon.
              </p> */}
            </div>

            {/* Navigation Columns */}
            <div className="space-y-4">
              <h3 className="font-semibold text-black dark:text-white">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Careers</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-black dark:text-white">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Documentation</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Learn</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Showcase</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-black dark:text-white">Social</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">GitHub</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Twitter</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Discord</a></li>
              </ul>
            </div>

            {/* Newsletter Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-black dark:text-white">Stay Updated</h3>
              <div className="max-w-sm">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Copyright */}
          <div className="text-center text-sm text-gray-500 mt-12">
            <p>© {new Date().getFullYear()} Dev Creations. All rights reserved.</p>
          </div>
        </div>

        {/* Gradient Line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
      </footer>
    </>
  );
}
