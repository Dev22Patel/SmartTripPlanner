export const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-spin border-t-blue-500"></div>
        <div className="w-16 h-16 border-4 border-transparent rounded-full animate-pulse absolute inset-0"></div>
      </div>
    </div>
  );
