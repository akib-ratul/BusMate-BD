import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Clock, MapPin, User, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  ACKNOWLEDGED: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  RESOLVED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

const AdminSos = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sos'],
    queryFn: async () => {
      const res = await api.get('/api/sos');
      return res.data.data as any[];
    },
    refetchInterval: 15000, // Auto-refresh every 15s
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/api/sos/${id}`, { status });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sos'] }),
  });

  const counts = {
    ACTIVE: data?.filter((a: any) => a.status === 'ACTIVE').length || 0,
    ACKNOWLEDGED: data?.filter((a: any) => a.status === 'ACKNOWLEDGED').length || 0,
    RESOLVED: data?.filter((a: any) => a.status === 'RESOLVED').length || 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOS Alerts</h1>
          <p className="text-gray-500 mt-1">Monitor and respond to emergency alerts in real-time</p>
        </div>
        {counts.ACTIVE > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-700 font-semibold text-sm">{counts.ACTIVE} Active Emergency</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', count: counts.ACTIVE, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Acknowledged', count: counts.ACKNOWLEDGED, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Resolved', count: counts.RESOLVED, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.count}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
      ) : !data || data.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldAlert className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No SOS alerts found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((alert: any) => {
            const s = statusColors[alert.status] || statusColors.RESOLVED;
            return (
              <div key={alert.id} className={`card p-5 border-l-4 ${alert.status === 'ACTIVE' ? 'border-l-red-500' : alert.status === 'ACKNOWLEDGED' ? 'border-l-yellow-400' : 'border-l-green-400'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2.5 rounded-xl ${s.bg} flex-shrink-0 mt-0.5`}>
                      <ShieldAlert className={`h-5 w-5 ${s.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{alert.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{alert.message || 'Emergency alert — no message provided'}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{alert.user?.name}</span>
                        {alert.lat && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{Number(alert.lat).toFixed(4)}, {Number(alert.lng).toFixed(4)}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(alert.createdAt).toLocaleString('en-BD')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {alert.status === 'ACTIVE' && (
                      <button onClick={() => updateMutation.mutate({ id: alert.id, status: 'ACKNOWLEDGED' })} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition-colors">
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button onClick={() => updateMutation.mutate({ id: alert.id, status: 'RESOLVED' })} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSos;
