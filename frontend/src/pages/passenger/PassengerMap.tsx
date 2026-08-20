import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Bus, Crosshair, Filter } from 'lucide-react';
import api from '../../api';
import { connectSocket, disconnectSocket } from '../../utils/socket';
import { useQuery } from '@tanstack/react-query';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Bus Icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // A free bus icon URL for demo
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  className: 'bus-marker-icon',
});

// Component to recenter map
const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const PassengerMap = () => {
  const [searchParams] = useSearchParams();
  const initialRouteId = searchParams.get('routeId') || 'all';

  const [activeBuses, setActiveBuses] = useState<Record<string, any>>({});
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.7937, 90.4066]); // Default: Banani, Dhaka

  const { data: routes } = useQuery({
    queryKey: ['all-routes'],
    queryFn: async () => {
      const res = await api.get('/api/routes');
      return res.data.data;
    }
  });

  useEffect(() => {
    // Initial fetch of active buses
    const fetchBuses = async () => {
      try {
        const res = await api.get('/api/buses');
        const active = res.data.data.filter((b: any) => b.status === 'ACTIVE' && b.currentLat && b.currentLng);
        const busMap: Record<string, any> = {};
        active.forEach((b: any) => {
          busMap[b.id] = b;
        });
        setActiveBuses(busMap);
      } catch (err) {
        console.error('Failed to fetch buses', err);
      }
    };
    fetchBuses();

    // Setup Socket.IO connection for real-time tracking
    const socket = connectSocket();

    socket.on('connect', () => {
      console.log('Connected to tracking server');
      // Subscribe to all routes for demo purposes
      if (routes) {
        routes.forEach((route: any) => {
          socket.emit('subscribe:route', route.id);
        });
      }
    });

    socket.on('bus:location', (data) => {
      setActiveBuses((prev) => ({
        ...prev,
        [data.busId]: {
          ...prev[data.busId],
          currentLat: data.lat,
          currentLng: data.lng,
          lastUpdated: data.timestamp
        }
      }));
    });

    // FAKE LIVE MOVEMENT FOR DEMO
    const movementInterval = setInterval(() => {
      setActiveBuses((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        
        Object.keys(next).forEach((busId) => {
          const bus = next[busId];
          if (bus && bus.currentLat && bus.currentLng) {
            // Add a tiny random offset to simulate movement
            const latOffset = (Math.random() - 0.5) * 0.0005;
            const lngOffset = (Math.random() - 0.5) * 0.0005;
            
            next[busId] = {
              ...bus,
              currentLat: bus.currentLat + latOffset,
              currentLng: bus.currentLng + lngOffset,
              lastUpdated: new Date().toISOString()
            };
            hasChanges = true;
          }
        });
        
        return hasChanges ? next : prev;
      });
    }, 2500);

    return () => {
      clearInterval(movementInterval);
      socket.off('bus:location');
      socket.off('connect');
      disconnectSocket();
    };
  }, [routes]);

  const handleRouteFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const routeId = e.target.value;
    setSelectedRouteId(routeId);
    
    if (routeId !== 'all') {
      // Find a bus on this route and center on it, or center on route start
      const routeBuses = Object.values(activeBuses).filter(b => b.routeId === routeId);
      if (routeBuses.length > 0) {
        setMapCenter([routeBuses[0].currentLat, routeBuses[0].currentLng]);
      }
    }
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not access your location. Please enable location services.");
        }
      );
    }
  };

  const busesToShow = selectedRouteId === 'all' 
    ? Object.values(activeBuses) 
    : Object.values(activeBuses).filter(b => b.routeId === selectedRouteId);

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Live Bus Map</h1>
          <p className="text-sm text-gray-500">Real-time tracking of active buses in Dhaka.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select 
              className="input pl-9 py-2 text-sm bg-gray-50 border-gray-200"
              value={selectedRouteId}
              onChange={handleRouteFilterChange}
            >
              <option value="all">All Routes</option>
              {routes?.map((route: any) => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={locateMe}
            className="btn btn-secondary p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
            title="My Location"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapRecenter center={mapCenter} />

          {busesToShow.map((bus: any) => (
            <Marker 
              key={bus.id} 
              position={[bus.currentLat, bus.currentLng]}
              icon={busIcon}
            >
              <Popup className="bus-popup">
                <div className="font-sans">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="bg-primary text-white p-1.5 rounded">
                      <Bus className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 m-0">{bus.name}</h4>
                      <p className="text-xs text-gray-500 m-0">{bus.busNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold text-gray-700">Route:</span> {bus.route?.name}</p>
                    <p><span className="font-semibold text-gray-700">Capacity:</span> {bus.capacity} seats</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Updated: {new Date(bus.lastUpdated || Date.now()).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button className="flex-1 py-1 text-xs font-semibold text-white bg-accent rounded hover:bg-accent-hover transition-colors">
                      View Route
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Live indicator overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200 flex items-center gap-2 z-[400]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">Live tracking</span>
        </div>
      </div>
    </div>
  );
};

export default PassengerMap;
