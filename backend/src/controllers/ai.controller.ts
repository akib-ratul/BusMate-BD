import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

// Predefined Dhaka bus knowledge base for fallback
const DHAKA_BUS_KNOWLEDGE: Record<string, string[]> = {
  'mirpur': ['mirpur-10', 'mirpur 10', 'mirpur-1', 'mirpur-2'],
  'farmgate': ['farmgate', 'farm gate'],
  'uttara': ['uttara', 'uttara sector'],
  'motijheel': ['motijheel', 'motijihl'],
  'mohammadpur': ['mohammadpur', 'mohammad pur'],
  'gulshan': ['gulshan', 'gulshan-1', 'gulshan-2'],
  'dhanmondi': ['dhanmondi', 'dhanmondi 27'],
  'jatrabari': ['jatrabari', 'jatra bari'],
  'bashundhara': ['bashundhara', 'bashundhara city'],
};

function normalizeLocation(loc: string): string {
  return loc.toLowerCase().trim();
}

function findMatchingLocation(input: string): string | null {
  const norm = normalizeLocation(input);
  for (const [key, aliases] of Object.entries(DHAKA_BUS_KNOWLEDGE)) {
    if (aliases.some(alias => norm.includes(alias) || alias.includes(norm))) {
      return key;
    }
  }
  return null;
}

async function getRulesBasedResponse(message: string): Promise<string> {
  const lower = message.toLowerCase();

  // Route query pattern
  const routeMatch = lower.match(/(?:from|bus from|go from|travel from|mirpur|uttara|mohammadpur|jatrabari|bashundhara|gulshan|dhanmondi|motijheel|farmgate).*(?:to|toward|towards)/i);

  if (routeMatch || lower.includes(' to ')) {
    // Try to extract from/to
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        buses: {
          where: { status: 'ACTIVE' },
          include: { crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 } },
        },
      },
    });

    // Find relevant routes
    const relevant = routes.filter(r => {
      const routeText = `${r.startPoint} ${r.endPoint} ${r.name}`.toLowerCase();
      return routes.some(() => lower.includes(r.startPoint.toLowerCase()) || lower.includes(r.endPoint.toLowerCase()));
    }).slice(0, 3);

    if (relevant.length > 0) {
      let response = '🚌 Here are the best bus options for your journey:\n\n';
      relevant.forEach((r, i) => {
        const crowd = r.buses[0]?.crowdReports[0]?.level || 'Unknown';
        response += `**${i + 1}. ${r.name}**\n`;
        response += `📍 ${r.startPoint} → ${r.endPoint}\n`;
        response += `⏱ ~${r.estimatedDuration} minutes | 💰 ৳${r.baseFare}\n`;
        response += `👥 Current crowd: ${crowd}\n`;
        response += `🚌 Active buses: ${r.buses.length}\n\n`;
      });
      response += '*Please verify timings before boarding. BusMate shows estimated information.*';
      return response;
    }
  }

  // Crowd query
  if (lower.includes('crowd') || lower.includes('busy') || lower.includes('full')) {
    const crowdRoutes = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        buses: {
          include: { crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 } },
        },
      },
      take: 5,
    });

    const leastCrowded = crowdRoutes
      .map(r => ({
        name: r.name,
        crowd: r.buses[0]?.crowdReports[0]?.level || 'UNKNOWN',
      }))
      .filter(r => r.crowd === 'LOW' || r.crowd === 'MODERATE');

    if (leastCrowded.length > 0) {
      return `🟢 **Least crowded routes right now:**\n\n${leastCrowded.map(r => `• ${r.name}: ${r.crowd}`).join('\n')}\n\n*Crowd data is based on recent passenger reports.*`;
    }
    return '📊 No recent crowd data available. Please check the live map for the latest status.';
  }

  // Fare query
  if (lower.includes('fare') || lower.includes('cost') || lower.includes('price') || lower.includes('taka') || lower.includes('৳')) {
    const routes = await prisma.route.findMany({ where: { isActive: true }, take: 5 });
    const fareInfo = routes.map(r => `• ${r.name}: ৳${r.baseFare}`).join('\n');
    return `💰 **Bus fares in Dhaka:**\n\n${fareInfo}\n\n*Use the Fare Calculator for a precise estimate for your journey.*`;
  }

  // Help query
  if (lower.includes('help') || lower.includes('how') || lower.includes('what can')) {
    return `🤖 **I'm BusMate AI Assistant!** I can help you with:\n\n` +
      `• 🗺 **Route finding** — "Which bus from Mirpur to Farmgate?"\n` +
      `• 💰 **Fare info** — "How much is the fare to Motijheel?"\n` +
      `• 👥 **Crowd status** — "Which route is less crowded?"\n` +
      `• ⏱ **Travel time** — "How long does it take to Uttara?"\n` +
      `• 🚌 **Bus info** — "Which buses go to Gulshan?"\n\n` +
      `*Note: I provide estimates based on available data. Always verify before travel.*`;
  }

  return `🤖 I can help you find buses, check fares, and see crowd status in Dhaka. Try asking:\n\n• "Which bus goes from Mirpur to Farmgate?"\n• "What is the fare to Motijheel?"\n• "Which route is less crowded right now?"\n\nFor live tracking, check the **Live Map** tab.`;
}

