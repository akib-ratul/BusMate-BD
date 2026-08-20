import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Shield, User, Loader, ChevronDown } from 'lucide-react';
import api from '../../api';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  OPERATOR: 'bg-purple-100 text-purple-700',
  DRIVER: 'bg-green-100 text-green-700',
  PASSENGER: 'bg-blue-100 text-blue-700',
};

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data.data as any[];
    },
  });

  const filtered = (data || []).filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    PASSENGER: data?.filter((u: any) => u.role === 'PASSENGER').length || 0,
    DRIVER: data?.filter((u: any) => u.role === 'DRIVER').length || 0,
    OPERATOR: data?.filter((u: any) => u.role === 'OPERATOR').length || 0,
    ADMIN: data?.filter((u: any) => u.role === 'ADMIN').length || 0,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all registered users across all roles</p>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(counts).map(([role, count]) => (
          <div key={role} className="card p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(role)}>
            <p className={`text-2xl font-bold`}>{count}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[role]}`}>{role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="input pl-9 py-2.5"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input py-2.5 w-auto pr-8"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="PASSENGER">Passenger</option>
          <option value="DRIVER">Driver</option>
          <option value="OPERATOR">Operator</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Phone</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No users found</td></tr>
                ) : filtered.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {data?.length || 0} users
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
