import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public / Auth Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import About from './pages/public/About';
import LostFoundPublic from './pages/public/LostFoundPublic';

// Passenger Pages
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import PassengerRoutes from './pages/passenger/PassengerRoutes';
import PassengerMap from './pages/passenger/PassengerMap';
import PassengerAiAssistant from './pages/passenger/PassengerAiAssistant';
import PassengerTrips from './pages/passenger/PassengerTrips';
import PassengerSafety from './pages/passenger/PassengerSafety';
import PassengerLostFound from './pages/passenger/PassengerLostFound';
import PassengerProfile from './pages/passenger/PassengerProfile';
import PassengerFare from './pages/passenger/PassengerFare';
import PassengerCrowd from './pages/passenger/PassengerCrowd';
import PassengerRating from './pages/passenger/PassengerRating';
import PassengerNotifications from './pages/passenger/PassengerNotifications';
import PassengerTicket from './pages/passenger/PassengerTicket';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverTracking from './pages/driver/DriverTracking';
import DriverBus from './pages/driver/DriverBus';

// Operator Pages
import OperatorDashboard from './pages/operator/OperatorDashboard';
import OperatorBuses from './pages/operator/OperatorBuses';
import OperatorAnalytics from './pages/operator/OperatorAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminBuses from './pages/admin/AdminBuses';
import AdminSos from './pages/admin/AdminSos';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSystem from './pages/admin/AdminSystem';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/lost-found" element={<LostFoundPublic />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/routes" element={<PassengerRoutes />} />
            </Route>

            {/* Passenger Routes */}
            <Route element={<ProtectedRoute allowedRoles={['PASSENGER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
                <Route path="/passenger/routes" element={<PassengerRoutes />} />
                <Route path="/passenger/map" element={<PassengerMap />} />
                <Route path="/passenger/ai-assistant" element={<PassengerAiAssistant />} />
                <Route path="/passenger/trips" element={<PassengerTrips />} />
                <Route path="/passenger/safety" element={<PassengerSafety />} />
                <Route path="/passenger/lost-found" element={<PassengerLostFound />} />
                <Route path="/passenger/profile" element={<PassengerProfile />} />
                <Route path="/passenger/fare" element={<PassengerFare />} />
                <Route path="/passenger/crowd" element={<PassengerCrowd />} />
                <Route path="/passenger/rate" element={<PassengerRating />} />
                <Route path="/passenger/notifications" element={<PassengerNotifications />} />
                <Route path="/passenger/ticket" element={<PassengerTicket />} />
              </Route>
            </Route>

            {/* Driver Routes */}
            <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="/driver/tracking" element={<DriverTracking />} />
                <Route path="/driver/bus" element={<DriverBus />} />
                <Route path="/driver/profile" element={<PassengerProfile />} />
              </Route>
            </Route>

            {/* Operator Routes */}
            <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
              <Route element={<MainLayout />}>
                <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                <Route path="/operator/buses" element={<OperatorBuses />} />
                <Route path="/operator/analytics" element={<OperatorAnalytics />} />
                <Route path="/operator/profile" element={<PassengerProfile />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/routes" element={<AdminRoutes />} />
                <Route path="/admin/buses" element={<AdminBuses />} />
                <Route path="/admin/sos" element={<AdminSos />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/system" element={<AdminSystem />} />
                <Route path="/admin/profile" element={<PassengerProfile />} />
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
