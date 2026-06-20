import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../contexts/translationContext';
import { MapPin, Droplets, Info, Sun, Percent, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icons hotfix for webpack/vite bundling
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface FarmMonitoringProps {
  user: any;
  token: string;
}

export const FarmMonitoring: React.FC<FarmMonitoringProps> = ({ user, token }) => {
  const { t } = useTranslation();
  const [farm, setFarm] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Irrigation variables
  const [soilMoisture, setSoilMoisture] = useState(38); // percentage
  const [waterSuggested, setWaterSuggested] = useState(1200); // liters
  const [irrigationMode, setIrrigationMode] = useState<'Manual' | 'Smart AI'>('Smart AI');

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  useEffect(() => {
    // Fetch Farm
    fetch(`${API_URL}/farms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setFarm(data[0]);
      })
      .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
    // Initialize Leaflet Map (Centering on farmer location)
    if (!mapRef.current) {
      const lat = 18.5204;
      const lon = 73.8567;
      
      const map = L.map('monitoring-map', { zoomControl: false }).setView([lat, lon], 12);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Markers: Farmer location, APMC market, and agricultural office
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>My Farm Location</b><br/>Owner: ${user.name}`)
        .openPopup();

      L.marker([18.5144, 73.8647])
        .addTo(map)
        .bindPopup('<b>Pune APMC Market</b><br/>Daily crop arrivals and trading desk.');

      L.marker([18.5304, 73.8467])
        .addTo(map)
        .bindPopup('<b>District Agriculture Office</b><br/>Subsidy application verification branch.');
        
      L.marker([18.5284, 73.8747])
        .addTo(map)
        .bindPopup('<b>Emergency Clinic Hospital</b><br/>Medical emergency help center.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [user]);

  // Generate NDVI mock canvas heatmap
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 300;
        canvas.height = 180;

        // Draw background grid representing farm fields
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render NDVI color segments (Green represents high density, red low, yellow harvest ready)
        const fieldWidth = canvas.width / 3;
        const fieldHeight = canvas.height / 2;

        // Field 1: High health
        ctx.fillStyle = 'rgba(22, 163, 74, 0.75)'; // green
        ctx.fillRect(5, 5, fieldWidth - 10, fieldHeight - 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Outfit';
        ctx.fillText('NDVI: 0.72 (Optimal)', 12, 22);

        // Field 2: Average health
        ctx.fillStyle = 'rgba(234, 179, 8, 0.65)'; // yellow
        ctx.fillRect(fieldWidth + 5, 5, fieldWidth - 10, fieldHeight - 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NDVI: 0.58 (Ripe)', fieldWidth + 12, 22);

        // Field 3: Dry/Sparse vegetation
        ctx.fillStyle = 'rgba(239, 68, 68, 0.55)'; // red
        ctx.fillRect(fieldWidth * 2 + 5, 5, fieldWidth - 10, fieldHeight - 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NDVI: 0.31 (Dry)', fieldWidth * 2 + 12, 22);

        // Field 4: Sowed
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.fillRect(5, fieldHeight + 5, fieldWidth - 10, fieldHeight - 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NDVI: 0.68 (Growing)', 12, fieldHeight + 22);

        // Field 5: Sowed
        ctx.fillStyle = 'rgba(21, 128, 61, 0.7)';
        ctx.fillRect(fieldWidth + 5, fieldHeight + 5, fieldWidth - 10, fieldHeight - 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NDVI: 0.65 (Healthy)', fieldWidth + 12, fieldHeight + 22);

        // Field 6: Harvesting done
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)'; // grey
        ctx.fillRect(fieldWidth * 2 + 5, fieldHeight + 5, fieldWidth - 10, fieldHeight - 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NDVI: 0.15 (Harvested)', fieldWidth * 2 + 12, fieldHeight + 22);
      }
    }
  }, [farm]);

  // Adjust suggested water on humidity changes simulation
  const triggerWaterCheck = () => {
    const val = Math.floor(Math.random() * 40) + 20;
    setSoilMoisture(val);
    if (val < 30) {
      setWaterSuggested(1800); // Low moisture needs more water
    } else if (val > 55) {
      setWaterSuggested(400); // Already wet needs less water
    } else {
      setWaterSuggested(1000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center space-x-3 glass-panel p-4">
        <Droplets className="w-8 h-8 text-sky-400" />
        <div>
          <h2 className="text-xl font-bold text-white">{t('monitoring.title')}</h2>
          <p className="text-xs text-slate-400">Satellite NDVI monitoring and smart watering schedule advisor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Map & NDVI visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leaflet Map container */}
          <div className="glass-panel p-4 space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Mandi, Officer & Emergency Map</span>
              <span className="text-[10px] text-slate-400">Offline Caching Active</span>
            </div>
            
            {/* Map Canvas div */}
            <div className="relative h-96 w-full rounded-xl overflow-hidden border border-slate-800">
              <div id="monitoring-map" className="w-full h-full"></div>
            </div>
          </div>

          {/* NDVI Heatmap */}
          <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-white">{t('monitoring.ndvi')}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Vegetation density maps computed from mock satellite reflectance</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-farm-green-600"></span>
                  <span>0.6 - 0.8 : Optimal Leaf Chlorophyll density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-yellow-500"></span>
                  <span>0.4 - 0.6 : Ripe / Sowing growth stages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-red-500"></span>
                  <span>Below 0.4 : Dry stress / Water shortage</span>
                </div>
              </div>
            </div>

            {/* Canvas overlay */}
            <div className="flex items-center justify-center bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
              <canvas ref={canvasRef} className="rounded-lg shadow-inner max-w-full" />
            </div>
          </div>
        </div>

        {/* Right Column: Smart Irrigation Advisor */}
        <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{t('monitoring.irrigation')}</h3>
              <span className="text-[10px] px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-500/20 font-bold rounded-lg uppercase">
                {irrigationMode}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">Computes moisture thresholds based on satellite vegetation health scores and local relative humidity forecasts.</p>
            
            {/* Moisture Progress circle */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950/60">
                <Droplets className="w-8 h-8 text-sky-400 animate-bounce" />
                <span className="text-2xl font-black text-white mt-1">{soilMoisture}%</span>
                <span className="text-[9px] uppercase text-slate-500 font-bold">Soil Moisture</span>
              </div>
              
              <button
                onClick={triggerWaterCheck}
                className="mt-4 px-4 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Scan Soil Sensor
              </button>
            </div>

            {/* Moisture advice status */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">{t('monitoring.water')}</span>
              <div className="text-lg font-black text-white">{waterSuggested} Liters / Acre</div>
              <p className="text-[10px] text-sky-400 font-medium">Recommended Drip Duration: {Math.round(waterSuggested / 35)} mins</p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            {/* Smart trigger toggles */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Enable Smart AI Valve</span>
              <button
                onClick={() => setIrrigationMode(prev => prev === 'Smart AI' ? 'Manual' : 'Smart AI')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  irrigationMode === 'Smart AI' ? 'bg-farm-green-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  irrigationMode === 'Smart AI' ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="p-3 bg-sky-950/20 border border-sky-500/10 rounded-xl flex items-start space-x-2.5 text-[10px] text-slate-400">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Drip schedule runs auto-water sprays daily at 06:30 AM if soil moisture drops below 35%.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
