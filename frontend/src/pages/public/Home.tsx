import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, Bus, Clock, ShieldCheck, Map, Smartphone, MessageSquare } from 'lucide-react';

const DHAKA_LOCATIONS = [
  "Mirpur 10", "Mirpur 1", "Shewrapara", "Farmgate", "Karwan Bazar", 
  "Shahbagh", "Motijheel", "Uttara", "Banani", "Gulshan 1", "Gulshan 2", 
  "Mohammadpur", "Jatrabari", "Sayedabad", "Dhanmondi 27", "Bashundhara", "Airport Road"
].sort();

const Home = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
      navigate(`/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625227702157-fc7fc051efec?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent font-semibold text-sm mb-6 border border-accent/30">
            Available in Dhaka City
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Navigate Dhaka <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-green-400">Smarter.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto mb-10">
            Find buses, track them live, check crowd levels, calculate fares, and travel safer with BusMate BD.
          </p>

          {/* Quick Search Box */}
          <div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-shadow outline-none text-gray-800 font-medium appearance-none"
                >
                  <option value="" disabled>Where from? (e.g. Mirpur)</option>
                  {DHAKA_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-shadow outline-none text-gray-800 font-medium appearance-none"
                >
                  <option value="" disabled>Where to? (e.g. Gulshan)</option>
                  {DHAKA_LOCATIONS.map(loc => (
                    <option key={loc} value={loc} disabled={loc === from}>{loc}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                disabled={!from || !to}
                className="btn btn-accent rounded-xl py-3 px-8 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
              >
                <Search className="h-5 w-5 mr-2" />
                Find Bus
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need for your commute</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              BusMate brings modern technology to local public transport, making your journey predictable and safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Tracking</h3>
              <p className="text-gray-600">See exactly where your bus is on the map. No more guessing when it will arrive.</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-accent/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-accent-hover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart ETAs</h3>
              <p className="text-gray-600">Get accurate estimated arrival times based on real-time traffic and distance.</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Bus className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Crowd Status</h3>
              <p className="text-gray-600">Know how crowded a bus is before it arrives, thanks to community reports.</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">SOS Safety</h3>
              <p className="text-gray-600">Quickly alert administrators in case of an emergency with your live location.</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fare Calculator</h3>
              <p className="text-gray-600">Calculate exact fares for your journey to avoid disputes with conductors.</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">Ask our AI for travel advice, best routes, and current conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-light py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your daily commute?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of passengers already using BusMate BD to navigate Dhaka efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-accent px-8 py-3 rounded-full text-lg shadow-lg shadow-accent/20">
              Create Free Account
            </Link>
            <Link to="/routes" className="btn border border-gray-600 text-white hover:bg-white/10 px-8 py-3 rounded-full text-lg">
              Explore Routes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
