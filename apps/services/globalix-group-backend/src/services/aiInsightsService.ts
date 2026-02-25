import { AiInsight } from '../models';
import { AppError } from '../middleware/errorHandler';

export class AiInsightsService {
  static async requestInsight(tenantId: string, entityType: string, entityId: string, context?: Record<string, any>) {
    if (!tenantId) {
      throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
    }

    const sanitized = AiInsightsService.sanitizeContext(context || {});
    const insight = await AiInsight.create({
      tenantId,
      entityType,
      entityId,
      status: 'pending',
      summary: null,
      recommendation: null,
      confidence: null,
      rationale: null,
      dataSources: sanitized,
    });

    setImmediate(async () => {
      try {
        await AiInsightsService.generateInsight(insight.id, tenantId, entityType, entityId, sanitized);
      } catch (error) {
        // Keep insight in pending state if AI fails
        void error;
      }
    });

    return insight;
  }

  static async listInsights(tenantId: string, entityType?: string, entityId?: string) {
    const where: Record<string, any> = { tenantId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    return AiInsight.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  private static sanitizeContext(context: Record<string, any>) {
    const text = JSON.stringify(context);
    const redacted = text
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
      .replace(/\+?\d[\d\s().-]{7,}\d/g, '[REDACTED_PHONE]');

    try {
      return JSON.parse(redacted);
    } catch {
      return { redacted: true };
    }
  }

  private static async generateInsight(
    insightId: string,
    tenantId: string,
    entityType: string,
    entityId: string,
    context: Record<string, any>
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    if (!apiKey) {
      return;
    }

    const systemPrompt =
      'You are a tenant-scoped insights engine. Never access or infer cross-tenant data. Avoid raw PII. Provide explainable recommendations only. Output JSON with summary, recommendation, confidence, rationale, data_sources.';

    const userPrompt = {
      tenantId,
      entityType,
      entityId,
      context,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPrompt) },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content };
    }

    const insight = await AiInsight.findByPk(insightId);
    if (!insight) return;

    insight.summary = parsed.summary || insight.summary;
    insight.recommendation = parsed.recommendation || insight.recommendation;
    insight.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : insight.confidence;
    insight.rationale = parsed.rationale || insight.rationale;
    insight.dataSources = parsed.data_sources || insight.dataSources;
    await insight.save();
  }
}
