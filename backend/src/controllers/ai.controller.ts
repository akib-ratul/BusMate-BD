import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

// ─── Fetch live BusMate context from DB ───────────────────────────────────────
async function getBusmateContext(): Promise<string> {
  try {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        buses: {
          where: { status: 'ACTIVE' },
          include: { crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 } },
        },
        stops: { orderBy: { order: 'asc' } },
      },
      take: 15,
    });

    const routeLines = routes.map(r => {
      const crowdLevel = r.buses[0]?.crowdReports[0]?.level || 'Unknown';
      const stopList = r.stops.map(s => s.name).join(' → ');
      return `Route: ${r.name} | From: ${r.startPoint} | To: ${r.endPoint} | Fare: ৳${r.baseFare} | Duration: ~${r.estimatedDuration} min | Active Buses: ${r.buses.length} | Crowd: ${crowdLevel} | Stops: ${stopList}`;
    });

    return routeLines.join('\n');
  } catch {
    return 'Live bus data temporarily unavailable.';
  }
}

// ─── Call Gemini API ───────────────────────────────────────────────────────────
async function callGemini(message: string, context: string): Promise<string | null> {
  if (!config.aiApiKey) return null;

  const systemPrompt = `You are BusMate AI, a smart and friendly travel assistant for Dhaka, Bangladesh public bus system.

LIVE BUS DATA (use this to answer questions accurately):
${context}

INSTRUCTIONS:
- Answer using the live bus data above whenever relevant.
- Be friendly, helpful, and concise (3-4 sentences max for simple questions).
- Use emojis to make responses engaging.
- For routes/fares/stops, use the exact data provided.
- If the user asks something not related to transport, answer helpfully as a general assistant.
- Always respond in the same language the user writes in (English or Bengali/Bangla).
- Do NOT make up routes or fares that are not in the data.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.aiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini error:', res.status, err);
      return null;
    }

    const data = await res.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error('Gemini fetch error:', err);
    return null;
  }
}

// ─── Call Groq API ─────────────────────────────────────────────────────────────
async function callGroq(message: string, context: string): Promise<string | null> {
  if (!config.groqApiKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are BusMate AI, a smart assistant for Dhaka, Bangladesh bus transport.

LIVE BUS DATA:
${context}

Be friendly, helpful, and concise. Use emojis. Use the live data to answer accurately. Do not invent routes or fares.`,
          },
          { role: 'user', content: message },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// ─── Simple rule-based fallback (DB-backed) ────────────────────────────────────
async function getRuleBasedResponse(message: string): Promise<string> {
  const lower = message.toLowerCase();

  // Route / direction query
  const isRouteQuery = lower.includes(' to ') || /\b(bus|route|how to go|which bus|get to)\b/.test(lower);
  if (isRouteQuery) {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: { buses: { where: { status: 'ACTIVE' } } },
    });
    const relevant = routes.filter(r =>
      lower.includes(r.startPoint.toLowerCase()) || lower.includes(r.endPoint.toLowerCase())
    ).slice(0, 3);

    if (relevant.length > 0) {
      let resp = '🚌 **Best bus options for your journey:**\n\n';
      relevant.forEach((r, i) => {
        resp += `**${i + 1}. ${r.name}**\n📍 ${r.startPoint} → ${r.endPoint}\n⏱ ~${r.estimatedDuration} min | 💰 ৳${r.baseFare} | 🚌 ${r.buses.length} active bus(es)\n\n`;
      });
      return resp + '*Data from live BusMate database.*';
    }
  }

  // Fare query
  if (/\b(fare|cost|price|taka|৳|how much)\b/.test(lower)) {
    const routes = await prisma.route.findMany({ where: { isActive: true }, take: 6 });
    const lines = routes.map(r => `• ${r.name}: ৳${r.baseFare}`).join('\n');
    return `💰 **Current bus fares:**\n\n${lines}\n\n*Use the Fare Calculator for a precise estimate.*`;
  }

  // Crowd query
  if (/\b(crowd|crowded|busy|full|packed)\b/.test(lower)) {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: { buses: { include: { crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 } } } },
      take: 5,
    });
    const low = routes.filter(r => {
      const level = r.buses[0]?.crowdReports[0]?.level;
      return level === 'LOW' || level === 'MODERATE';
    });
    if (low.length > 0) {
      return `🟢 **Less crowded routes right now:**\n\n${low.map(r => `• ${r.name}`).join('\n')}\n\n*Based on recent passenger reports.*`;
    }
    return '📊 No recent crowd reports. Check the Live Map for real-time status.';
  }

  return `🤖 I can help you with:\n\n• 🗺 **Routes** — "Which bus from Mirpur to Farmgate?"\n• 💰 **Fares** — "What is the fare to Motijheel?"\n• 👥 **Crowd status** — "Which route is less crowded?"\n• ⏱ **Travel time** — "How long to reach Uttara?"\n\nOr add a free **Gemini API key** in Render settings for full AI power!`;
}

// ─── Main chat handler ─────────────────────────────────────────────────────────
export const chat = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') throw new AppError('Message is required', 400);
  if (message.length > 500) throw new AppError('Message too long', 400);

  let response: string;
  const hasRealAI = !!(config.aiApiKey || config.groqApiKey);

  try {
    if (hasRealAI) {
      // Get live DB context to feed to the real AI
      const context = await getBusmateContext();

      // Try Gemini first (more powerful), then Groq as fallback
      const aiResponse = await callGemini(message, context) || await callGroq(message, context);

      if (aiResponse) {
        response = aiResponse;
      } else {
        // Both APIs failed — use rule-based fallback
        response = await getRuleBasedResponse(message);
      }
    } else {
      // No API key configured — use smart rule-based system
      response = await getRuleBasedResponse(message);
    }
  } catch (error) {
    console.error('AI chat error:', error);
    response = await getRuleBasedResponse(message);
  }

  res.json({ success: true, data: { message, response, isAI: hasRealAI } });
};
