import axios from 'axios';
import { Event } from '../models/Event.js';
import { Zone } from '../models/Zone.js';
import { Alert } from '../models/Alert.js';
import { Feedback } from '../models/Feedback.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function fetchEventAndZones(eventId) {
  const event = await Event.findById(eventId).lean();
  if (!event) throw new Error('Event not found');
  const zones = await Zone.find({ eventId }).sort({ name: 1 }).lean();
  return { event, zones };
}

export async function predictDemandForEvent(eventId) {
  const { event, zones } = await fetchEventAndZones(eventId);
  const payload = {
    eventId: eventId.toString(),
    zones: zones.map((z) => ({
      zoneId: z._id.toString(),
      name: z.name,
      latitude: z.latitude,
      longitude: z.longitude,
      capacity: z.capacity,
      currentOccupancy: z.currentOccupancy,
      crowdLevel: z.crowdLevel,
      trafficLevel: z.trafficLevel,
      riskLevel: z.riskLevel,
      type: z.type,
      dataSource: z.dataSource,
    })),
    eventData: {
      name: event.name,
      expectedAttendance: event.expectedAttendance,
      venueCapacity: event.venueCapacity,
      category: event.category,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
    },
  };

  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/demand`, payload, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service demand prediction call failed:', err.message);
    const fallbackPredictions = zones.map((z) => {
      const curr = z.currentOccupancy || 0;
      const cap = z.capacity || 1000;
      return {
        zoneId: z._id.toString(),
        name: z.name,
        currentCrowd: curr,
        zoneCapacity: cap,
        currentUtilization: cap > 0 ? Math.round((curr / cap) * 100) : 0,
        forecasts: [
          { timeOffsetMinutes: 5, predictedCrowd: Math.round(curr * 1.05), predictedUtilization: Math.min(100, Math.round(((curr * 1.05) / cap) * 100)) },
          { timeOffsetMinutes: 10, predictedCrowd: Math.round(curr * 1.12), predictedUtilization: Math.min(100, Math.round(((curr * 1.12) / cap) * 100)) },
          { timeOffsetMinutes: 15, predictedCrowd: Math.round(curr * 1.20), predictedUtilization: Math.min(100, Math.round(((curr * 1.20) / cap) * 100)) },
          { timeOffsetMinutes: 30, predictedCrowd: Math.round(curr * 1.35), predictedUtilization: Math.min(100, Math.round(((curr * 1.35) / cap) * 100)) },
        ],
        confidence: 'FALLBACK (SIMULATED)',
        confidenceScore: 0.60,
        modelVersion: 'fallback-v1.0',
      };
    });

    return {
      eventId,
      timestamp: new Date().toISOString(),
      totalZones: fallbackPredictions.length,
      modelVersion: 'fallback-v1.0',
      predictions: fallbackPredictions,
    };
  }
}

export async function detectRiskForEvent(eventId) {
  const { zones } = await fetchEventAndZones(eventId);
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/risk`, { zones }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service risk detection failed:', err.message);
    return { risks: [], source: 'SIMULATED' };
  }
}

export async function simulateRippleForEvent(eventId) {
  const { zones } = await fetchEventAndZones(eventId);
  const nodes = zones.map((z) => ({
    id: z._id.toString(),
    name: z.name,
    type: z.type,
    currentOccupancy: z.currentOccupancy,
    capacity: z.capacity,
  }));
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ source: nodes[i].id, target: nodes[i + 1].id, travelTimeMin: 5 });
  }

  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/ripple`, { nodes, edges }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service ripple simulation failed:', err.message);
    return { timeline: {}, source: 'SIMULATED' };
  }
}

export async function calculateSmartRoute(origin, destination, availableRoutes) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/smart-route`, { origin, destination, availableRoutes }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service smart route failed:', err.message);
    return { recommendedRoute: availableRoutes[0] || null, alternativeRoutes: [], recommendationReason: 'Direct fallback route.', source: 'SIMULATED' };
  }
}

export async function getRecommendationsForEvent(eventId) {
  const { event, zones } = await fetchEventAndZones(eventId);
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/recommendations`, { event, zones }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service recommendations failed:', err.message);
    return { VISITOR: [], ORGANIZER: [], GOVERNMENT: [], source: 'SIMULATED' };
  }
}

export async function getMultiEventIntelligence() {
  const events = await Event.find().lean();
  const eventsWithZones = await Promise.all(
    events.map(async (e) => {
      const zones = await Zone.find({ eventId: e._id }).lean();
      return { id: e._id.toString(), name: e.name, venue: e.venue, expectedAttendance: e.expectedAttendance, zones };
    })
  );

  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/multi-event`, { events: eventsWithZones }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service multi-event failed:', err.message);
    return { interactions: [], totalInteractions: 0, source: 'SIMULATED' };
  }
}

export async function getDigitalTwinState() {
  const events = await Event.find().lean();
  const zones = await Zone.find().lean();
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/digital-twin`, { events, zones }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service digital twin failed:', err.message);
    return { digitalTwin: [], source: 'SIMULATED' };
  }
}

export async function runWhatIfSimulation(eventId, scenario) {
  const { zones } = await fetchEventAndZones(eventId);
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/simulation/what-if`, { zones, scenario }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service what-if failed:', err.message);
    return { comparisonSummary: 'Simulation temporary fallback.', source: 'SIMULATED' };
  }
}

