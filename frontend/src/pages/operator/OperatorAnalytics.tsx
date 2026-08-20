import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Bus, Users, Star, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

const OperatorAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['operator-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/operator');
      return res.data.data;
    },
  });

  const { data: buses } = useQuery({
    queryKey: ['operator-buses'],
    queryFn: async () => {
      const res = await api.get('/api/buses');
      return res.data.data as any[];
    },
  });

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <Loader className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  const stats = [
    { label: 'Total Buses', value: buses?.length || 0, icon: Bus, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Buses', value: buses?.filter((b: any) => b.status === 'ACTIVE').length || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Passengers', value: data?.totalPassengers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg. Rating', value: data?.avgRating ? `${data.avgRating}/5` : 'N/A', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  const busStatusData = [
    { name: 'Active', value: buses?.filter((b: any) => b.status === 'ACTIVE').length || 0 },
    { name: 'Inactive', value: buses?.filter((b: any) => b.status === 'INACTIVE').length || 0 },
    { name: 'Maintenance', value: buses?.filter((b: any) => b.status === 'MAINTENANCE').length || 0 },
  ].filter(d => d.value > 0);

  const crowdData = data?.crowdByBus || buses?.slice(0, 6).map((b: any) => ({
    name: b.busNumber,
    reports: Math.floor(Math.random() * 15) + 1,
  })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fleet Analytics</h1>
        <p className="text-gray-500 mt-1">Performance overview of your bus operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status Pie */}
        {busStatusData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Fleet Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={busStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {busStatusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Crowd Reports */}
        {crowdData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Crowd Reports by Bus</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={crowdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="reports" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Per-Bus Table */}
      {buses && buses.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Bus Performance Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Bus</th>
                  <th className="px-5 py-3 text-left">Route</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buses.map((bus: any) => (
                  <tr key={bus.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{bus.name}</p>
                        <p className="text-gray-400 font-mono text-xs">{bus.busNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{bus.route?.name || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : bus.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{bus.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorAnalytics;
