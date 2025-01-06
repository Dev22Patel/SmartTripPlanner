import { Skull, Coffee, Sparkles } from 'lucide-react';

export default function UniqueFooter() {
  return (
    <>
    <hr/>
    <footer className=" bg-stone-50 dark:bg-zinc-950/90 text-white py-8 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Skull className="w-6 h-6 text-black dark:text-white" />
            <h2 className="text-2xl font-bold dark:text-white text-black">Dev Creations from <span className='text-blue-500'>બીલીમોરા</span></h2>
            <Coffee className="w-6 h-6 text-black dark:text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Crafting digital nightmares and coding fever dreams since the last full moon.
          </p>
          <div className="flex items-center space-x-2 mt-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <p className="text-sm italic text-gray-500">
              "Behold, another masterpiece birthed from the depths of my caffeinated delirium!"
            </p>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
    </footer>
    </>
  );
}
