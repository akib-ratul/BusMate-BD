import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Loader, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../api';

const AdminSystem = () => {
  const [saved, setSaved] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/settings');
      return res.data.data as { key: string; value: string }[];
    },
  });

  const [edits, setEdits] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return api.patch(`/api/analytics/settings/${key}`, { value });
    },
    onSuccess: (_, { key }) => {
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
      qc.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  const settings = data || [];

  const labels: Record<string, { label: string; desc: string; type?: string }> = {
    platform_name: { label: 'Platform Name', desc: 'The public name of the platform' },
    fare_per_km: { label: 'Fare Per KM (৳)', desc: 'Base fare rate per kilometer', type: 'number' },
    min_fare: { label: 'Minimum Fare (৳)', desc: 'Minimum fare for any trip', type: 'number' },
    crowd_report_interval_min: { label: 'Crowd Report Interval (min)', desc: 'Minimum minutes between crowd reports', type: 'number' },
    maintenance_mode: { label: 'Maintenance Mode', desc: 'Set to "true" to put the platform in maintenance mode' },
    announcement: { label: 'Public Announcement', desc: 'Announcement shown to all users' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure global platform settings</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
      ) : settings.length === 0 ? (
        <div className="card p-12 text-center">
          <Settings className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No settings available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map((s) => {
            const meta = labels[s.key];
            const currentVal = edits[s.key] !== undefined ? edits[s.key] : s.value;
            return (
              <div key={s.key} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-0.5">
                      {meta?.label || s.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </label>
                    {meta?.desc && <p className="text-xs text-gray-400 mb-2">{meta.desc}</p>}
                    <input
                      type={meta?.type || 'text'}
                      className="input py-2"
                      value={currentVal}
                      onChange={e => setEdits(ed => ({ ...ed, [s.key]: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={() => mutation.mutate({ key: s.key, value: currentVal })}
                    disabled={mutation.isPending || currentVal === s.value}
                    className="mt-7 flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {saved === s.key ? <><CheckCircle className="h-4 w-4" /> Saved</> : mutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSystem;
