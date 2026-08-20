import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import PassengerRoutes from './pages/passenger/PassengerRoutes';
import PassengerMap from './pages/passenger/PassengerMap';
import PassengerAiAssistant from './pages/passenger/PassengerAiAssistant';
import DriverDashboard from './pages/driver/DriverDashboard';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';


// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Temporary placeholder component
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <h1 className="text-2xl font-bold text-gray-400">{title}</h1>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Placeholder title="Register Page" />} />
              <Route path="/routes" element={<PassengerRoutes />} />
              <Route path="/about" element={<Placeholder title="About Us" />} />
              <Route path="/lost-found" element={<Placeholder title="Public Lost & Found" />} />
            </Route>

            {/* Passenger Routes */}
            <Route element={<ProtectedRoute allowedRoles={['PASSENGER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
                <Route path="/passenger/routes" element={<PassengerRoutes />} />
                <Route path="/passenger/map" element={<PassengerMap />} />
                <Route path="/passenger/ai-assistant" element={<PassengerAiAssistant />} />
                <Route path="/passenger/trips" element={<Placeholder title="My Trips" />} />
                <Route path="/passenger/safety" element={<Placeholder title="SOS Safety" />} />
                <Route path="/passenger/lost-found" element={<Placeholder title="Lost & Found" />} />
                <Route path="/passenger/profile" element={<Placeholder title="Profile" />} />
              </Route>
            </Route>

            {/* Driver Routes */}
            <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="/driver/tracking" element={<Placeholder title="Live Tracking" />} />
                <Route path="/driver/bus" element={<Placeholder title="My Bus" />} />
                <Route path="/driver/profile" element={<Placeholder title="Profile" />} />
              </Route>
            </Route>

            {/* Operator Routes */}
            <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
              <Route element={<MainLayout />}>
                <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                <Route path="/operator/buses" element={<Placeholder title="Fleet Management" />} />
                <Route path="/operator/analytics" element={<Placeholder title="Analytics" />} />
                <Route path="/operator/profile" element={<Placeholder title="Profile" />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<Placeholder title="User Management" />} />
                <Route path="/admin/routes" element={<Placeholder title="Route Management" />} />
                <Route path="/admin/buses" element={<Placeholder title="Bus Management" />} />
                <Route path="/admin/sos" element={<Placeholder title="SOS Alerts" />} />
                <Route path="/admin/analytics" element={<Placeholder title="System Analytics" />} />
                <Route path="/admin/system" element={<Placeholder title="System Settings" />} />
                <Route path="/admin/profile" element={<Placeholder title="Profile" />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
