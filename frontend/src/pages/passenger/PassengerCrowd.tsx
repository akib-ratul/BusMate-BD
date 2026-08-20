import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, Bus as BusIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const crowdLevels = [
  { id: 'LOW', label: 'Low', description: 'Many empty seats available', color: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' },
  { id: 'MODERATE', label: 'Moderate', description: 'Some empty seats', color: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { id: 'HIGH', label: 'High', description: 'Standing room only', color: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { id: 'FULL', label: 'Full', description: 'Completely packed', color: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' }
];

const PassengerCrowd = () => {
  const { user } = useAuth();
  const [selectedBus, setSelectedBus] = useState('');
  const [level, setLevel] = useState('MODERATE');
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: buses, isLoading } = useQuery({
    queryKey: ['active-buses-crowd'],
    queryFn: async () => {
      const res = await api.get('/api/buses');
      return res.data.data.filter((b: any) => b.status === 'ACTIVE');
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { busId: string, level: string }) => {
      const res = await api.post('/api/crowd', data);
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setSelectedBus('');
        setLevel('MODERATE');
      }, 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBus && level) {
      submitMutation.mutate({ busId: selectedBus, level });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Crowd Status</h1>
        <p className="text-gray-500 mt-1">Help other passengers by reporting how crowded your bus is.</p>
      </div>

      <div className="card p-6 md:p-8">
        {successMsg ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Report Submitted!</h3>
            <p className="text-gray-500 mt-2">Thank you for helping the BusMate community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Bus Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Which bus are you on?</label>
              <div className="relative">
                <BusIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select 
                  className="input pl-11 py-4 text-base font-medium shadow-sm bg-gray-50 border-gray-200"
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an active bus...</option>
                  {buses?.map((bus: any) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name} ({bus.busNumber}) {bus.route ? `- ${bus.route.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {isLoading && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader className="h-3 w-3 animate-spin"/> Loading active buses...</p>}
            </div>

            {/* Crowd Level Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">How crowded is it?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crowdLevels.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => setLevel(c.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      level === c.id 
                        ? `${c.color} ring-4 ring-opacity-30 ring-current border-transparent shadow-md scale-[1.02]` 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${level === c.id ? 'bg-white/50' : 'bg-gray-100 text-gray-500'}`}>
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{c.label}</h4>
                        <p className="text-xs text-gray-600 mt-0.5">{c.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Your report will be anonymous and instantly visible on the Live Map to help others plan their journey.
              </p>
            </div>

            <button 
              type="submit"
              disabled={!selectedBus || submitMutation.isPending}
              className="w-full btn btn-primary py-4 text-lg shadow-lg hover:-translate-y-0.5 transition-transform disabled:transform-none disabled:opacity-50"
            >
              {submitMutation.isPending ? <Loader className="h-5 w-5 animate-spin mx-auto" /> : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PassengerCrowd;