export async function getExitWavePrediction(eventId) {
  const { event, zones } = await fetchEventAndZones(eventId);
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict/exit-wave`, { event, zones }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service exit wave failed:', err.message);
    return { timeline: [], source: 'SIMULATED' };
  }
}

export async function queryLlmAssistant(query, eventId = null) {
  let events = [];
  let zones = [];
  try {
    if (eventId) {
      const res = await fetchEventAndZones(eventId).catch(() => null);
      if (res) {
        events = [res.event];
        zones = res.zones;
      }
    }
    if (events.length === 0) {
      events = await Event.find().lean();
      zones = await Zone.find().lean();
    }

    const risks = zones.map((z) => {
      const cap = z.capacity || 1000;
      const curr = z.currentOccupancy || 0;
      const util = cap > 0 ? Math.round((curr / cap) * 100) : 0;
      let riskLevel = z.riskLevel;
      if (!riskLevel || riskLevel === 'LOW' || riskLevel === 'NORMAL') {
        riskLevel = util >= 95 ? 'CRITICAL' : util >= 80 ? 'HIGH' : util >= 65 ? 'MEDIUM' : 'LOW';
      }
      return {
        name: z.name,
        riskLevel,
        currentUtilization: util,
        currentOccupancy: curr,
        capacity: cap,
        type: z.type || 'GENERAL',
      };
    });

    const contextData = { events, zones, risks };
    const { data } = await axios.post(`${AI_SERVICE_URL}/assistant/query`, { query, contextData }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service LLM assistant failed:', err.message);
    const criticalZones = zones.filter((z) => (z.capacity ? Math.round((z.currentOccupancy / z.capacity) * 100) : 0) >= 85 || z.riskLevel === 'CRITICAL' || z.riskLevel === 'HIGH');
    let fallbackAns = 'All monitored zones are operating under safe thresholds with no critical capacity bottlenecks detected.';
    if (criticalZones.length > 0) {
      const top = criticalZones[0];
      const util = top.capacity ? Math.round((top.currentOccupancy / top.capacity) * 100) : 100;
      fallbackAns = `⚠️ High capacity risk detected in **${top.name}** (Occupancy: ${top.currentOccupancy}/${top.capacity}, **${util}%** utilization). Reroute incoming crowd to lower-occupancy gates.`;
    }
    return {
      answer: fallbackAns,
      groundingData: { zones },
      source: 'SIMULATED',
    };
  }
}

export async function getMlAnalytics() {
  const feedbackRecords = await Feedback.find().sort({ createdAt: -1 }).limit(100).lean();
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/analytics/eval`, { feedbackRecords }, { timeout: 5000 });
    return data;
  } catch (err) {
    console.error('AI Service analytics failed:', err.message);
    return { status: 'INSUFFICIENT_DATA', message: 'Model evaluation unavailable.', source: 'SIMULATED' };
  }
}

export async function calculateVisitorRoute(origin, destination, vehicleType, eventId) {
  let eventData = {};
  if (eventId) {
    const event = await Event.findById(eventId).lean();
    if (event) {
      eventData = {
        name: event.name,
        venue: event.venue,
        officialTrafficRestrictions: event.officialTrafficRestrictions || '',
        officialRoadClosures: event.officialRoadClosures || '',
        officialTransportInfo: event.officialTransportInfo || '',
        emergencyInfo: event.emergencyInfo || '',
      };
    }
  }

  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}/predict/visitor-route`,
      { origin, destination, vehicleType, event: eventData },
      { timeout: 5000 }
    );
    return data;
  } catch (err) {
    console.error('AI Service visitor route failed:', err.message);
    const oLat = Number(origin?.latitude) || 18.979;
    const oLng = Number(origin?.longitude) || 72.833;
    const dLat = Number(destination?.latitude) || 19.076;
    const dLng = Number(destination?.longitude) || 72.877;
    const fallbackWaypoints = [];
    for (let i = 0; i <= 10; i++) {
      const frac = i / 10.0;
      const lat = oLat + (dLat - oLat) * frac + Math.sin(frac * Math.PI) * 0.015;
      const lng = oLng + (dLng - oLng) * frac + Math.sin(frac * Math.PI) * 0.008;
      fallbackWaypoints.append ? fallbackWaypoints.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]) : fallbackWaypoints.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }
    return {
      origin,
      destination,
      vehicleType,
      distanceKm: 4.2,
      estimatedTimeMin: 18,
      isVehicleRestricted: false,
      restrictedRoads: [],
      advisoryReason: 'Standard route calculation.',
      complianceStatus: 'GOVERNMENT_COMPLIANT',
      waypoints: fallbackWaypoints,
      navigationSteps: [
        { stepNumber: 1, instruction: `🚗 Head out from ${origin?.name || 'Start Location'} onto main corridor.`, distance: '400 m', icon: 'straight' },
        { stepNumber: 2, instruction: 'Turn right at junction onto Access Highway.', distance: '1.8 km', icon: 'right' },
        { stepNumber: 3, instruction: 'Slight left toward Venue Entrance Boulevard.', distance: '1.2 km', icon: 'slight-right' },
        { stepNumber: 4, instruction: `🏁 Arrive at ${destination?.name || 'Event Venue'}.`, distance: '100 m', icon: 'arrive' },
      ],
      source: 'SIMULATED_FALLBACK',
    };
  }
}

export async function getLiveWeather(lat = 19.0330, lon = 73.0297) {
  try {
    const { data } = await axios.get(`${AI_SERVICE_URL}/weather/live`, {
      params: { lat, lon },
      timeout: 4000,
    });
    return data;
  } catch (err) {
    console.error('AI Service live weather call failed:', err.message);
    return {
      ok: true,
      location: 'Pillai University, Navi Mumbai',
      latitude: lat,
      longitude: lon,
      temperatureC: 29.0,
      humidityPct: 68,
      rainfallMm: 12.0,
      windSpeedKmh: 15.0,
      weatherCode: 61,
      source: 'BACKEND_FALLBACK',
    };
  }
}

