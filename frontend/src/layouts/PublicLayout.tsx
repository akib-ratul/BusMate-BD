import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bus, Map, LogIn } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-xl group-hover:bg-primary-light transition-colors">
                <Bus className="h-6 w-6 text-accent" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-primary">BusMate</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex gap-8">
              <Link to="/routes" className="text-gray-600 hover:text-primary font-medium transition-colors">Find Route</Link>
              <Link to="/about" className="text-gray-600 hover:text-primary font-medium transition-colors">How it Works</Link>
              <Link to="/lost-found" className="text-gray-600 hover:text-primary font-medium transition-colors">Lost & Found</Link>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors">
                <LogIn className="h-5 w-5" />
                Login
              </Link>
              <Link to="/register" className="btn btn-primary shadow-lg shadow-primary/20 px-6 py-2.5 rounded-full font-semibold">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary text-gray-300 py-12 border-t border-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Bus className="h-6 w-6 text-accent" />
              <span className="font-bold text-2xl text-white">BusMate BD</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Your smart companion for Dhaka local buses. Real-time tracking, accurate ETAs, and a safer commuting experience.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/routes" className="hover:text-accent transition-colors">Find a Route</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} BusMate BD. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for Dhaka</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
