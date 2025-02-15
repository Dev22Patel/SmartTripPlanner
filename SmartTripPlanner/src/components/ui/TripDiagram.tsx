export default function RetroDiagram() {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <svg viewBox="0 0 800 600" className="w-full h-auto" style={{ fontFamily: "monospace" }}>
          {/* Background Grid */}
          <defs>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <mask id="fadeMask">
              <rect width="800" height="600" fill="url(#fadeGradient)" />
            </mask>
            <pattern id="perspective-grid" width="800" height="600" patternUnits="userSpaceOnUse">
              {Array.from({ length: 15 }, (_, i) => (
                <path
                  key={`h${i}`}
                  d={`M 0 ${40 + i * 40} L 800 ${40 + i * 40}`}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 21 }, (_, i) => (
                <path
                  key={`p${i}`}
                  d={`M ${i * 40} 0 L ${400 + i * 20} 600`}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              ))}
            </pattern>
          </defs>

          {/* Background */}
          <rect width="800" height="600" fill="url(#perspective-grid)" mask="url(#fadeMask)" />

          {/* User Interface Window */}
          <g transform="translate(100,100)">
            <rect
              width="250"
              height="150"
              className="dark:fill-gray-800 fill-white"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="0"
              y="0"
              width="250"
              height="25"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="2"
            />
            <text x="10" y="17" fontSize="16" fill="currentColor">
              User Dashboard 🌍
            </text>

            {/* Preference Input */}
            <rect
              x="20"
              y="40"
              width="110"
              height="40"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text x="25" y="65" fontSize="10" fill="currentColor">
              Travel Preferences
            </text>

            {/* Budget Setting */}
            <rect
              x="140"
              y="40"
              width="100"
              height="40"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text x="150" y="65" fontSize="10" fill="currentColor">
              Budget Settings
            </text>

            {/* Date Selection */}
            <rect
              x="20"
              y="90"
              width="210"
              height="40"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text x="30" y="115" fontSize="10" fill="currentColor">
              Trip Duration & Dates
            </text>
          </g>

          {/* AI Travel Agent Window */}
          <g transform="translate(450,100)">
            <rect
              width="250"
              height="150"
              className="dark:fill-gray-800 fill-white"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="0"
              y="0"
              width="250"
              height="25"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="2"
            />
            <text x="10" y="17" fontSize="16" fill="currentColor">
              AI Travel Agent 🤖
            </text>

            {/* Chat Interface */}
            <rect
              x="20"
              y="40"
              width="210"
              height="90"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text x="30" y="60" fontSize="14" fill="currentColor">
              Interactive Chat
            </text>
            <text x="30" y="80" fontSize="12" fill="currentColor">
              • Personalized Recommendations
            </text>
            <text x="30" y="95" fontSize="12" fill="currentColor">
              • Real-time Trip Advice
            </text>
            <text x="30" y="110" fontSize="12" fill="currentColor">
              • Local Insights & Tips
            </text>
          </g>

          {/* Trip Planning Engine */}
          <g transform="translate(200,300)">
            <rect
              width="400"
              height="200"
              className="dark:fill-gray-800 fill-white"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="0"
              y="0"
              width="400"
              height="25"
              className="dark:fill-gray-700 fill-gray-100"
              stroke="currentColor"
              strokeWidth="2"
            />
            <text x="10" y="17" fontSize="12" fill="currentColor">
              Smart Trip Planner Engine ✈️
            </text>

            {/* Itinerary Builder */}
            <g transform="translate(35,50)">
              <rect
                width="180"
                height="120"
                className="dark:fill-gray-700 fill-gray-100"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text x="10" y="20" fontSize="16" fill="currentColor">
                Itinerary Builder
              </text>
              {Array.from({ length: 4 }, (_, i) => (
                <g key={i}>
                  <rect
                    x="10"
                    y={40 + i * 20}
                    width="100"
                    height="15"
                    className="dark:fill-gray-600 fill-white"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <text x="15" y={52 + i * 20} fontSize="8" fill="currentColor">
                    Day {i + 1} Activities
                  </text>
                </g>
              ))}
            </g>

            {/* Smart Recommendations */}
            <g transform="translate(225,50)">
              <rect
                width="150"
                height="120"
                className="dark:fill-gray-700 fill-gray-100"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text x="10" y="20" fontSize="14" fill="currentColor">
                Smart Suggestions
              </text>
              <text x="10" y="40" fontSize="10" fill="currentColor">
                • Attractions
              </text>
              <text x="10" y="60" fontSize="10" fill="currentColor">
                • Accommodations
              </text>
              <text x="10" y="80" fontSize="10" fill="currentColor">
                • Restaurants
              </text>
              <text x="10" y="100" fontSize="10" fill="currentColor">
                • Local Events
              </text>
            </g>
          </g>

          {/* Connection Lines */}
          <path d="M 350 160 L 450 160" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
          <path d="M 275 250 L 350 300" stroke  ="currentColor" strokeWidth="1" strokeDasharray="4" />
          <text x="365" y="270" fontSize="14" fill="currentColor">
            Data Flow
          </text>
        </svg>
      </div>
    )
  }
