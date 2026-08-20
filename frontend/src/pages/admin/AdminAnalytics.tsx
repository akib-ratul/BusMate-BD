import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Bus, Navigation, TrendingUp, Loader, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminAnalytics = () => {
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/api/users')).data.data as any[] });
  const { data: buses } = useQuery({ queryKey: ['all-buses'], queryFn: async () => (await api.get('/api/buses')).data.data as any[] });
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: async () => (await api.get('/api/routes')).data.data as any[] });

  const roleData = users ? [
    { name: 'Passengers', value: users.filter((u: any) => u.role === 'PASSENGER').length },
    { name: 'Drivers', value: users.filter((u: any) => u.role === 'DRIVER').length },
    { name: 'Operators', value: users.filter((u: any) => u.role === 'OPERATOR').length },
    { name: 'Admins', value: users.filter((u: any) => u.role === 'ADMIN').length },
  ].filter(d => d.value > 0) : [];

  const busStatusData = buses ? [
    { name: 'Active', value: buses.filter((b: any) => b.status === 'ACTIVE').length },
    { name: 'Inactive', value: buses.filter((b: any) => b.status === 'INACTIVE').length },
    { name: 'Maintenance', value: buses.filter((b: any) => b.status === 'MAINTENANCE').length },
  ].filter(d => d.value > 0) : [];

  const routeData = routes?.map((r: any) => ({
    name: r.name.split('–')[0].trim(),
    distance: r.distance,
    fare: r.baseFare,
    duration: r.estimatedDuration,
  })) || [];

  const stats = [
    { label: 'Total Users', value: users?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Buses', value: buses?.length || 0, icon: Bus, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Routes', value: routes?.filter((r: any) => r.isActive).length || 0, icon: Navigation, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Buses', value: buses?.filter((b: any) => b.status === 'ACTIVE').length || 0, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500 mt-1">Platform-wide statistics and performance metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        {roleData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">User Distribution by Role</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {roleData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bus Status */}
        {busStatusData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Bus Fleet Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={busStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {busStatusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Route Fare Comparison */}
      {routeData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">Route Fare Comparison (৳ BDT)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={routeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v) => `৳${v}`} />
              <Bar dataKey="fare" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
