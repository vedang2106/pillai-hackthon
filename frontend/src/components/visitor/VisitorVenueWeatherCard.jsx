import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Thermometer, MapPin, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { aiApi } from '../../services/api';

export default function VisitorVenueWeatherCard({ event }) {
  const [weather, setWeather] = useState({
    location: 'Event Venue',
    temperatureC: 28.5,
    humidityPct: 65,
    rainfallMm: 0.0,
    windSpeedKmh: 12.0,
    weatherCode: 0,
    loading: true
  });

  const venueLat = event?.venue?.latitude || 19.0330;
  const venueLon = event?.venue?.longitude || 73.0297;
  const venueName = event?.venue?.name || event?.name || 'Event Venue';
  const venueAddress = event?.venue?.address || '';

  const fetchWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true }));
    try {
      const res = await aiApi.getLiveWeather(venueLat, venueLon);
      if (res.data) {
        setWeather({
          location: `${venueName}${venueAddress ? `, ${venueAddress}` : ''}`,
          temperatureC: res.data.temperatureC ?? 28.5,
          humidityPct: res.data.humidityPct ?? 65,
          rainfallMm: res.data.rainfallMm ?? 0.0,
          windSpeedKmh: res.data.windSpeedKmh ?? 12.0,
          weatherCode: res.data.weatherCode ?? 0,
          loading: false
        });
      }
    } catch (err) {
      console.error('Error fetching visitor weather:', err);
      setWeather(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [event]);

  const isRaining = weather.rainfallMm > 15;
  const isExtremeHeat = weather.temperatureC > 38;

  return (
    <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 shadow-xl border border-sky-900/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 font-extrabold text-xs mb-2">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Venue Live Weather Telemetry</span>
          </div>
          <h3 className="text-xl font-black text-white">{weather.location}</h3>
          <p className="text-slate-400 text-xs mt-0.5">Real-time environmental observations for event visitors.</p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchWeather}
          disabled={weather.loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${weather.loading ? 'animate-spin' : ''}`} />
          <span>Refresh Weather</span>
        </button>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Temperature</span>
            <span className="text-lg font-black text-amber-300">{weather.temperatureC}°C</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/20 rounded-xl text-sky-400 border border-sky-500/30">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rainfall</span>
            <span className="text-lg font-black text-sky-300">{weather.rainfallMm} mm/h</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3">
          <div className="p-2.5 bg-teal-500/20 rounded-xl text-teal-400 border border-teal-500/30">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Wind Velocity</span>
            <span className="text-lg font-black text-teal-300">{weather.windSpeedKmh} km/h</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Humidity</span>
            <span className="text-lg font-black text-indigo-300">{weather.humidityPct}%</span>
          </div>
        </div>
      </div>

      {/* Safety Note for Visitor */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2">
          {isRaining ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className={isRaining ? 'text-amber-300' : 'text-emerald-300'}>
            {isRaining
              ? '🌧️ Rain Alert: Carry umbrellas/raincoats. Indoor venue halls activated.'
              : isExtremeHeat
              ? '☀️ Heat Advisory: Stay hydrated. Water stations available at Main Concourse.'
              : '✓ Ideal weather conditions for attending this event!'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Open-Meteo Live API</span>
      </div>
    </div>
  );
}
