import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Phone, Save, Loader, CheckCircle } from 'lucide-react';
import api from '../../api';

const PassengerProfile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: '' });
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch('/api/auth/profile', form);
      return res.data;
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const roleColors: Record<string, string> = {
    PASSENGER: 'bg-blue-100 text-blue-700',
    DRIVER: 'bg-green-100 text-green-700',
    OPERATOR: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user?.role || ''] || 'bg-gray-100 text-gray-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card p-6 space-y-5">
        <h3 className="font-bold text-gray-900 text-lg">Edit Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="input pl-10 py-2.5"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input className="input pl-10 py-2.5 bg-gray-50 cursor-not-allowed" value={user?.email || ''} disabled />
          </div>
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="input pl-10 py-2.5"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.name}
          className="btn btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-60"
        >
          {mutation.isPending ? <><Loader className="h-4 w-4 animate-spin" /> Saving...</> : saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>

        {mutation.isError && <p className="text-sm text-red-600">Failed to save. Please try again.</p>}
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Account Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Account Type</dt>
            <dd className="font-medium text-gray-900 capitalize">{user?.role?.toLowerCase()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">User ID</dt>
            <dd className="font-mono text-xs text-gray-600">{user?.id?.slice(0, 12)}...</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PassengerProfile;
