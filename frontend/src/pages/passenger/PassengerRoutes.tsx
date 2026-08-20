import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Navigation, Clock, MapPin, Bus } from 'lucide-react';
import api from '../../api';

const DHAKA_LOCATIONS = [
  "Mirpur 10", "Mirpur 1", "Shewrapara", "Farmgate", "Karwan Bazar", 
  "Shahbagh", "Motijheel", "Uttara", "Banani", "Gulshan 1", "Gulshan 2", 
  "Mohammadpur", "Jatrabari", "Sayedabad", "Dhanmondi 27", "Bashundhara", "Airport Road"
].sort();

const PassengerRoutes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';
  
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [searchQuery, setSearchQuery] = useState({ from: initialFrom, to: initialTo });
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes', searchQuery],
    queryFn: async () => {
      let url = '/api/routes';
      if (searchQuery.from && searchQuery.to) {
        url = `/api/routes/search?from=${searchQuery.from}&to=${searchQuery.to}`;
      }
      const res = await api.get(url);
      return res.data.data;
    },
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery({ from, to });
    setSearchParams({ from, to });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Route</h1>
        <p className="text-gray-500">Discover the best buses for your journey across Dhaka.</p>
      </div>

      {/* Search Box */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input pl-10 py-3 appearance-none bg-white"
            >
              <option value="" disabled>From (e.g. Mirpur)</option>
              {DHAKA_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input pl-10 py-3 appearance-none bg-white"
            >
              <option value="" disabled>To (e.g. Gulshan)</option>
              {DHAKA_LOCATIONS.map(loc => (
                <option key={loc} value={loc} disabled={loc === from}>{loc}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary py-3 px-8">
            <Search className="h-5 w-5 mr-2" />
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {searchQuery.from && searchQuery.to 
            ? `Search Results for "${searchQuery.from}" to "${searchQuery.to}"` 
            : 'All Available Routes'}
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Searching for routes...</p>
          </div>
        ) : routes && routes.length > 0 ? (
          <div className="space-y-4">
            {routes.map((route: any) => (
              <div key={route.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
                      <Bus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{route.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{route.startPoint}</span>
                        <span>→</span>
                        <span>{route.endPoint}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Navigation className="h-4 w-4" />
                          <span>{route.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>~{route.estimatedDuration} mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Base Fare: ৳{route.baseFare}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2 w-full md:w-auto">
                    <button 
                      className="btn btn-secondary flex-1 md:flex-none"
                      onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                    >
                      {expandedRoute === route.id ? 'Hide Stops' : 'View Stops'}
                    </button>
                    <button 
                      className="btn btn-accent flex-1 md:flex-none"
                      onClick={() => navigate(`/passenger/map?routeId=${route.id}`)}
                    >
                      Live Map
                    </button>
                  </div>
                </div>
                
                {/* Expandable Stops Section */}
                {expandedRoute === route.id && route.stops && route.stops.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Route Stops</h4>
                    <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-6">
                      {route.stops
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((stop: any, index: number, arr: any[]) => (
                          <div key={stop.name} className="relative pl-6 md:pl-8">
                            {/* Stop Dot */}
                            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white shadow-sm ${index === 0 ? 'bg-primary' : index === arr.length - 1 ? 'bg-accent' : 'bg-gray-300'}`}></div>
                            
                            <p className={`font-semibold ${index === 0 || index === arr.length - 1 ? 'text-gray-900' : 'text-gray-700'}`}>
                              {stop.name}
                            </p>
                            {(stop.lat && stop.lng) && (
                              <p className="text-xs text-gray-400 mt-1 font-mono">
                                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                              </p>
                            )}
                          </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No routes found</h3>
            <p className="text-gray-500">We couldn't find any direct routes for this search. Try different locations or check the map.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerRoutes;
