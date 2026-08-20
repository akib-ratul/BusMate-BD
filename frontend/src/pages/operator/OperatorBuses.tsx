import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bus, Plus, X, Edit2, Loader, Users, Navigation, CheckCircle } from 'lucide-react';
import api from '../../api';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
};

const emptyForm = { name: '', busNumber: '', capacity: 50, status: 'INACTIVE', routeId: '' };

const OperatorBuses = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const qc = useQueryClient();

  const { data: buses, isLoading } = useQuery({
    queryKey: ['operator-buses'],
    queryFn: async () => {
      const res = await api.get('/api/buses');
      return res.data.data as any[];
    },
  });

  const { data: routes } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const res = await api.get('/api/routes');
      return res.data.data as any[];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        return api.put(`/api/buses/${editId}`, form);
      }
      return api.post('/api/buses', form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operator-buses'] });
      setShowForm(false);
      setEditId(null);
      setForm({ ...emptyForm });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/buses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operator-buses'] }),
  });

  const openEdit = (bus: any) => {
    setForm({ name: bus.name, busNumber: bus.busNumber, capacity: bus.capacity, status: bus.status, routeId: bus.routeId || '' });
    setEditId(bus.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-500 mt-1">Manage your buses, routes, and assignments</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} className="btn btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="h-4 w-4" /> Add Bus
        </button>
      </div>

      {/* Summary */}
      {buses && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Buses', value: buses.length, color: 'text-primary' },
            { label: 'Active', value: buses.filter((b: any) => b.status === 'ACTIVE').length, color: 'text-green-600' },
            { label: 'In Maintenance', value: buses.filter((b: any) => b.status === 'MAINTENANCE').length, color: 'text-yellow-600' },
          ].map(stat => (
            <div key={stat.label} className="card p-5 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editId ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus Name *</label>
                  <input className="input py-2.5" placeholder="e.g. Mirpur Express" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number *</label>
                  <input className="input py-2.5" placeholder="e.g. DHA-01-1234" value={form.busNumber} onChange={e => setForm(f => ({ ...f, busNumber: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" className="input py-2.5" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input py-2.5" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Route</label>
                <select className="input py-2.5" value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}>
                  <option value="">No Route</option>
                  {routes?.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.busNumber} className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {mutation.isPending ? <><Loader className="h-4 w-4 animate-spin" /> Saving...</> : editId ? 'Update Bus' : 'Add Bus'}
              </button>
              {mutation.isError && <p className="text-sm text-red-600 text-center">Failed. Please try again.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Bus List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(buses || []).map((bus: any) => (
            <div key={bus.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Bus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bus.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{bus.busNumber}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[bus.status]}`}>{bus.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="h-4 w-4" /> {bus.capacity} seats
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Navigation className="h-4 w-4" /> {bus.route?.name || 'No route'}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(bus)} className="flex-1 btn py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => deleteMutation.mutate(bus.id)} className="flex-1 btn py-2 text-sm border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1">
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperatorBuses;
