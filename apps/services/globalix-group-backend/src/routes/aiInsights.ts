import { Router } from 'express';
import { AiInsightsController } from '../controllers/aiInsightsController';
import { requireFeature } from '../middleware/featureGate';

const router = Router();

router.post('/insights', requireFeature('ai_insights'), AiInsightsController.requestInsight);
router.get('/insights', requireFeature('ai_insights'), AiInsightsController.listInsights);

export default router;
