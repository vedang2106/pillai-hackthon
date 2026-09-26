import React, { useState } from 'react';
import Landing from './pages/Landing';
import EventSelection from './pages/EventSelection';
import Navbar from './components/Navbar';
import Sidebar from './components/layout/Sidebar';
import OrganizerDashboard from './components/OrganizerDashboard';
import WhatIfSimulator from './pages/WhatIfSimulator';
import AIInsights from './pages/AIInsights';
import TransportIntelligence from './pages/TransportIntelligence';
import AccommodationIntelligence from './pages/AccommodationIntelligence';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import AICrisisRoom from './components/ai/AICrisisRoom';
import EventSurvivalChallenge from './components/ai/EventSurvivalChallenge';
import AIDigitalTwin from './components/ai/AIDigitalTwin';
import VisitorApp from './components/VisitorApp';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mode, setMode] = useState('organizer');
  const [activeTab, setActiveTab] = useState('overview');

  const [eventData, setEventData] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventData({
      zones: event.zones,
      metroLoad: event.transport.metroLoad,
      hotelOccupancy: event.hotels.length > 0 ? event.hotels[0].occupancy : 70,
      aiAlert: {
        message: event.aiAlert.title + ": " + event.aiAlert.recommendation,
        recommendation: event.aiAlert.recommendation
      }
    });
    setCurrentScreen('dashboard');
  };

  const triggerSurge = () => {
    if (!eventData) return;
    setEventData({
      ...eventData,
      zones: [
        { ...eventData.zones[0], occupancy: 96, status: 'Critical' },
        { ...eventData.zones[1], occupancy: 30, status: 'Low' },
        ...eventData.zones.slice(2)
      ],
      metroLoad: 95,
      aiAlert: {
        message: "CRITICAL: Gate 3 capacity reached 96%! High stampede risk[cite: 1].",
        recommendation: "Redirect incoming visitors to Gate 1 and deploy 4 additional shuttles[cite: 1]."
      }
    });
  };

  const resetDemo = () => {
    if (selectedEvent) handleSelectEvent(selectedEvent);
  };

  if (currentScreen === 'landing') return <Landing onExplore={() => setCurrentScreen('select')} />;
  if (currentScreen === 'select') return <EventSelection onSelectEvent={handleSelectEvent} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar 
        currentMode={mode} 
        setMode={setMode} 
        eventName={selectedEvent?.name}
        onChangeEvent={() => setCurrentScreen('select')} 
      />

      {mode === 'organizer' ? (
        <div className="flex">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onExitEvent={() => setCurrentScreen('select')} 
          />
          <main className="flex-1 p-8 max-w-7xl">
            {activeTab === 'overview' && (
              <OrganizerDashboard data={eventData} triggerSurge={triggerSurge} resetDemo={resetDemo} />
            )}
            {activeTab === 'live-map' && (
              <OrganizerDashboard data={eventData} triggerSurge={triggerSurge} resetDemo={resetDemo} />
            )}
            {activeTab === 'crisis-room' && <AICrisisRoom />}
            {activeTab === 'survival-game' && <EventSurvivalChallenge />}
            {activeTab === 'digital-twin' && <AIDigitalTwin />}
            {activeTab === 'simulator' && <WhatIfSimulator data={eventData} />}
            {activeTab === 'ai-insights' && <AIInsights />}
            {activeTab === 'transport' && <TransportIntelligence data={eventData} />}
            {activeTab === 'accommodation' && <AccommodationIntelligence data={eventData} />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'alerts' && <Alerts />}
          </main>
        </div>
      ) : (
        <main className="max-w-md mx-auto px-6 py-8">
          <VisitorApp data={eventData} />
        </main>
      )}
    </div>
  );
}