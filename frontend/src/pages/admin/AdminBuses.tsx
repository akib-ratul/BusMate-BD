import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bus, Plus, X, Edit2, Loader, Users, Navigation } from 'lucide-react';
import api from '../../api';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
};

const emptyForm = { name: '', busNumber: '', capacity: 50, status: 'INACTIVE', routeId: '', operatorId: '' };

const AdminBuses = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const qc = useQueryClient();

  const { data: buses, isLoading } = useQuery({ queryKey: ['all-buses'], queryFn: async () => (await api.get('/api/buses')).data.data as any[] });
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: async () => (await api.get('/api/routes')).data.data as any[] });
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/api/users')).data.data as any[] });

  const operators = users?.filter((u: any) => u.role === 'OPERATOR') || [];

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, capacity: parseInt(form.capacity as any) };
      if (editId) return api.put(`/api/buses/${editId}`, payload);
      return api.post('/api/buses', payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-buses'] }); setShowForm(false); setEditId(null); setForm({ ...emptyForm }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/buses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-buses'] }),
  });

  const openEdit = (b: any) => {
    setForm({ name: b.name, busNumber: b.busNumber, capacity: b.capacity, status: b.status, routeId: b.routeId || '', operatorId: b.operatorId || '' });
    setEditId(b.id); setShowForm(true);
  };

  const filtered = (buses || []).filter((b: any) => statusFilter === 'ALL' || b.status === statusFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bus Management</h1>
          <p className="text-gray-500 mt-1">Manage all buses across all operators</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} className="btn btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="h-4 w-4" /> Add Bus
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50'}`}>{s}</button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editId ? 'Edit Bus' : 'Add Bus'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus Name *</label>
                  <input className="input py-2.5" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mirpur Express" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number *</label>
                  <input className="input py-2.5" value={form.busNumber} onChange={e => setForm(f => ({ ...f, busNumber: e.target.value }))} placeholder="DHA-01-1234" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" className="input py-2.5" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input py-2.5" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                <select className="input py-2.5" value={form.operatorId} onChange={e => setForm(f => ({ ...f, operatorId: e.target.value }))}>
                  <option value="">Select Operator</option>
                  {operators.map((o: any) => <option key={o.id} value={o.transportOperator?.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select className="input py-2.5" value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}>
                  <option value="">No Route</option>
                  {routes?.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.busNumber} className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {mutation.isPending ? <><Loader className="h-4 w-4 animate-spin" />Saving...</> : editId ? 'Update' : 'Add Bus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Bus</th>
                  <th className="px-5 py-3 text-left">Operator</th>
                  <th className="px-5 py-3 text-left">Route</th>
                  <th className="px-5 py-3 text-left">Cap.</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{b.busNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{b.operator?.organizationName || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{b.route?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{b.capacity}</td>
                    <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[b.status]}`}>{b.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteMutation.mutate(b.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><X className="h-4 w-4" /></button>
                      </div>
                    </td>
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

export default AdminBuses;
