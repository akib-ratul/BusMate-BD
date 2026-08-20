import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, User, Phone, Briefcase, FileText, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['PASSENGER', 'DRIVER', 'OPERATOR']),
  licenseNumber: z.string().optional(),
  organizationName: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(d => d.role !== 'DRIVER' || (d.licenseNumber && d.licenseNumber.length > 3), {
  message: 'License number is required for drivers',
  path: ['licenseNumber'],
}).refine(d => d.role !== 'OPERATOR' || (d.organizationName && d.organizationName.length > 2), {
  message: 'Organization name is required for operators',
  path: ['organizationName'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const ROLES = [
  { value: 'PASSENGER', label: 'Passenger', desc: 'Find and track buses', icon: '🚌' },
  { value: 'DRIVER',    label: 'Driver',    desc: 'Manage your bus route', icon: '🚗' },
  { value: 'OPERATOR',  label: 'Operator',  desc: 'Manage your fleet', icon: '🏢' },
] as const;

const Register = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'PASSENGER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', data);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        const role = res.data.data.user.role.toLowerCase();
        navigate(`/${role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="bg-primary p-3 rounded-2xl">
            <Bus className="h-10 w-10 text-accent" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-light">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-card sm:rounded-2xl border border-gray-100">

          {error && (
            <div className="mb-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <label
                    key={r.value}
                    className={`relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRole === r.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                    <span className="text-2xl mb-1">{r.icon}</span>
                    <span className={`text-sm font-semibold ${selectedRole === r.value ? 'text-primary' : 'text-gray-700'}`}>{r.label}</span>
                    <span className="text-xs text-gray-400 text-center mt-0.5">{r.desc}</span>
                    {selectedRole === r.value && (
                      <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Anika Rahman"
                  className={`input pl-10 py-2.5 ${errors.name ? 'border-danger' : ''}`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-10 py-2.5 ${errors.email ? 'border-danger' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400">(optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="input pl-10 py-2.5"
                />
              </div>
            </div>

            {/* Driver-specific */}
            {selectedRole === 'DRIVER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver License Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('licenseNumber')}
                    type="text"
                    placeholder="DL-2024-XXXXX"
                    className={`input pl-10 py-2.5 ${errors.licenseNumber ? 'border-danger' : ''}`}
                  />
                </div>
                {errors.licenseNumber && <p className="mt-1 text-sm text-danger">{errors.licenseNumber.message}</p>}
              </div>
            )}

            {/* Operator-specific */}
            {selectedRole === 'OPERATOR' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('organizationName')}
                    type="text"
                    placeholder="ABC Transport Ltd."
                    className={`input pl-10 py-2.5 ${errors.organizationName ? 'border-danger' : ''}`}
                  />
                </div>
                {errors.organizationName && <p className="mt-1 text-sm text-danger">{errors.organizationName.message}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Min. 8 characters"
                  className={`input pl-10 py-2.5 ${errors.password ? 'border-danger' : ''}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Repeat your password"
                  className={`input pl-10 py-2.5 ${errors.confirmPassword ? 'border-danger' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-danger">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-base flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            By registering, you agree to BusMate BD's Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
