import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const suggestSchema = z.object({
  title: z.string().min(2).max(200),
});

const CATEGORIES = ['TRAVEL', 'HEALTH', 'CAREER', 'FAMILY', 'EDUCATION', 'FUN', 'OTHER'];

export async function aiRoutes(app: FastifyInstance) {
  app.post('/suggest', { preHandler: [authenticate] }, async (request, reply) => {
    const result = suggestSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error' });
    }

    const { title } = result.data;

    // If no OpenAI key, return a smart rule-based fallback
    if (!process.env.OPENAI_API_KEY) {
      return reply.send(ruleBasedSuggestion(title));
    }

    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a wish categorization assistant. Given a wish title, return ONLY valid JSON with:
- "category": one of ${CATEGORIES.join(', ')}
- "tags": array of max 3 short lowercase strings (single words or short phrases)
No explanation, no markdown, just JSON.`,
          },
          { role: 'user', content: title },
        ],
        max_tokens: 100,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content?.trim() || '';
      const parsed = JSON.parse(content);

      if (!CATEGORIES.includes(parsed.category)) {
        parsed.category = 'OTHER';
      }

      return reply.send({
        category: parsed.category,
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [],
      });
    } catch (error) {
      console.error('AI suggestion error:', error);
      // Fallback to rule-based on error
      return reply.send(ruleBasedSuggestion(title));
    }
  });
}

function ruleBasedSuggestion(title: string): { category: string; tags: string[] } {
  const lower = title.toLowerCase();

  if (/travel|visit|trip|fly|hike|explore|country|city|beach|mountain|japan|paris|italy/.test(lower)) {
    return { category: 'TRAVEL', tags: ['adventure', 'exploration', 'travel'] };
  }
  if (/health|run|marathon|gym|fitness|yoga|swim|diet|weight|meditation|sport/.test(lower)) {
    return { category: 'HEALTH', tags: ['fitness', 'wellness', 'health'] };
  }
  if (/career|job|promotion|startup|business|launch|project|skills|learn|course|degree/.test(lower)) {
    return { category: 'CAREER', tags: ['growth', 'career', 'achievement'] };
  }
  if (/family|kids|parent|wedding|home|house|child|mom|dad|sibling/.test(lower)) {
    return { category: 'FAMILY', tags: ['family', 'home', 'love'] };
  }
  if (/learn|study|read|book|language|music|guitar|piano|art|paint|code|program/.test(lower)) {
    return { category: 'EDUCATION', tags: ['learning', 'skills', 'education'] };
  }
  if (/fun|play|game|concert|show|festival|party|enjoy|laugh|adventure/.test(lower)) {
    return { category: 'FUN', tags: ['fun', 'joy', 'experience'] };
  }

  return { category: 'OTHER', tags: ['dream', 'goal', 'wish'] };
}
