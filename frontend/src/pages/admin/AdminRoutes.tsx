import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation, Plus, X, Edit2, Loader, MapPin } from 'lucide-react';
import api from '../../api';

const emptyForm = { name: '', startPoint: '', endPoint: '', distance: '', estimatedDuration: '', baseFare: '', isActive: true };

const AdminRoutes = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const qc = useQueryClient();

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => (await api.get('/api/routes')).data.data as any[],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        distance: parseFloat(form.distance as any),
        estimatedDuration: parseInt(form.estimatedDuration as any),
        baseFare: parseFloat(form.baseFare as any),
      };
      if (editId) return api.put(`/api/routes/${editId}`, payload);
      return api.post('/api/routes', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routes'] });
      setShowForm(false); setEditId(null); setForm({ ...emptyForm });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/routes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routes'] }),
  });

  const openEdit = (r: any) => {
    setForm({ name: r.name, startPoint: r.startPoint, endPoint: r.endPoint, distance: r.distance, estimatedDuration: r.estimatedDuration, baseFare: r.baseFare, isActive: r.isActive });
    setEditId(r.id); setShowForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
          <p className="text-gray-500 mt-1">Manage all Dhaka bus routes</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} className="btn btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="h-4 w-4" /> Add Route
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editId ? 'Edit Route' : 'Add New Route'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                <input className="input py-2.5" placeholder="e.g. Mirpur–Farmgate Express" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Point *</label>
                  <input className="input py-2.5" placeholder="e.g. Mirpur 10" value={form.startPoint} onChange={e => setForm(f => ({ ...f, startPoint: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Point *</label>
                  <input className="input py-2.5" placeholder="e.g. Farmgate" value={form.endPoint} onChange={e => setForm(f => ({ ...f, endPoint: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input type="number" className="input py-2.5" placeholder="10.5" value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" className="input py-2.5" placeholder="45" value={form.estimatedDuration} onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare (৳)</label>
                  <input type="number" className="input py-2.5" placeholder="25" value={form.baseFare} onChange={e => setForm(f => ({ ...f, baseFare: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Route</label>
              </div>
              <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {mutation.isPending ? <><Loader className="h-4 w-4 animate-spin" /> Saving...</> : editId ? 'Update Route' : 'Add Route'}
              </button>
              {mutation.isError && <p className="text-sm text-red-600 text-center">Error saving route. Please try again.</p>}
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
                  <th className="px-5 py-3 text-left">Route</th>
                  <th className="px-5 py-3 text-left">Points</th>
                  <th className="px-5 py-3 text-left">Distance</th>
                  <th className="px-5 py-3 text-left">Fare</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(routes || []).map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="font-medium text-gray-900">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.startPoint} → {r.endPoint}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.distance}km • {r.estimatedDuration}min</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">৳{r.baseFare}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteMutation.mutate(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><X className="h-4 w-4" /></button>
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

export default AdminRoutes;
