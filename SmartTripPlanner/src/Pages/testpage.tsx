"use client"

export default function SmartTripPlannerDiagram() {
  return (
    <div className="w-full overflow-auto bg-white p-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="w-full">
        {/* Title */}
        <text x="600" y="50" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" textAnchor="middle">
          Smart Trip Planner Architecture & Workflow
        </text>

        {/* FRONTEND Container */}
        <rect x="450" y="100" width="300" height="250" rx="10" ry="10" fill="#fff" stroke="#e67e22" strokeWidth="2" />
        <g>
          <rect x="450" y="88" width="100" height="24" rx="4" ry="4" fill="#fff" />
          <text x="460" y="105" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold">
            🖥️ FRONTEND
          </text>
        </g>

        {/* Navigation */}
        <circle cx="520" cy="170" r="25" fill="#fff" stroke="#444" strokeWidth="2" />
        <path d="M505 155 L535 155 L520 185 Z" fill="none" stroke="#444" strokeWidth="2" />
        <text x="520" y="205" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Navigation
        </text>

        {/* Redux/Context API */}
        <circle cx="680" cy="170" r="25" fill="#fff" stroke="#444" strokeWidth="2" />
        <path d="M670 160 L690 160 L690 180 L670 180 Z" fill="none" stroke="#444" strokeWidth="2" />
        <text x="680" y="205" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Redux/
        </text>
        <text x="680" y="220" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Context API
        </text>

        {/* User Interface */}
        <circle cx="600" cy="280" r="25" fill="#fff" stroke="#444" strokeWidth="2" />
        <rect x="585" y="265" width="30" height="30" fill="none" stroke="#444" strokeWidth="2" />
        <text x="600" y="315" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          User
        </text>
        <text x="600" y="330" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Interface
        </text>

        {/* BACKEND Container - Node.js */}
        <rect x="850" y="100" width="200" height="150" rx="10" ry="10" fill="#fff" stroke="#e67e22" strokeWidth="2" />
        <g>
          <rect x="850" y="88" width="100" height="24" rx="4" ry="4" fill="#fff" />
          <text x="860" y="105" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold">
            🖥️ BACKEND
          </text>
        </g>

        {/* API Server */}
        <rect x="900" y="140" width="100" height="80" rx="5" ry="5" fill="#fff" stroke="#3498db" strokeWidth="2" />
        <text
          x="950"
          y="180"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          fill="#3498db"
        >
          JS
        </text>
        <text x="950" y="235" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          API Server
        </text>

        {/* ML BACKEND Container */}
        <rect x="850" y="300" width="200" height="150" rx="10" ry="10" fill="#fff" stroke="#e67e22" strokeWidth="2" />
        <g>
          <rect x="850" y="288" width="120" height="24" rx="4" ry="4" fill="#fff" />
          <text x="860" y="305" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold">
            🐍 ML BACKEND
          </text>
        </g>

        {/* ML Engine */}
        <rect x="900" y="340" width="100" height="80" rx="5" ry="5" fill="#fff" stroke="#2ecc71" strokeWidth="2" />
        <text
          x="950"
          y="380"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          fill="#2ecc71"
        >
          🐍
        </text>
        <text x="950" y="435" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          ML
        </text>
        <text x="950" y="450" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Recommendation
        </text>
        <text x="950" y="465" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Engine
        </text>

        {/* MongoDB */}
        <rect x="1100" y="140" width="40" height="60" rx="5" ry="5" fill="#fff" stroke="#444" strokeWidth="2" />
        <path d="M1105 145 L1135 145 L1135 195 L1105 195 Z" fill="none" stroke="#444" strokeWidth="1" />
        <text x="1120" y="220" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          MongoDB
        </text>

        {/* DEPLOYMENT Container */}
        <rect x="100" y="100" width="250" height="350" rx="10" ry="10" fill="#fff" stroke="#e67e22" strokeWidth="2" />
        <g>
          <rect x="100" y="88" width="120" height="24" rx="4" ry="4" fill="#fff" />
          <text x="110" y="105" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold">
            🔄 DEPLOYMENT
          </text>
        </g>

        {/* Source Code */}
        <circle cx="170" cy="160" r="25" fill="#fff" stroke="#444" strokeWidth="2" />
        <rect x="155" y="145" width="30" height="30" fill="none" stroke="#444" strokeWidth="2" />
        <text x="170" y="195" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Source Code
        </text>

        {/* GitHub Actions */}
        <circle cx="170" cy="250" r="25" fill="#fff" stroke="#444" strokeWidth="2" />
        <rect x="155" y="235" width="30" height="30" fill="none" stroke="#444" strokeWidth="2" />
        <text x="170" y="285" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          GitHub
        </text>
        <text x="170" y="300" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Actions
        </text>

        {/* Deployment Targets */}
        <path d="M280 140 L320 140 L300 180 Z" fill="#fff" stroke="#444" strokeWidth="2" />
        <text x="300" y="200" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Vercel
        </text>

        <rect x="280" y="250" width="40" height="40" rx="5" ry="5" fill="#fff" stroke="#444" strokeWidth="2" />
        <text x="300" y="275" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle">
          R
        </text>
        <text x="300" y="310" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Render
        </text>

        <rect x="280" y="350" width="40" height="40" rx="5" ry="5" fill="#fff" stroke="#444" strokeWidth="2" />
        <text x="300" y="375" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle">
          F
        </text>
        <text x="300" y="410" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          FastAPI on
        </text>
        <text x="300" y="425" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          GCP/AWS/
        </text>
        <text x="300" y="440" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Render
        </text>

        {/* Users - Moved outside deployment container */}
        <circle cx="300" cy="500" r="25" fill="#fff" stroke="#444" strokeWidth="2" />
        <circle cx="300" cy="495" r="10" fill="#fff" stroke="#444" strokeWidth="2" />
        <path d="M280 510 L320 510 C320 525, 280 525, 280 510" fill="#fff" stroke="#444" strokeWidth="2" />
        <text x="300" y="545" fontFamily="Arial, sans-serif" fontSize="12" textAnchor="middle">
          Users
        </text>

        {/* Connections with improved spacing and readability */}
        {/* User to UI */}
        <path d="M300 475 L600 280" fill="none" stroke="#444" strokeWidth="2" />
        <rect x="400" y="350" width="100" height="45" fill="#fff" fillOpacity="0.9" />
        <text x="450" y="365" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Login/Signup
        </text>
        <text x="450" y="380" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          & Destination
        </text>
        <text x="450" y="395" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Selection
        </text>

        {/* UI to Node.js Server */}
        <path d="M630 260 L900 180" fill="none" stroke="#444" strokeWidth="2" />
        <rect x="720" y="190" width="90" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="765" y="205" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          API Call
        </text>
        <text x="765" y="220" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          (Axios/Fetch)
        </text>

        {/* Node.js Server Response */}
        <path d="M900 200 L630 300" fill="none" stroke="#444" strokeWidth="2" />
        <rect x="720" y="230" width="90" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="765" y="245" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Response with
        </text>
        <text x="765" y="260" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Data
        </text>

        {/* UI to ML Server */}
        <path d="M630 320 L900 380" fill="none" stroke="#444" strokeWidth="2" />
        <rect x="720" y="320" width="90" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="765" y="335" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Request Trip
        </text>
        <text x="765" y="350" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Recommendations
        </text>

        {/* ML Server Response */}
        <path d="M900 400 L630 340" fill="none" stroke="#444" strokeWidth="2" />
        <rect x="720" y="350" width="90" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="765" y="370" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Return
        </text>
        <text x="765" y="385" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Processed Data
        </text>

        {/* API Server to MongoDB */}
        <path d="M1000 180 L1100 170" fill="none" stroke="#444" strokeWidth="2" />
        <rect x="1020" y="140" width="90" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="1065" y="155" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          CRUD: User
        </text>
        <text x="1065" y="170" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Data & Trips
        </text>

        {/* Deployment Connections */}
        <path d="M195 160 L280 160" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="5,5" />
        <rect x="210" y="130" width="70" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="245" y="150" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Deploy
        </text>
        <text x="245" y="165" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Frontend
        </text>

        <path d="M195 250 L280 270" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="5,5" />
        <rect x="210" y="230" width="70" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="245" y="250" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Deploy API
        </text>
        <text x="245" y="265" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Server
        </text>

        <path d="M195 270 L280 350" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="5,5" />
        <rect x="210" y="290" width="70" height="30" fill="#fff" fillOpacity="0.9" />
        <text x="245" y="310" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Deploy ML
        </text>
        <text x="245" y="325" fontFamily="Arial, sans-serif" fontSize="11" textAnchor="middle">
          Server
        </text>
      </svg>
    </div>
  )
}
