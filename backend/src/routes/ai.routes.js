import { Router } from 'express';
import { param } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDemandPredictions,
  getRiskDetection,
  getCrowdRipple,
  postSmartRoute,
  getRecommendations,
  getMultiEvent,
  getDigitalTwin,
  postWhatIfSimulation,
  getExitWave,
  postLlmAssistantQuery,
  getMlAnalyticsController,
  postVisitorRoute,
  getLiveWeatherController,
} from '../controllers/ai.controller.js';

const router = Router();

async function validate(req, res) {
  const { validationResult } = await import('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

const eventIdParamValidation = param('eventId').isMongoId();

// 1. Demand Prediction
router.get(
  ['/:eventId/predictions/demand', '/events/:eventId/predictions/demand'],
  eventIdParamValidation,
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await getDemandPredictions(req, res);
  })
);

// 2. Risk Detection
router.get(
  ['/:eventId/risk', '/events/:eventId/risk'],
  eventIdParamValidation,
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await getRiskDetection(req, res);
  })
);

// 3. Crowd Ripple
router.get(
  ['/:eventId/ripple', '/events/:eventId/ripple'],
  eventIdParamValidation,
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await getCrowdRipple(req, res);
  })
);

// 4. Smart Routing
router.post(
  '/smart-route',
  asyncHandler(async (req, res) => {
    await postSmartRoute(req, res);
  })
);

// 5. Recommendations
router.get(
  ['/:eventId/recommendations', '/events/:eventId/recommendations'],
  eventIdParamValidation,
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await getRecommendations(req, res);
  })
);

// 6. Multi-Event City Intelligence
router.get(
  '/multi-event',
  asyncHandler(async (req, res) => {
    await getMultiEvent(req, res);
  })
);

// 7. Digital Twin State
router.get(
  '/digital-twin',
  asyncHandler(async (req, res) => {
    await getDigitalTwin(req, res);
  })
);

// 8. What-If Simulator
router.post(
  ['/:eventId/what-if', '/events/:eventId/what-if'],
  eventIdParamValidation,
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await postWhatIfSimulation(req, res);
  })
);

// 9. Exit Wave AI
router.get(
  ['/:eventId/exit-wave', '/events/:eventId/exit-wave'],
  eventIdParamValidation,
  asyncHandler(async (req, res) => {
    if (!(await validate(req, res))) return;
    await getExitWave(req, res);
  })
);

// 10. LLM Assistant Query
router.post(
  '/assistant/query',
  asyncHandler(async (req, res) => {
    await postLlmAssistantQuery(req, res);
  })
);

// 11. ML Analytics
router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    await getMlAnalyticsController(req, res);
  })
);

// 12. Visitor Smart Route (Advisory Compliance via ChromaDB)
router.post(
  '/visitor-route',
  asyncHandler(async (req, res) => {
    await postVisitorRoute(req, res);
  })
);

// 13. Live Weather API (Open-Meteo)
router.get(
  '/weather/live',
  asyncHandler(async (req, res) => {
    await getLiveWeatherController(req, res);
  })
);

export default router;

