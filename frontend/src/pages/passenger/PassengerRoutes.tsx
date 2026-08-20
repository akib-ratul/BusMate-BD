import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Navigation, Clock, MapPin, Bus } from 'lucide-react';
import api from '../../api';

const PassengerRoutes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';
  
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [searchQuery, setSearchQuery] = useState({ from: initialFrom, to: initialTo });

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
            <input
              type="text"
              placeholder="From (e.g. Mirpur)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input pl-10 py-3"
            />
          </div>
          <div className="flex-1 relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="To (e.g. Gulshan)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input pl-10 py-3"
            />
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
                    <button className="btn btn-secondary flex-1 md:flex-none">
                      View Stops
                    </button>
                    <button className="btn btn-accent flex-1 md:flex-none">
                      Live Map
                    </button>
                  </div>
                </div>
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
