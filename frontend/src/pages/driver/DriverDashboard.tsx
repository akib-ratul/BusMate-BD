import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bus, Navigation, Star, MapPin, Power } from 'lucide-react';
import api from '../../api';
import { useQuery } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../../utils/socket';

const DriverDashboard = () => {
  const { user } = useAuth();
  const driver = user?.profile;
  const bus = driver?.bus;
  const route = bus?.route;

  const [isTracking, setIsTracking] = useState(false);
  const [demoInterval, setDemoInterval] = useState<number | null>(null);

  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (demoInterval) window.clearInterval(demoInterval);
      disconnectSocket();
    };
  }, [demoInterval]);

  const { data: ratings } = useQuery({
    queryKey: ['driver-ratings', driver?.id],
    queryFn: async () => {
      if (!driver?.id) return { data: [], meta: { avg: 0 } };
      const res = await api.get(`/api/ratings/driver/${driver.id}`);
      return res.data;
    },
    enabled: !!driver?.id,
  });

  const toggleTracking = () => {
    if (isTracking) {
      if (demoInterval) window.clearInterval(demoInterval);
      setDemoInterval(null);
      setIsTracking(false);
      
      const socket = connectSocket();
      socket.emit('driver:status', { busId: bus?.id, status: 'INACTIVE' });
    } else {
      setIsTracking(true);
      const socket = connectSocket();
      socket.emit('driver:status', { busId: bus?.id, status: 'ACTIVE' });
      
      // Setup demo simulator
      let currentLat = bus?.currentLat || route?.stops?.[0]?.lat || 23.7806;
      let currentLng = bus?.currentLng || route?.stops?.[0]?.lng || 90.4153;
      
      const interval = window.setInterval(() => {
        // Move slightly to simulate driving (roughly towards south/east in Dhaka)
        currentLat -= 0.0002 + (Math.random() * 0.0001);
        currentLng += 0.0001 + (Math.random() * 0.0001);
        
        socket.emit('driver:location', {
          busId: bus?.id,
          lat: currentLat,
          lng: currentLng,
        });
      }, 3000); // Update every 3 seconds for demo
      
      setDemoInterval(interval);
    }
  };

  if (!bus) {
    return (
      <div className="card p-8 text-center max-w-2xl mx-auto mt-10">
        <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bus Assigned</h2>
        <p className="text-gray-500">You are not currently assigned to any bus. Please contact your transport operator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        
        <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${isTracking ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
          <span className="relative flex h-3 w-3">
            {isTracking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </span>
          {isTracking ? 'LIVE SHARING ACTIVE' : 'LOCATION SHARING OFF'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card border border-primary p-0 overflow-hidden">
            <div className="bg-primary text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-accent font-semibold mb-1 uppercase tracking-wider text-xs">Current Assignment</p>
                  <h2 className="text-2xl font-bold">{bus.name}</h2>
                  <p className="text-gray-300 font-mono mt-1">{bus.busNumber}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <Bus className="h-8 w-8 text-accent" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Route</p>
                  <p className="font-semibold text-gray-900 text-lg">{route?.name || 'No Route'}</p>
                  <p className="text-sm text-gray-600">{route?.startPoint} ⇄ {route?.endPoint}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={toggleTracking}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors ${
                    isTracking 
                      ? 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20' 
                      : 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20'
                  }`}
                >
                  <Power className="h-6 w-6" />
                  {isTracking ? 'STOP DEMO TRACKING' : 'START DEMO TRACKING'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  {isTracking 
                    ? 'Broadcasting simulated location data to passengers via WebSockets.' 
                    : 'Starts a local simulated GPS broadcast for demonstration purposes.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-gray-500 font-medium mb-2">My Rating</h3>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-4xl font-extrabold text-gray-900">{ratings?.meta?.avg || '0.0'}</span>
              <Star className="h-8 w-8 text-warning fill-warning" />
            </div>
            <p className="text-sm text-gray-500">Based on {ratings?.meta?.total || 0} reviews</p>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Recent Feedback</h3>
            </div>
            <div className="p-0 max-h-64 overflow-y-auto">
              {ratings?.data && ratings.data.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {ratings.data.slice(0, 3).map((rating: any) => (
                    <li key={rating.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rating.stars ? 'text-warning fill-warning' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {rating.review && <p className="text-sm text-gray-700 italic">"{rating.review}"</p>}
                      <p className="text-xs text-gray-400 mt-1">- {rating.user?.name}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">No feedback yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