export const chat = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') throw new AppError('Message is required', 400);
  if (message.length > 500) throw new AppError('Message too long', 400);

  let response: string;

  try {
    // 1. First, check our internal BusMate knowledge base for specific route/fare/crowd info
    const localResponse = await getRulesBasedResponse(message);
    
    if (!localResponse.includes('I can help you find buses, check fares')) {
      // Found specific bus data — return it directly
      response = localResponse;
    } else if (config.groqApiKey) {
      // 2. Use Groq's FREE LLaMA3 API for real conversational AI (free tier: 30 req/min)
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(config as any).groqApiKey}`,
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content: `You are BusMate AI, a helpful assistant for Dhaka public bus transport in Bangladesh. 
Answer questions about bus routes, transport in Dhaka, travel tips, and general conversation.
Be friendly, concise (2-3 sentences max), and helpful. Use emojis occasionally.
If asked about specific bus routes or fares, note that real-time data is available in the BusMate app.`
              },
              { role: 'user', content: message }
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json() as any;
          response = data.choices?.[0]?.message?.content || localResponse;
        } else {
          console.warn('Groq API error:', groqRes.status);
          response = localResponse;
        }
      } catch (groqError) {
        console.warn('Groq fetch failed, using local fallback');
        response = localResponse;
      }
    } else {
      // 3. No API key — use enriched local conversational engine
      const lowerMsg = message.toLowerCase();
      let conversationalResponse = 'I am a free AI assistant! Ask me about buses, routes, fares, or just chat with me!';
      
      if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        conversationalResponse = 'Hello there! How can I assist you with your journey today?';
      } else if (lowerMsg.includes('joke')) {
        conversationalResponse = 'Why did the bus stop? Because it saw a zebra crossing!';
      } else if (lowerMsg.includes('thanks') || lowerMsg.includes('thank you')) {
        conversationalResponse = 'You are very welcome! Have a safe trip with BusMate.';
      } else if (lowerMsg.includes('who are you')) {
        conversationalResponse = 'I am the BusMate AI Assistant, your perfectly reliable guide for Dhaka public transport!';
      } else if (lowerMsg.includes('how are you')) {
        conversationalResponse = 'I am running perfectly! How can I help you navigate Dhaka today?';
      } else if (lowerMsg.includes('weather')) {
        conversationalResponse = 'I only track buses, not the clouds! But it is always a good day to travel with BusMate.';
      } else if (lowerMsg.includes('love you')) {
        conversationalResponse = 'I am just an AI, but I love helping you find the right bus!';
      } else if (lowerMsg.includes('time out') || lowerMsg.includes('timeout')) {
        conversationalResponse = 'No more timeouts! I have been upgraded to respond instantly.';
      }
      
      response = conversationalResponse;
    }
  } catch (error) {
    console.error('AI Error:', error);
    response = await getRulesBasedResponse(message);
  }

  res.json({ success: true, data: { message, response, isAI: true } });
};
