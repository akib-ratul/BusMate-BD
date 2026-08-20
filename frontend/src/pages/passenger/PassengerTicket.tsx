import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ticket, QrCode, Bus, MapPin, Clock, Download, ChevronRight, Loader, Info } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const PassengerTicket = () => {
  const { user } = useAuth();
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['my-trips-tickets'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/trips');
      return res.data.data;
    }
  });

  const activeTrip = trips?.find((t: any) => t.id === selectedTripId) || trips?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Ticket</h1>
          <p className="text-gray-500 mt-1">Digital boarding pass for your journeys.</p>
        </div>
        
        {trips && trips.length > 0 && (
          <select 
            className="input py-2 text-sm max-w-xs bg-white"
            value={selectedTripId || activeTrip?.id || ''}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            {trips.map((trip: any) => (
              <option key={trip.id} value={trip.id}>
                {new Date(trip.createdAt).toLocaleDateString()} - {trip.source} to {trip.destination}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : !activeTrip ? (
        <div className="card p-12 text-center">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
          <p className="text-gray-500 mt-1">You don't have any recent trips to generate a ticket for.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Ticket */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col relative border border-gray-100">
              
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white relative">
                <div className="absolute right-0 top-0 h-full w-32 bg-white/10 skew-x-12 translate-x-10"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">BusMate BD</h2>
                    <p className="text-primary-100 text-sm font-medium uppercase tracking-widest mt-1">Boarding Pass</p>
                  </div>
                  <Bus className="h-10 w-10 text-white/80" />
                </div>
              </div>

              {/* Cutout details */}
              <div className="relative px-6 py-8">
                {/* Side notches */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-50 shadow-inner"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-50 shadow-inner"></div>
                
                {/* Pass info */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Passenger</p>
                    <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Date</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {new Date(activeTrip.startedAt || activeTrip.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="col-span-2 mt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">From</p>
                        <p className="font-bold text-xl text-gray-900">{activeTrip.source}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center px-4">
                        <ChevronRight className="h-6 w-6 text-gray-300" />
                        <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                          {activeTrip.route?.name || 'Direct'}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">To</p>
                        <p className="font-bold text-xl text-gray-900">{activeTrip.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full border-t-2 border-dashed border-gray-200 my-8"></div>

                <div className="flex justify-between items-end">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Bus Number</p>
                      <p className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block">
                        {activeTrip.bus?.busNumber || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Fare</p>
                      <p className="font-black text-3xl text-primary">৳{activeTrip.fare}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-white p-2 border-2 border-gray-100 rounded-xl shadow-sm">
                      <QrCode className="h-24 w-24 text-gray-800" strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-widest">{activeTrip.id?.substring(0, 12).toUpperCase()}</p>
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className={`py-3 text-center text-sm font-bold uppercase tracking-wider text-white ${activeTrip.status === 'COMPLETED' ? 'bg-gray-400' : 'bg-green-500'}`}>
                {activeTrip.status === 'COMPLETED' ? 'Journey Completed' : 'Valid for Travel'}
              </div>
            </div>
            
            <button className="mt-6 w-full btn btn-secondary py-3 flex items-center justify-center gap-2 font-semibold">
              <Download className="h-5 w-5" />
              Download PDF Ticket
            </button>
          </div>

          {/* Quick Info panel */}
          <div className="md:w-72 space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                <Info className="h-5 w-5" /> Boarding Info
              </h3>
              <p className="text-sm text-blue-800">
                Please present this digital ticket or the QR code to the bus conductor when boarding. The QR code contains your verified trip details.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-gray-400" /> Trip Details
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-gray-900">{activeTrip.status}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Operator</span>
                  <span className="font-semibold text-gray-900 text-right">{activeTrip.bus?.operator?.organizationName || 'BusMate Partner'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-semibold text-gray-900 text-right">{activeTrip.route?.distance ? `${activeTrip.route.distance} km` : 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerTicket;
