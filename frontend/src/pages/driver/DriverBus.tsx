import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bus, MapPin, Users, Navigation, Loader, Star } from 'lucide-react';
import api from '../../api';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
};

const DriverBus = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['driver-me'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data;
    },
  });

  const { data: ratings } = useQuery({
    queryKey: ['driver-ratings'],
    queryFn: async () => {
      const res = await api.get('/api/ratings');
      return res.data.data as any[];
    },
  });

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <Loader className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  const bus = data?.profile?.bus;
  const avgRating = ratings && ratings.length > 0
    ? (ratings.reduce((sum: number, r: any) => sum + r.stars, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bus</h1>
        <p className="text-gray-500 mt-1">Your assigned vehicle and route information</p>
      </div>

      {!bus ? (
        <div className="card p-12 text-center">
          <Bus className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No bus assigned</h3>
          <p className="text-gray-400 mt-1">Contact your operator to get a bus assignment.</p>
        </div>
      ) : (
        <>
          {/* Bus Card */}
          <div className="card p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Bus className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{bus.name}</h2>
                    <p className="text-gray-500 font-mono">{bus.busNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[bus.status]}`}>
                    {bus.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-400">Capacity</p>
                    <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" /> {bus.capacity} seats
                    </p>
                  </div>
                  {avgRating && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-400">Avg. Rating</p>
                      <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {avgRating} / 5
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Route Info */}
          {bus.route && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Assigned Route</h3>
              <div className="flex items-center gap-3 mb-4">
                <Navigation className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{bus.route.name}</p>
                  <p className="text-sm text-gray-500">{bus.route.distance}km • ~{bus.route.estimatedDuration} min</p>
                </div>
              </div>
              <div className="relative pl-6 space-y-0">
                {(bus.route.stops as any[] || []).map((stop: any, i: number, arr: any[]) => (
                  <div key={i} className="relative pb-4 last:pb-0">
                    {i < arr.length - 1 && <div className="absolute left-[-14px] top-3 w-0.5 h-full bg-gray-200" />}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ml-[-19px] ${i === 0 || i === arr.length - 1 ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`} />
                      <span className={`text-sm ${i === 0 || i === arr.length - 1 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{stop.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">Base Fare</span>
                <span className="font-bold text-gray-900">৳{bus.route.baseFare}</span>
              </div>
            </div>
          )}

          {/* Recent Ratings */}
          {ratings && ratings.length > 0 && (
            <div className="card">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Passenger Reviews</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {ratings.slice(0, 5).map((r: any) => (
                  <li key={r.id} className="p-5">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700">{r.review || 'No review text'}</p>
                      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{r.user?.name} • {new Date(r.createdAt).toLocaleDateString('en-BD')}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DriverBus;
