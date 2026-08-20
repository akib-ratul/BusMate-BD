import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Info, ShieldAlert, Navigation, Loader, CheckCircle2, Clock } from 'lucide-react';
import api from '../../api';

const iconMap: Record<string, any> = {
  SYSTEM: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' },
  SOS: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100' },
  ROUTE_UPDATE: { icon: Navigation, color: 'text-purple-500', bg: 'bg-purple-100' },
  DEFAULT: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' }
};

const PassengerNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const res = await api.get('/api/notifications');
      return res.data.data;
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/api/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    }
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await api.patch('/api/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    }
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Updates, alerts, and system announcements.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-sm font-semibold text-primary hover:text-primary-light flex items-center gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notifications.map((notification: any) => {
              const style = iconMap[notification.type] || iconMap.DEFAULT;
              const Icon = style.icon;
              return (
                <div 
                  key={notification.id} 
                  className={`p-5 flex gap-4 transition-colors ${notification.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-semibold ${notification.isRead ? 'text-gray-900' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                      {notification.message}
                    </p>
                    
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead.mutate(notification.id)}
                        disabled={markAsRead.isPending}
                        className="mt-3 text-xs font-semibold text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerNotifications;
