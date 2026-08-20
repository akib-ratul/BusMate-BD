import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calculator, MapPin, Navigation, ArrowRight, Loader, Info } from 'lucide-react';
import api from '../../api';

const PassengerFare = () => {
  const [routeId, setRouteId] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const { data: routes, isLoading: loadingRoutes } = useQuery({
    queryKey: ['routes-all'],
    queryFn: async () => {
      const res = await api.get('/api/routes');
      return res.data.data as any[];
    }
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: { routeId: string, source: string, destination: string }) => {
      const res = await api.post('/api/fare/calculate', data);
      return res.data.data;
    }
  });

  const selectedRoute = routes?.find(r => r.id === routeId);
  const stops = selectedRoute?.stops || [];

  // Reset stops if route changes
  useEffect(() => {
    setSource('');
    setDestination('');
    calculateMutation.reset();
  }, [routeId]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fare Calculator</h1>
        <p className="text-gray-500 mt-1">Calculate estimated ticket prices for your trip</p>
      </div>

      <div className="card p-6 md:p-8">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (routeId) calculateMutation.mutate({ routeId, source, destination });
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Select Route</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select 
                className="input pl-10 py-3 appearance-none font-medium" 
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                required
              >
                <option value="" disabled>Choose a bus route...</option>
                {routes?.filter(r => r.isActive).map(route => (
                  <option key={route.id} value={route.id}>{route.name} ({route.startPoint} ⇄ {route.endPoint})</option>
                ))}
              </select>
            </div>
            {loadingRoutes && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader className="h-3 w-3 animate-spin"/> Loading routes...</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Connection line between stops on desktop */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white p-2 rounded-full border border-gray-100 shadow-sm">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Boarding From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <select 
                  className="input pl-10 py-3 appearance-none" 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={!selectedRoute}
                  required
                >
                  <option value="" disabled>Select stop...</option>
                  {stops.map((stop: any) => (
                    <option key={`src-${stop.name}`} value={stop.name} disabled={stop.name === destination}>{stop.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Getting Off At</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                <select 
                  className="input pl-10 py-3 appearance-none" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={!selectedRoute || !source}
                  required
                >
                  <option value="" disabled>Select destination...</option>
                  {stops.map((stop: any) => (
                    <option key={`dest-${stop.name}`} value={stop.name} disabled={stop.name === source}>{stop.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!routeId || !source || !destination || calculateMutation.isPending}
            className="w-full btn btn-primary py-3.5 text-base flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
          >
            {calculateMutation.isPending ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Calculator className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Calculate Fare
              </>
            )}
          </button>
        </form>

        {calculateMutation.isSuccess && calculateMutation.data && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Estimated Fare</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">৳</span>
                <span className="text-5xl font-extrabold text-gray-900">{calculateMutation.data.fare}</span>
              </div>
              <p className="text-gray-600 mt-2 flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                {calculateMutation.data.source} to {calculateMutation.data.destination}
              </p>
              
              <div className="w-full h-px bg-blue-200/50 my-4"></div>
              
              <div className="flex items-start gap-2 text-xs text-blue-700/80 bg-blue-100/50 p-3 rounded-lg text-left">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>This is an estimated base fare based on system per-km rates ({calculateMutation.data.distance?.toFixed(1)} km). Actual fares may vary slightly depending on the bus operator (AC vs Non-AC) and real-time traffic conditions.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerFare;
