export default function FooterGridBackground() {
    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="bg-gray-50 dark:bg-zinc-950" // Light gray in light mode, very dark in dark mode
      >
        <defs>
          <linearGradient id="fadeGradient" x1="100%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="text-black dark:text-white" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" className="text-black dark:text-white" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1200" height="300" fill="url(#fadeGradient)" />

        {/* Vertical lines */}
        {Array.from({ length: 13 }, (_, i) => (
          <path
            key={`v${i}`}
            d={`M ${i * 100} 300 L ${600 + (i - 6) * 200} 0`}
            className="text-black dark:text-white"
            stroke="currentColor"
            strokeOpacity="0.1" // Reduced opacity for better contrast
            strokeWidth="1"
            fill="none"
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={`h${i}`}
            d={`M 0 ${50 + i * 50} L 1200 ${50 + i * 50}`}
            className="text-black dark:text-white"
            stroke="currentColor"
            strokeOpacity="0.1" // Reduced opacity for better contrast
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>
    );
  }
