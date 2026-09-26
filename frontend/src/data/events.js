export const MOCK_EVENTS = [
  {
    id: "mumbai-music-fest",
    name: "Mumbai Music Festival",
    date: "24 Sept 2026",
    time: "18:30 – 23:30",
    location: "Pillai University Grounds, Mumbai",
    expectedVisitors: 48000,
    currentVisitors: 42680,
    venueOccupancy: 84,
    congestionRisk: "HIGH",
    avgQueueTime: "18 min",
    confidence: 94,
    zones: [
      { id: "z1", name: "Gate 3 / Zone A", occupancy: 82, status: "Critical", coords: [18.99, 73.12] },
      { id: "z2", name: "Gate 1 / Zone B", occupancy: 35, status: "Low", coords: [18.995, 73.125] },
      { id: "z3", name: "Stage Grounds / Zone C", occupancy: 91, status: "Critical", coords: [18.988, 73.118] },
      { id: "z4", name: "Food Court / Zone D", occupancy: 58, status: "Moderate", coords: [18.992, 73.122] }
    ],
    transport: {
      metroLoad: 90,
      shuttleLoad: 88,
      busLoad: 62,
      taxiAvailability: "Available"
    },
    hotels: [
      { name: "Grand Stay Hotel", zone: "Zone B", occupancy: 85, price: "₹3,500/night" },
      { name: "Pillai Residency", zone: "Zone D", occupancy: 57, price: "₹2,200/night" }
    ],
    aiAlert: {
      title: "CONGESTION PREDICTED AT GATE 3",
      currentDensity: "82%",
      predictedDensity: "96%",
      timeframe: "30 min",
      recommendation: "Redirect incoming visitors to Gate 1 and increase shuttle frequency by 20%."
    }
  },
  {
    id: "mumbai-marathon",
    name: "Mumbai City Marathon",
    date: "12 Oct 2026",
    time: "05:00 – 12:00",
    location: "Marine Drive, Mumbai",
    expectedVisitors: 35000,
    currentVisitors: 28400,
    venueOccupancy: 62,
    congestionRisk: "MODERATE",
    avgQueueTime: "8 min",
    confidence: 91,
    zones: [
      { id: "z1", name: "Start Line", occupancy: 70, status: "Moderate", coords: [18.93, 72.82] },
      { id: "z2", name: "Finish Line", occupancy: 40, status: "Low", coords: [18.94, 72.83] }
    ],
    transport: { metroLoad: 55, shuttleLoad: 40, busLoad: 50, taxiAvailability: "High" },
    hotels: [],
    aiAlert: {
      title: "STATION CONGESTION EXPECTED",
      currentDensity: "60%",
      predictedDensity: "75%",
      timeframe: "45 min",
      recommendation: "Deploy additional crowd guidance personnel at Central Metro Station."
    }
  }
];