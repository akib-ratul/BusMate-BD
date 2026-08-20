import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bus, MapPin, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../../api';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  SEARCHING: 'bg-yellow-100 text-yellow-700',
};

const PassengerTrips = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['passenger-trips'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/trips');
      return res.data.data as any[];
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <p className="text-gray-500 mt-1">Your complete travel history on BusMate BD</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      )}

      {error && (
        <div className="card p-8 text-center text-gray-500">
          <XCircle className="h-12 w-12 text-red-300 mx-auto mb-3" />
          <p>Failed to load trips. Please try again.</p>
        </div>
      )}

      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="card p-12 text-center">
          <Bus className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No trips yet</h3>
          <p className="text-gray-400 mt-1">Your travel history will appear here once you start taking buses.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((trip: any) => (
            <div key={trip.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl mt-0.5">
                    <Bus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{trip.source}</span>
                      <span className="text-gray-400">→</span>
                      <span>{trip.destination}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {trip.route?.name || 'Unknown route'}
                      {trip.bus?.busNumber && ` • Bus ${trip.bus.busNumber}`}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {trip.startedAt ? new Date(trip.startedAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                      {trip.endedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900">৳{trip.fare}</p>
                  <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[trip.status] || 'bg-gray-100 text-gray-600'}`}>
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassengerTrips;
