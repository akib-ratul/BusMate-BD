import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bus, Map, LogOut, Menu, X, User, 
  LayoutDashboard, ShieldAlert, Navigation, 
  Settings, Users, BarChart3, Bell, HelpCircle, 
  MessageSquare, Briefcase, Ticket, Star
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const passengerLinks = [
    { name: 'Dashboard', path: '/passenger/dashboard', icon: LayoutDashboard },
    { name: 'Routes', path: '/passenger/routes', icon: Navigation },
    { name: 'Live Map', path: '/passenger/map', icon: Map },
    { name: 'My Tickets', path: '/passenger/ticket', icon: Ticket },
    { name: 'Notifications', path: '/passenger/notifications', icon: Bell },
    { name: 'AI Assistant', path: '/passenger/ai-assistant', icon: MessageSquare },
    { name: 'My Trips', path: '/passenger/trips', icon: Bus },
    { name: 'Report Crowd', path: '/passenger/crowd', icon: Users },
    { name: 'Rate Us', path: '/passenger/rate', icon: Star },
    { name: 'Safety SOS', path: '/passenger/safety', icon: ShieldAlert },
    { name: 'Lost & Found', path: '/passenger/lost-found', icon: Briefcase },
  ];

  const driverLinks = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { name: 'Tracking', path: '/driver/tracking', icon: Navigation },
    { name: 'My Bus', path: '/driver/bus', icon: Bus },
  ];

  const operatorLinks = [
    { name: 'Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
    { name: 'Fleet Management', path: '/operator/buses', icon: Bus },
    { name: 'Analytics', path: '/operator/analytics', icon: BarChart3 },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Routes', path: '/admin/routes', icon: Navigation },
    { name: 'Buses', path: '/admin/buses', icon: Bus },
    { name: 'SOS Alerts', path: '/admin/sos', icon: ShieldAlert },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'System', path: '/admin/system', icon: Settings },
  ];

  let links = [];
  if (user?.role === 'PASSENGER') links = passengerLinks;
  else if (user?.role === 'DRIVER') links = driverLinks;
  else if (user?.role === 'OPERATOR') links = operatorLinks;
  else if (user?.role === 'ADMIN') links = adminLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Bus className="h-6 w-6 text-accent" />
          <span>BusMate BD</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:sticky top-0 left-0 h-full w-64 bg-primary text-white flex flex-col z-40
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-primary-light">
          <Bus className="h-8 w-8 text-accent" />
          <span className="font-bold text-2xl tracking-tight">BusMate</span>
        </div>

        <div className="p-4 flex items-center gap-3 bg-primary-light">
          <div className="bg-white/10 p-2 rounded-full">
            <User className="h-6 w-6" />
          </div>
          <div className="overflow-hidden">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-300 capitalize">{user?.role.toLowerCase()}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive ? 'bg-accent text-white' : 'hover:bg-primary-light text-gray-300 hover:text-white'}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-danger/20 hover:text-danger transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full min-h-screen overflow-x-hidden">
        {/* Top Navbar (Desktop) */}
        <header className="hidden md:flex bg-white shadow-sm h-16 items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname.split('/')[2] || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-primary relative rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger"></span>
            </button>
            <Link to={`/${user?.role.toLowerCase()}/profile`} className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 transition-colors">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
