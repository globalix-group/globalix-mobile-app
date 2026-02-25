import { Plan, Subscription } from '../models';
import { AppError } from '../middleware/errorHandler';
import Stripe from 'stripe';
import { stripe } from '../config/stripe';

export class BillingService {
  static async ensureDefaultPlans() {
    const defaults = [
      {
        name: 'Starter',
        limits: { maxListings: 25, aiRequests: 0 },
        features: { ai: false, whiteLabel: false },
        stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || null,
        stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || null,
      },
      {
        name: 'Pro',
        limits: { maxListings: 250, aiRequests: 1000 },
        features: { ai: true, whiteLabel: false },
        stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
        stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || null,
      },
      {
        name: 'Enterprise',
        limits: { maxListings: 5000, aiRequests: 20000 },
        features: { ai: true, whiteLabel: true },
        stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || null,
        stripePriceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || null,
      },
    ];

    for (const plan of defaults) {
      await Plan.findOrCreate({ where: { name: plan.name }, defaults: plan as any });
    }
  }

  static async createCheckoutSession(tenantId: string, planId: string, interval: 'monthly' | 'annual' = 'monthly') {
    if (!stripe) {
      throw new AppError(500, 'STRIPE_NOT_CONFIGURED', 'Stripe is not configured');
    }

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new AppError(404, 'PLAN_NOT_FOUND', 'Plan not found');
    }

    const priceId =
      interval === 'annual' ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
    if (!priceId) {
      throw new AppError(400, 'PLAN_PRICE_MISSING', 'Stripe price ID is missing for this plan');
    }

    const [subscription] = await Subscription.findOrCreate({
      where: { tenantId },
      defaults: { tenantId, planId: plan.id, status: 'trialing' },
    });

    if (subscription.planId !== plan.id) {
      subscription.planId = plan.id;
      await subscription.save();
    }

    const successUrl = process.env.STRIPE_SUCCESS_URL || 'http://localhost:3001/billing/success';
    const cancelUrl = process.env.STRIPE_CANCEL_URL || 'http://localhost:3001/billing/cancel';

    const customerId = subscription.stripeCustomerId;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        subscriptionId: subscription.id,
        planId: plan.id,
        interval,
      },
    });

    return {
      checkoutUrl: session.url,
      subscriptionId: subscription.id,
      stripeSessionId: session.id,
    };
  }

  static async handleStripeWebhook(rawBody: Buffer, signature?: string) {
    if (!stripe) {
      throw new AppError(500, 'STRIPE_NOT_CONFIGURED', 'Stripe is not configured');
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !signature) {
      throw new AppError(400, 'WEBHOOK_INVALID', 'Stripe webhook signature missing');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.metadata?.subscriptionId;
        if (subscriptionId) {
          const subscription = await Subscription.findByPk(subscriptionId);
          if (subscription) {
            subscription.stripeCustomerId = session.customer?.toString() || null;
            subscription.stripeSubscriptionId = session.subscription?.toString() || null;
            subscription.status = 'active';
            await subscription.save();
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const subscription = await Subscription.findOne({
          where: { stripeSubscriptionId: stripeSub.id },
        });
        if (subscription) {
          subscription.status = stripeSub.status as any;
          subscription.currentPeriodEnd = stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : null;
          await subscription.save();
        }
        break;
      }
      default:
        break;
    }

    return { received: true, type: event.type };
  }
}
