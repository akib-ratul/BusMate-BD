import React from 'react';
import { Shield, Clock, MapPin, Smartphone } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How BusMate Works</h1>
          <p className="text-xl text-gray-600">
            We are revolutionizing public transport in Dhaka by making it safer, more predictable, and fully digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Find Your Route</h3>
            <p className="text-gray-600">Enter your destination and we'll show you the best bus routes available instantly.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Track in Real-time</h3>
            <p className="text-gray-600">Watch your bus move on the live map and know exactly when it will arrive at your stop.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Digital Boarding</h3>
            <p className="text-gray-600">Generate a digital e-ticket right from the app. No need to carry exact change anymore.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Travel Safely</h3>
            <p className="text-gray-600">Use our SOS features and crowd reporting to ensure a safe and comfortable journey.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
