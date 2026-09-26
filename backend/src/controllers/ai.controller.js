import {
  predictDemandForEvent,
  detectRiskForEvent,
  simulateRippleForEvent,
  calculateSmartRoute,
  getRecommendationsForEvent,
  getMultiEventIntelligence,
  getDigitalTwinState,
  runWhatIfSimulation,
  getExitWavePrediction,
  queryLlmAssistant,
  getMlAnalytics,
  calculateVisitorRoute,
} from '../services/aiService.js';
import { Alert } from '../models/Alert.js';

export async function getDemandPredictions(req, res) {
  const { eventId } = req.params;
  const result = await predictDemandForEvent(eventId);
  const io = req.app.get('io');
  io?.to(`event:${eventId}`).emit('predictions:demand', result);
  res.json(result);
}

export async function getRiskDetection(req, res) {
  const { eventId } = req.params;
  const result = await detectRiskForEvent(eventId);

  // Check if any risks are HIGH or CRITICAL and save/emit real-time Alert
  const io = req.app.get('io');
  if (result.risks && Array.isArray(result.risks)) {
    for (const r of result.risks) {
      if (r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL') {
        const newAlert = await Alert.create({
          eventId,
          zoneId: r.zoneId !== 'unknown' ? r.zoneId : null,
          title: `⚠ ${r.riskLevel} RISK: ${r.name}`,
          message: r.reason,
          severity: r.riskLevel,
          targetAudience: 'ALL',
          source: 'AI_PREDICTION',
          predictedTimeToThreshold: r.predictedTimeToThreshold,
        });
        io?.emit('alert:new', newAlert);
      }
    }
  }

  res.json(result);
}

export async function getCrowdRipple(req, res) {
  const { eventId } = req.params;
  const result = await simulateRippleForEvent(eventId);
  res.json(result);
}

export async function postSmartRoute(req, res) {
  const { origin, destination, availableRoutes } = req.body;
  const result = await calculateSmartRoute(origin, destination, availableRoutes || []);
  res.json(result);
}

export async function getRecommendations(req, res) {
  const { eventId } = req.params;
  const result = await getRecommendationsForEvent(eventId);
  res.json(result);
}

export async function getMultiEvent(req, res) {
  const result = await getMultiEventIntelligence();
  res.json(result);
}

export async function getDigitalTwin(req, res) {
  const result = await getDigitalTwinState();
  res.json(result);
}

export async function postWhatIfSimulation(req, res) {
  const { eventId } = req.params;
  const { scenario } = req.body;
  const result = await runWhatIfSimulation(eventId, scenario || {});
  res.json(result);
}

export async function getExitWave(req, res) {
  const { eventId } = req.params;
  const result = await getExitWavePrediction(eventId);
  res.json(result);
}

export async function postLlmAssistantQuery(req, res) {
  const { query, eventId } = req.body;
  const result = await queryLlmAssistant(query, eventId);
  res.json(result);
}

export async function getMlAnalyticsController(req, res) {
  const result = await getMlAnalytics();
  res.json(result);
}

export async function postVisitorRoute(req, res) {
  const { origin, destination, vehicleType, eventId } = req.body;
  const result = await calculateVisitorRoute(origin, destination, vehicleType, eventId);
  res.json(result);
}
