import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { Sliders, AlertCircle, ArrowRight, RefreshCw, Zap, Radio, CloudRain, Sun, Wind } from 'lucide-react';
import { aiApi } from '../../services/api';

export default function WhatIfSimulator({ onApplyScenario }) {
  const [weatherMode, setWeatherMode] = useState('LIVE'); // 'LIVE' or 'CUSTOM'
  const [visitors, setVisitors] = useState(50000);
  const [gate3Capacity, setGate3Capacity] = useState(60);
  const [rainfallMm, setRainfallMm] = useState(0);
  const [temperatureC, setTemperatureC] = useState(28);

  const [liveWeather, setLiveWeather] = useState({
    temperatureC: 28.5,
    rainfallMm: 12.0,
    windSpeedKmh: 14.0,
    loading: false
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await aiApi.getLiveWeather();
        if (res.data) {
          setLiveWeather({
            temperatureC: res.data.temperatureC ?? 28.5,
            rainfallMm: res.data.rainfallMm ?? 0.0,
            windSpeedKmh: res.data.windSpeedKmh ?? 12.0,
            loading: false
          });
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    };
    fetchWeather();
  }, []);

  const activeRain = weatherMode === 'LIVE' ? liveWeather.rainfallMm : rainfallMm;
  const activeTemp = weatherMode === 'LIVE' ? liveWeather.temperatureC : temperatureC;

  const predictedRisk = (visitors > 55000 || gate3Capacity < 40 || activeRain > 30 || activeTemp > 38) ? 'CRITICAL' : 'MODERATE';

  const handleSimulate = () => {
    if (onApplyScenario) {
      onApplyScenario({
        weatherMode,
        rainfallMm: activeRain,
        temperatureC: activeTemp,
        visitors,
        gate3Capacity,
        predictedRisk
      });
    }
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-white via-orange-50/20 to-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-orange text-white rounded-xl shadow-shiny">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Weather & What-If Simulator</h3>
            <p className="text-xs text-slate-400 font-medium">Test real-time event disruptions and predict weather impact on crowd density.</p>
          </div>
        </div>

        {/* Live Weather vs Custom Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
          <button
            onClick={() => setWeatherMode('LIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              weatherMode === 'LIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
            <span>Live Weather API</span>
          </button>
          <button
            onClick={() => setWeatherMode('CUSTOM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              weatherMode === 'CUSTOM' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulate Weather</span>
          </button>
        </div>
      </div>

      {/* Preset Weather Quick Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
        <button
          onClick={() => { setWeatherMode('CUSTOM'); setRainfallMm(65); setGate3Capacity(20); }}
          className="p-3 bg-white border border-slate-200 hover:border-brand-orange rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm text-left flex items-center space-x-2"
        >
          <CloudRain className="w-4 h-4 text-blue-500" />
          <span>🌧️ Monsoon (65mm)</span>
        </button>
        <button
          onClick={() => { setWeatherMode('CUSTOM'); setTemperatureC(42); }}
          className="p-3 bg-white border border-slate-200 hover:border-brand-orange rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm text-left flex items-center space-x-2"
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>☀️ Heatwave (42°C)</span>
        </button>
        <button
          onClick={() => { setVisitors(65000); }}
          className="p-3 bg-white border border-slate-200 hover:border-brand-orange rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm text-left flex items-center space-x-2"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>📈 +15k Visitor Surge</span>
        </button>
        <button
          onClick={() => { setWeatherMode('LIVE'); setVisitors(50000); setGate3Capacity(60); }}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {weatherMode === 'CUSTOM' && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-3 mb-4">
            <span className="text-xs font-bold text-sky-800 uppercase block">Weather Simulation Parameters</span>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Simulated Rainfall</span>
                <span className="text-sky-600">{rainfallMm} mm/hr</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Expected Visitor Volume</span>
            <span className="text-brand-orange">{visitors.toLocaleString()} attendees</span>
          </div>
          <input
            type="range"
            min="30000"
            max="80000"
            step="1000"
            value={visitors}
            onChange={(e) => setVisitors(Number(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Gate 3 Capacity</span>
            <span className="text-brand-orange">{gate3Capacity}% operational</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={gate3Capacity}
            onChange={(e) => setGate3Capacity(Number(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>
      </div>

      {/* Action Trigger */}
      <button
        onClick={handleSimulate}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm"
      >
        <Zap className="w-4 h-4 text-brand-orange" />
        <span>Run Digital Twin Simulation Model</span>
      </button>
    </Card>
  );
}