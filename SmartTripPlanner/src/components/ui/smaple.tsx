const SmartTripPlannerDashboard = () => {
    const getStartedLinks = [
      { title: 'Plan Your First Trip', url: '#' },
      { title: 'Customize Your Itinerary', url: '#' },
      { title: 'AI-Powered Travel Assistance', url: '#' },
      { title: 'Best Destination Suggestions', url: '#' },
      { title: 'Exclusive Travel Deals', url: '#' },
      { title: 'Community Travel Experiences', url: '#' }
    ];

    const features = [
      { title: 'AI Travel Assistant', status: 'active' },
      { title: 'Real-Time Price Comparison', status: 'completed' },
      { title: 'Smart Itinerary Builder', status: 'active' },
      { title: 'Interactive Map & Navigation', status: 'active' },
      { title: 'Customizable Travel Packages', status: 'active' },
      { title: 'User Reviews & Recommendations', status: 'active' },
      { title: 'Flight & Hotel Booking Integration', status: 'completed' },
      { title: '→ and more features in our upcoming update!', status: 'pending' }
    ];

    return (
      <div className="max-w-4xl mx-auto p-8 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Get Started Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Get Started with Smart Trip Planner</h2>
            <div className="space-y-2">
              {getStartedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="block text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Features We Offer:</h2>
            <div className="space-y-2">
              {features.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    item.status === 'completed' ? 'bg-gray-400 line-through' :
                    item.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className={`${
                    item.status === 'completed' ? 'line-through text-gray-400' : ''
                  }`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default SmartTripPlannerDashboard;
