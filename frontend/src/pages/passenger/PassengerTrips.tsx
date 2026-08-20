import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bus, MapPin, Clock, CheckCircle, XCircle, Loader, Star, Users, MessageSquare } from 'lucide-react';
import api from '../../api';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  SEARCHING: 'bg-yellow-100 text-yellow-700',
};

const PassengerTrips = () => {
  const queryClient = useQueryClient();

  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [crowdModal, setCrowdModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });

  const [ratingData, setRatingData] = useState({ stars: 5, review: '' });
  const [crowdLevel, setCrowdLevel] = useState('MODERATE');
  
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['passenger-trips'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/trips');
      return res.data.data as any[];
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/rating', data);
      return res.data;
    },
    onSuccess: () => {
      setRatingModal({ isOpen: false, trip: null });
      setRatingData({ stars: 5, review: '' });
      setActionMessage({ type: 'success', text: 'Thank you for rating this trip!' });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit rating' });
      setTimeout(() => setActionMessage(null), 4000);
    }
  });

  const crowdMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/crowd', data);
      return res.data;
    },
    onSuccess: () => {
      setCrowdModal({ isOpen: false, trip: null });
      setActionMessage({ type: 'success', text: 'Crowd status reported successfully!' });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to report crowd' });
      setTimeout(() => setActionMessage(null), 4000);
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <p className="text-gray-500 mt-1">Your complete travel history on BusMate BD</p>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {actionMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

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
                <div className="text-right flex-shrink-0 flex flex-col items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">৳{trip.fare}</p>
                    <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[trip.status] || 'bg-gray-100 text-gray-600'}`}>
                      {trip.status}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4">
                    {trip.status === 'COMPLETED' && trip.busId && (
                      <button 
                        onClick={() => setRatingModal({ isOpen: true, trip })}
                        className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 hover:text-accent hover:border-accent"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Rate Trip
                      </button>
                    )}
                    {trip.status === 'ACTIVE' && trip.busId && (
                      <button 
                        onClick={() => setCrowdModal({ isOpen: true, trip })}
                        className="btn btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Report Crowd
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModal.isOpen && ratingModal.trip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Rate Your Trip</h3>
              <p className="text-sm text-gray-500 mb-6">How was your ride on {ratingModal.trip.route?.name}?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingData({ ...ratingData, stars: star })}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`h-10 w-10 ${star <= ratingData.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">Write a review (optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    className="input pl-10 py-2.5 resize-none w-full"
                    rows={3}
                    placeholder="Tell us about the bus, driver, or your overall experience..."
                    value={ratingData.review}
                    onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setRatingModal({ isOpen: false, trip: null })}
                  className="btn btn-secondary flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => rateMutation.mutate({ busId: ratingModal.trip.busId, stars: ratingData.stars, review: ratingData.review })}
                  disabled={rateMutation.isPending}
                  className="btn btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
                >
                  {rateMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CROWD REPORT MODAL */}
      {crowdModal.isOpen && crowdModal.trip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Report Bus Crowd</h3>
              <p className="text-sm text-gray-500 mb-6">Help other passengers by reporting the current crowd level.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { level: 'LOW', label: 'Empty Seats', color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' },
                  { level: 'MODERATE', label: 'Few Seats', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
                  { level: 'HIGH', label: 'Standing Only', color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
                  { level: 'FULL', label: 'Completely Full', color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
                ].map((c) => (
                  <button
                    key={c.level}
                    onClick={() => setCrowdLevel(c.level)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${crowdLevel === c.level ? c.color : 'border-gray-100 text-gray-500 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <Users className={`h-6 w-6 ${crowdLevel === c.level ? '' : 'opacity-50'}`} />
                    <span className="font-semibold text-sm">{c.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCrowdModal({ isOpen: false, trip: null })}
                  className="btn btn-secondary flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => crowdMutation.mutate({ busId: crowdModal.trip.busId, level: crowdLevel })}
                  disabled={crowdMutation.isPending}
                  className="btn btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
                >
                  {crowdMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerTrips;
