import { Router } from 'express';
import { BillingController } from '../controllers/billingController';

const router = Router();

router.post('/checkout', BillingController.checkout);
router.post('/webhooks/stripe', BillingController.webhook);
router.post('/bootstrap', BillingController.bootstrapPlans);

export default router;
