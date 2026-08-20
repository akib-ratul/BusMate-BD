import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Navigation, MapPin, Bus, Radio, Loader, CheckCircle } from 'lucide-react';
import api from '../../api';
import { io } from 'socket.io-client';

const DriverTracking = () => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'ON_TRIP'>('OFFLINE');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const { data: driverProfile } = useQuery({
    queryKey: ['driver-me'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data;
    },
  });

  const startTracking = () => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    });

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        socket.emit('driver:location', { lat, lng, status: 'ONLINE' });
      },
      (err) => console.warn('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    setWatchId(id);
    setTracking(true);
    setStatus('ONLINE');

    return () => {
      navigator.geolocation.clearWatch(id);
      socket.disconnect();
    };
  };

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setTracking(false);
    setStatus('OFFLINE');
    setWatchId(null);
  };

  const profile = driverProfile?.profile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live GPS Tracking</h1>
        <p className="text-gray-500 mt-1">Share your real-time location with passengers</p>
      </div>

      {/* Status Card */}
      <div className={`card p-6 border-2 ${tracking ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${tracking ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Radio className={`h-7 w-7 ${tracking ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Tracking Status</h2>
              <span className={`text-sm font-medium ${tracking ? 'text-green-600' : 'text-gray-500'}`}>
                {tracking ? '● LIVE — Broadcasting location' : '○ OFFLINE — Not broadcasting'}
              </span>
            </div>
          </div>
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${tracking ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            {tracking ? 'Stop' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Current Location</h3>
        {location ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <p className="text-xs text-gray-400 text-center">Location updates every 5 seconds</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-gray-50 rounded-lg">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Waiting for GPS signal...</span>
          </div>
        )}
      </div>

      {/* Bus Info */}
      {profile?.bus && (
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-gray-900">My Assigned Bus</h3>
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
            <Bus className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-gray-900">{profile.bus.name} — {profile.bus.busNumber}</p>
              <p className="text-sm text-gray-500">{profile.bus.route?.name || 'No route assigned'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trip Control */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Trip Status</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['ONLINE', 'ON_TRIP', 'OFFLINE'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${status === s ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {s === 'ON_TRIP' ? '🚌 On Trip' : s === 'ONLINE' ? '🟢 Online' : '🔴 Offline'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverTracking;
