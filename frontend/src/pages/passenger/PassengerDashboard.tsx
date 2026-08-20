import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bus, Navigation, Map as MapIcon, ShieldAlert, History, MessageSquare } from 'lucide-react';
import api from '../../api';
import { useQuery } from '@tanstack/react-query';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'Passenger';

  // Fetch quick stats
  const { data: trips } = useQuery({
    queryKey: ['my-trips-recent'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/trips');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-primary text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {userName}! 👋</h1>
          <p className="text-gray-300">Where are you heading today in Dhaka?</p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/passenger/routes" className="btn btn-accent px-6 py-3 rounded-xl shadow-lg shadow-accent/30 font-semibold flex items-center justify-center gap-2">
              <Navigation className="h-5 w-5" />
              Find a Route
            </Link>
            <Link to="/passenger/map" className="btn bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl backdrop-blur-sm transition-colors font-semibold flex items-center justify-center gap-2">
              <MapIcon className="h-5 w-5" />
              Live Bus Map
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/passenger/routes" className="card p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform group cursor-pointer border border-transparent hover:border-accent">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Routes</h3>
          <p className="text-sm text-gray-500 mt-1">Search buses</p>
        </Link>
        
        <Link to="/passenger/fare" className="card p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform group cursor-pointer border border-transparent hover:border-accent">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-2xl font-bold text-green-600">৳</span>
          </div>
          <h3 className="font-semibold text-gray-900">Fare Calculator</h3>
          <p className="text-sm text-gray-500 mt-1">Check ticket prices</p>
        </Link>

        <Link to="/passenger/trips" className="card p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform group cursor-pointer border border-transparent hover:border-accent">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <History className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">My Trips</h3>
          <p className="text-sm text-gray-500 mt-1">Recent history</p>
        </Link>

        <Link to="/passenger/safety" className="card p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform group cursor-pointer border border-transparent hover:border-danger">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">SOS</h3>
          <p className="text-sm text-gray-500 mt-1">Emergency alert</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900">Recent Trips</h2>
              <Link to="/passenger/trips" className="text-sm text-primary hover:underline font-medium">View all</Link>
            </div>
            <div className="p-0">
              {trips && trips.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {trips.slice(0, 3).map((trip: any) => (
                    <li key={trip.id} className="p-5 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{trip.source} → {trip.destination}</p>
                          <p className="text-sm text-gray-500 mt-1">{trip.route?.name} • ৳{trip.fare}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {trip.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No recent trips found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Assistant Promo */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <MessageSquare className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">AI Route Assistant</h3>
              <p className="text-indigo-100 text-sm mb-4">Not sure which bus to take? Ask our smart AI assistant.</p>
              <Link to="/passenger/ai-assistant" className="btn bg-white text-indigo-600 hover:bg-gray-10 w-full py-2 rounded-lg font-semibold shadow-sm">
                Ask AI Assistant
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Shortcuts</h3>
            <div className="space-y-3">
              <Link to="/passenger/ticket" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 text-gray-700">
                <span className="font-medium">View E-Ticket</span>
              </Link>
              <Link to="/passenger/crowd" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 text-gray-700">
                <span className="font-medium">Report Bus Crowd</span>
              </Link>
              <Link to="/passenger/rate" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 text-gray-700">
                <span className="font-medium">Rate Bus & Driver</span>
              </Link>
              <Link to="/passenger/lost-found" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 text-gray-700">
                <span className="font-medium">Report Lost Item</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
