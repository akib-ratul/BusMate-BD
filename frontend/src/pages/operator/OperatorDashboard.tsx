import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bus, Users, Map, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../api';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const OperatorDashboard = () => {
  const { user } = useAuth();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['operator-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/operator');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading analytics...</div>;

  const summary = analytics?.summary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Dashboard</h1>
          <p className="text-gray-500 mt-1">{user?.profile?.organizationName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Fleet</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalBuses || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6 border-t-4 border-t-accent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active on Route</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.activeBuses || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Map className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-t-4 border-t-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Trips</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalTrips || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-t-4 border-t-warning">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">{summary?.avgRating || '0.0'}</p>
                <Star className="h-5 w-5 text-warning fill-warning" />
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Star className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-6">Passenger Trips (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.tripsPerDay || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-6">Popular Routes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.popularRoutes || []} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="trips" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Fleet Status (Needs Attention)</h3>
        {summary?.inactiveBuses > 0 || summary?.maintenanceBuses > 0 ? (
          <div className="space-y-3">
            {summary.maintenanceBuses > 0 && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 text-orange-800 rounded-lg border border-orange-100">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">{summary.maintenanceBuses} bus(es) currently in maintenance.</span>
              </div>
            )}
            {summary.inactiveBuses > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                <Bus className="h-5 w-5" />
                <span className="font-medium">{summary.inactiveBuses} bus(es) are currently inactive or off route.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 flex items-center gap-3">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">All systems operational. No fleet issues detected.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;
