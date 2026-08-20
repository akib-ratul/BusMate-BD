import React from 'react';
import { Users, Bus, Map, ShieldAlert, Activity, Navigation } from 'lucide-react';
import api from '../../api';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/admin');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading analytics...</div>;

  const summary = analytics?.summary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
        <p className="text-gray-500 mt-1">BusMate BD Platform Analytics</p>
      </div>

      {summary?.activeSos > 0 && (
        <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-lg flex items-start gap-4">
          <div className="bg-danger/20 p-2 rounded-full">
            <ShieldAlert className="h-6 w-6 text-danger animate-pulse" />
          </div>
          <div>
            <h3 className="text-danger font-bold text-lg">Active SOS Alerts ({summary.activeSos})</h3>
            <p className="text-danger-hover">There are unresolved emergency alerts that require immediate attention.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 flex gap-2">
            <span>P: {summary?.passengers}</span>
            <span>D: {summary?.drivers}</span>
            <span>O: {summary?.operators}</span>
          </div>
        </div>
        
        <div className="card p-6 border-t-4 border-t-accent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Buses (Active/Total)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.activeBuses || 0} / {summary?.totalBuses || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Bus className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-t-4 border-t-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Routes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.activeRoutes || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Navigation className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-t-4 border-t-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Trips</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalTrips || 0}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-6">User Registration Trend (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.usersPerDay || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-6">Platform Trips Trend (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.tripsPerDay || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="trips" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
