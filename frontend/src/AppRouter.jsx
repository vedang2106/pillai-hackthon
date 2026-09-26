import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import EventSelection from './pages/EventSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import OrganizerOverview from './pages/OrganizerOverview';
import ManageZones from './pages/ManageZones';
import GovernmentDashboard from './pages/GovernmentDashboard';
import CreateOfficialEvent from './pages/CreateOfficialEvent';
import GovernmentReviewEvent from './pages/GovernmentReviewEvent';

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/government" element={<GovernmentDashboard />} />
            <Route path="/government/events/new" element={<CreateOfficialEvent />} />
            <Route path="/government/events/:eventId/review" element={<GovernmentReviewEvent />} />
            <Route path="/events" element={<EventSelection />} />
            <Route path="/events/new" element={<CreateEvent />} />
            <Route path="/events/:eventId" element={<OrganizerOverview />} />
            <Route path="/events/:eventId/zones" element={<ManageZones />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
