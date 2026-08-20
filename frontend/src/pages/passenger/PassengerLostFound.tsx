import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, X, Search, Clock, MapPin, Loader, CheckCircle } from 'lucide-react';
import api from '../../api';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  MATCHED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const PassengerLostFound = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'LOST', title: '', description: '', location: '', date: '' });
  const [filter, setFilter] = useState('ALL');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['lost-found'],
    queryFn: async () => {
      const res = await api.get('/api/lost-found');
      return res.data.data as any[];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/lost-found', {
        ...form,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] });
      setShowForm(false);
      setForm({ type: 'LOST', title: '', description: '', location: '', date: '' });
    },
  });

  const filtered = data?.filter(item =>
    filter === 'ALL' || item.type === filter
  ) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
          <p className="text-gray-500 mt-1">Report or find items lost on Dhaka buses</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="h-4 w-4" />
          Report Item
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'LOST', 'FOUND'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900">Report an Item</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['LOST', 'FOUND'].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-3 rounded-xl font-semibold border-2 transition-all ${form.type === t ? (t === 'LOST' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700') : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {t === 'LOST' ? '😢 I Lost Something' : '🎉 I Found Something'}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Title *</label>
                <input className="input py-2.5" placeholder="e.g. Black leather wallet" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea className="input resize-none" rows={3} placeholder="Describe the item in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input className="input py-2.5" placeholder="e.g. Farmgate bus stop" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" className="input py-2.5" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !form.title || !form.description || !form.location}
                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {mutation.isPending ? <><Loader className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Report'}
              </button>
              {mutation.isSuccess && <p className="text-green-600 text-sm text-center flex items-center justify-center gap-1"><CheckCircle className="h-4 w-4" /> Report submitted!</p>}
              {mutation.isError && <p className="text-red-600 text-sm text-center">Failed to submit. Please try again.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No items reported yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item: any) => (
            <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status]}`}>{item.status}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(item.date).toLocaleDateString('en-BD')}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Reported by: {item.user?.name || 'Anonymous'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassengerLostFound;
