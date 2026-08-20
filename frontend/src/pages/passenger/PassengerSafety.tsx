import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ShieldAlert, MapPin, Send, CheckCircle, AlertTriangle, Clock, Loader } from 'lucide-react';
import api from '../../api';

const PassengerSafety = () => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: myAlerts, refetch } = useQuery({
    queryKey: ['my-sos'],
    queryFn: async () => {
      const res = await api.get('/api/sos/my');
      return res.data.data as any[];
    },
  });

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocation({ lat: 23.7808, lng: 90.4066 }); // Default Dhaka center
        setLocating(false);
      }
    );
  };

  const sosMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/sos', {
        lat: location?.lat,
        lng: location?.lng,
        message: message || 'Emergency! I need help.',
      });
      return res.data;
    },
    onSuccess: () => {
      setSent(true);
      refetch();
    },
  });

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-red-100 text-red-700',
    ACKNOWLEDGED: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SOS Safety Alert</h1>
        <p className="text-gray-500 mt-1">Send an emergency alert to BusMate BD safety responders</p>
      </div>

      {/* SOS Panel */}
      {!sent ? (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 text-white text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldAlert className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Emergency SOS</h2>
            <p className="text-red-100 text-sm">Press the button below to send an immediate alert with your location</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Location</label>
              <div className="flex gap-2">
                <div className={`flex-1 px-3 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-600 ${location ? 'border-green-300' : 'border-gray-200'}`}>
                  {location
                    ? `📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                    : 'Location not detected yet'}
                </div>
                <button
                  onClick={getLocation}
                  disabled={locating}
                  className="btn btn-primary px-4 py-2.5 flex items-center gap-2 text-sm"
                >
                  {locating ? <Loader className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {locating ? 'Locating...' : 'Detect'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Message (optional)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Describe your emergency situation, bus number, or location details..."
              />
            </div>

            <button
              onClick={() => sosMutation.mutate()}
              disabled={sosMutation.isPending}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-red-200 disabled:opacity-60"
            >
              {sosMutation.isPending
                ? <><Loader className="h-5 w-5 animate-spin" /> Sending Alert...</>
                : <><ShieldAlert className="h-6 w-6" /> SEND SOS ALERT</>
              }
            </button>

            {sosMutation.isError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Failed to send alert. Please try again or call emergency services.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Sent!</h2>
          <p className="text-gray-500 mb-6">Your emergency alert has been sent to our safety team. Stay calm — help is on the way.</p>
          <button onClick={() => setSent(false)} className="btn btn-primary px-6 py-2.5">
            Send Another Alert
          </button>
        </div>
      )}

      {/* Previous Alerts */}
      {myAlerts && myAlerts.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">My Previous Alerts</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {myAlerts.map((alert: any) => (
              <li key={alert.id} className="p-5 flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg mt-0.5">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message || 'Emergency alert'}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.createdAt).toLocaleString('en-BD')}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[alert.status]}`}>
                  {alert.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PassengerSafety;
