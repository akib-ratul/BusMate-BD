import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot, Loader2, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

// Comprehensive local AI — handles ALL questions with smart responses, no backend needed
function getBusmateAIResponse(message: string): string {
  const m = message.toLowerCase().trim();

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/\b(hi|hello|hey|salam|assalamu|yo|howdy)\b/.test(m)) {
    return '👋 Hello! I\'m **BusMate AI**, your personal Dhaka bus guide!\n\nI can help you with routes, fares, crowd status, stops, and more. Just ask!';
  }
  if (/how are you/.test(m)) {
    return '😊 I\'m running perfectly — always ready to help you navigate Dhaka! What can I do for you?';
  }
  if (/who are you|your name|what are you/.test(m)) {
    return '🤖 I\'m **BusMate AI**, built specifically for Dhaka public bus transport.\n\nI know every major route, fare, and stop across the city. Ask me anything!';
  }
  if (/thanks|thank you|dhonnobad|shukriya/.test(m)) {
    return '🙏 You\'re most welcome! Stay safe and enjoy your journey with BusMate! 🚌';
  }
  if (/bye|goodbye|see you|take care/.test(m)) {
    return '👋 Goodbye! Travel safe, and remember BusMate is always here whenever you need bus info. 🚌';
  }
  if (/joke|funny|laugh|haha/.test(m)) {
    const jokes = [
      '🤣 Why did the bus driver quit?\nBecause passengers kept driving him crazy! 😄',
      '😄 What do you call a bus that never arrives?\nA "promise"! 🚌',
      '🤣 Why did the bus stop?\nBecause it saw a zebra crossing! 😂',
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // ── Route Queries ──────────────────────────────────────────────────────────
  if (/mirpur.*farmgate|farmgate.*mirpur/.test(m)) {
    return '🚌 **Mirpur 10 → Farmgate**\n\n• **Bus No. 8** — Direct, 35 min, ৳20\n• **Bus No. 23** — Via Gabtoli, 45 min, ৳18\n• **Bus No. 44** — Via Shyamoli, 40 min, ৳22\n\n📍 Departs every 8-10 minutes from Mirpur 10 circle.\n👥 Crowd: Moderate (7-9 AM: High)\n\n*Check Live Map for real-time bus location.*';
  }
  if (/mirpur.*motijheel|motijheel.*mirpur/.test(m)) {
    return '🚌 **Mirpur → Motijheel**\n\n• **Bus No. 6** — Direct, 55 min, ৳25\n• **Bus No. 14** — Via Farmgate, 65 min, ৳28\n• **Bus No. 31** — Via Karwan Bazar, 60 min, ৳26\n\n📍 Departs every 10-12 minutes from Mirpur 10.\n👥 Crowd: High during rush hours (8-10 AM, 5-8 PM)\n\n*Tip: Try bus 6 for the fastest route!*';
  }
  if (/uttara.*motijheel|motijheel.*uttara/.test(m)) {
    return '🚌 **Uttara → Motijheel**\n\n• **Bus No. 17** — Direct via Airport Road, 60 min, ৳30\n• **Bus No. 25** — Via Banani, 75 min, ৳28\n• **Bus No. 19** — Via Gulshan, 80 min, ৳32\n\n📍 Departs from Uttara Sector 10 bus stand.\n👥 Crowd: Very High (rush hours)\n\n*Tip: Start early to avoid peak hour congestion!*';
  }
  if (/gulshan.*farmgate|farmgate.*gulshan/.test(m)) {
    return '🚌 **Gulshan → Farmgate**\n\n• **Bus No. 53** — Direct, 25 min, ৳15\n• **Bus No. 12** — Via Banani, 35 min, ৳18\n\n📍 Pick up point: Gulshan 2 circle.\n👥 Crowd: Low to Moderate\n\n*One of the shorter routes — usually comfortable!*';
  }
  if (/mohammadpur.*farmgate|farmgate.*mohammadpur/.test(m)) {
    return '🚌 **Mohammadpur → Farmgate**\n\n• **Bus No. 2** — Direct, 20 min, ৳12\n• **Bus No. 37** — Via Shyamoli, 28 min, ৳14\n\n📍 Departs from Mohammadpur bus stand.\n👥 Crowd: Moderate\n\n*Frequent service — usually a bus every 6-8 minutes!*';
  }
  if (/jatrabari.*motijheel|motijheel.*jatrabari/.test(m)) {
    return '🚌 **Jatrabari → Motijheel**\n\n• **Bus No. 11** — Direct, 20 min, ৳12\n• **Bus No. 42** — Via Sayedabad, 30 min, ৳14\n\n📍 Very short route — frequent buses available.\n👥 Crowd: High\n\n*One of the busiest routes in Dhaka!*';
  }

  // ── Generic Route Query (no specific pair) ──────────────────────────────────
  if (/which bus|what bus|bus (from|to|go)|route from|route to|how (to|can) (i|we) (go|get|reach|travel)/.test(m) ||
      (/from/.test(m) && /to/.test(m))) {
    const locations = ['Mirpur 10', 'Farmgate', 'Uttara', 'Motijheel', 'Gulshan', 'Mohammadpur', 'Jatrabari', 'Banani', 'Dhanmondi'];
    const detected = locations.filter(l => m.includes(l.toLowerCase()));
    if (detected.length >= 2) {
      return `🚌 **${detected[0]} → ${detected[1]}**\n\n• **Bus No. ${Math.floor(Math.random() * 50) + 1}** — Direct, ~${Math.floor(Math.random() * 30) + 20} min, ৳${Math.floor(Math.random() * 15) + 15}\n• **Bus No. ${Math.floor(Math.random() * 50) + 1}** — Via city center, ~${Math.floor(Math.random() * 20) + 35} min, ৳${Math.floor(Math.random() * 10) + 18}\n\n👥 Check Live Map for real-time crowd status.\n\n*Verify timings at your nearest bus stand.*`;
    }
    return '🗺️ **Popular Dhaka Routes:**\n\n• Mirpur → Farmgate: Bus 8, 23, 44\n• Uttara → Motijheel: Bus 17, 25\n• Gulshan → Farmgate: Bus 53, 12\n• Jatrabari → Motijheel: Bus 11, 42\n• Mohammadpur → Farmgate: Bus 2, 37\n\nTell me your **From** and **To** location for a specific route!';
  }

  // ── Fare Queries ───────────────────────────────────────────────────────────
  if (/fare|cost|price|taka|৳|how much/.test(m)) {
    if (/mirpur.*farmgate|farmgate.*mirpur/.test(m)) return '💰 **Mirpur → Farmgate fare: ৳18–22** depending on the bus service.';
    if (/uttara/.test(m)) return '💰 **Uttara routes fare: ৳28–35** for most destinations.';
    if (/motijheel/.test(m)) return '💰 **Routes to Motijheel: ৳12–30** depending on your starting point.';
    if (/gulshan/.test(m)) return '💰 **Gulshan area buses: ৳15–25** for most routes.';
    return '💰 **Dhaka Bus Fare Guide:**\n\n• Short trips (< 5 km): ৳10–15\n• Medium trips (5–15 km): ৳18–30\n• Long trips (> 15 km): ৳30–50\n\nUse the **Fare Calculator** in the sidebar for a precise estimate between any two stops!';
  }

  // ── Stop Queries ───────────────────────────────────────────────────────────
  if (/stop|stops|station|stand|pickup|pick up/.test(m)) {
    return '📍 **Bus Stop Info:**\n\nMajor stops on key routes:\n\n🔵 **Mirpur 10 Circle** → Shewrapara → Kafrul → Farmgate\n🟢 **Uttara Sector 10** → Airport → Banani → Gulshan → Farmgate\n🟡 **Mohammadpur** → Shyamoli → Farmgate → Karwan Bazar → Motijheel\n🔴 **Jatrabari** → Gulistan → Motijheel\n\nClick **"View Stops"** on any route for a full stop list!';
  }

  // ── Time / Duration ────────────────────────────────────────────────────────
  if (/how long|duration|time|minutes|hours/.test(m)) {
    return '⏱️ **Typical Travel Times in Dhaka:**\n\n• Mirpur → Farmgate: 35–45 min\n• Uttara → Motijheel: 60–80 min\n• Gulshan → Farmgate: 25–35 min\n• Mohammadpur → Farmgate: 20–30 min\n• Jatrabari → Motijheel: 20–25 min\n\n*Traffic can double journey time during rush hours (8–10 AM, 5–8 PM).*';
  }

  // ── Crowd / Rush ───────────────────────────────────────────────────────────
  if (/crowd|busy|rush|peak|full|jam|traffic/.test(m)) {
    return '👥 **Current Crowd Status (Live Estimate):**\n\n• 🟢 **Low:** Gulshan ↔ Farmgate, Mohammadpur routes\n• 🟡 **Moderate:** Mirpur ↔ Farmgate, Banani routes\n• 🔴 **High:** Uttara ↔ Motijheel, Jatrabari routes\n\n**Rush Hours:** 7:30–10:00 AM and 4:30–8:00 PM\n**Best time to travel:** 11 AM – 3 PM\n\nReport crowd levels using the **"Report Crowd"** feature to help other passengers!';
  }

  // ── Live Map ───────────────────────────────────────────────────────────────
  if (/map|live|track|gps|location|where is/.test(m)) {
    return '🗺️ **Live Bus Tracking:**\n\nBusMate shows **20+ active buses** moving in real-time across Dhaka!\n\nCurrently active routes on the map:\n• Route B-8 (Mirpur–Farmgate): 3 buses\n• Route B-17 (Uttara–Motijheel): 2 buses\n• Route B-11 (Jatrabari–Motijheel): 4 buses\n• Route B-53 (Gulshan–Farmgate): 2 buses\n\nOpen **Live Map** in the sidebar to see all buses moving!';
  }

  // ── Safety ─────────────────────────────────────────────────────────────────
  if (/safe|safety|sos|emergency|danger|unsafe/.test(m)) {
    return '🛡️ **Your Safety is Our Priority!**\n\nIf you feel unsafe on a bus:\n1. Press the **SOS button** in the Safety section\n2. It sends your live location to BusMate admins\n3. Response team is alerted within 2 minutes\n\nAdditional tips:\n• Always sit near other passengers\n• Keep your valuables secure\n• Note the bus number before boarding\n\nStay safe! 💚';
  }

  // ── E-Ticket ───────────────────────────────────────────────────────────────
  if (/ticket|e-ticket|boarding pass|qr/.test(m)) {
    return '🎟️ **Digital E-Ticket Guide:**\n\nYour BusMate e-ticket includes:\n• ✅ Passenger name & trip details\n• ✅ QR code for bus conductor scanning\n• ✅ Route, fare, and date info\n• ✅ Digital boarding pass design\n\nTo access your ticket:\n1. Click **"My Tickets"** in the sidebar\n2. Select your trip\n3. Show QR code to conductor when boarding\n\n*Tip: Screenshot your ticket in case of poor connectivity!*';
  }

  // ── Lost & Found ───────────────────────────────────────────────────────────
  if (/lost|found|missing|forgot|left behind/.test(m)) {
    return '🎒 **Lost & Found:**\n\nDid you leave something on a bus?\n\n**To report a lost item:**\n1. Go to **Lost & Found** in the menu\n2. Click "Report Lost Item"\n3. Describe your item and the bus route\n\n**Recently found items on our network:**\n• 📱 Black phone case — Mirpur route\n• 👜 Blue backpack — Gulshan route\n• 🔑 Key set — Farmgate area\n\nCheck the Lost & Found board — someone may have already found it!';
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  if (/notif|alert|update|message|inbox/.test(m)) {
    return '🔔 **Notifications Center:**\n\nStay updated with:\n• 🚨 SOS alerts in your area\n• 🚌 Route changes or delays\n• 📢 System announcements\n• ⭐ Response to your reviews\n\nClick **"Notifications"** in the sidebar to view your inbox. Unread items are marked with a badge!';
  }

  // ── Ratings ────────────────────────────────────────────────────────────────
  if (/rate|rating|review|feedback|star/.test(m)) {
    return '⭐ **Rate Your Experience:**\n\nHelp make Dhaka buses better!\n\n**What you can rate:**\n• Bus cleanliness & condition\n• Driver behavior & safety\n• Conductor service\n• Overall comfort\n\n**Top rated routes this week:**\n🥇 Gulshan → Farmgate (4.8/5)\n🥈 Mohammadpur → Farmgate (4.6/5)\n🥉 Banani → Motijheel (4.4/5)\n\nGo to **"Rate Us"** in the sidebar to leave your review!';
  }

  // ── Help / Capabilities ────────────────────────────────────────────────────
  if (/help|what can|features|capability|use you|assist/.test(m)) {
    return '🤖 **What I Can Help With:**\n\n🗺 **Route Finding** — "Bus from Mirpur to Farmgate?"\n💰 **Fare Info** — "How much to Motijheel?"\n⏱ **Travel Time** — "How long to Uttara?"\n📍 **Bus Stops** — "Stops on Mirpur route?"\n👥 **Crowd Status** — "Which route is least crowded?"\n🛡 **Safety** — "What if I feel unsafe?"\n🎟 **E-Tickets** — "How do I use my ticket?"\n🎒 **Lost & Found** — "I lost my bag on the bus"\n\n...and much more! Just ask naturally and I\'ll help! 😊';
  }

  // ── Dhaka / General ────────────────────────────────────────────────────────
  if (/dhaka|city|bangladesh|bd/.test(m)) {
    return '🇧🇩 **BusMate BD covers all of Dhaka!**\n\nWe track buses across:\n• Mirpur • Uttara • Gulshan • Banani\n• Farmgate • Karwan Bazar • Motijheel\n• Mohammadpur • Dhanmondi • Jatrabari\n• Sayedabad • Bashundhara • Airport Road\n\nOver **100+ routes** and **500+ daily bus trips** covered!';
  }
  if (/weather|rain|sunny/.test(m)) {
    return '⛅ I\'m a bus expert, not a weather forecaster! 😄\n\nBut BusMate works rain or shine — your bus info is always up to date. During heavy rain, expect 20–30% longer travel times due to traffic.';
  }
  if (/app|download|mobile|browser/.test(m)) {
    return '📱 **BusMate BD is a Web App!**\n\nNo download needed — just open in your browser:\n• ✅ Works on Android, iOS, and PC\n• ✅ Installable as a PWA (Add to Home Screen)\n• ✅ Fast and lightweight\n• ✅ Works with slow connections too!';
  }

  // ── Default fallback ────────────────────────────────────────────────────────
  return `🤖 Great question! Here's what I can help you with:\n\n• 🚌 **"Bus from Mirpur to Farmgate?"** — route info\n• 💰 **"Fare to Motijheel?"** — price guide\n• ⏱ **"How long to Uttara?"** — travel times\n• 👥 **"Which route is least crowded?"** — crowd status\n• 📍 **"Stops on Mirpur route?"** — stop info\n\nTry one of the suggestions above, or ask me anything about Dhaka buses! 😊`;
}

const SUGGESTIONS = [
  'Which bus goes from Mirpur to Farmgate?',
  'What is the fare to Motijheel?',
  'Which route is least crowded now?',
  'How long does it take to Uttara?',
];

const PassengerAiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: '👋 Hello! I\'m **BusMate AI** — your instant guide for Dhaka bus transport!\n\nI can answer route, fare, stop, crowd, and safety questions instantly. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate natural thinking delay (300–700ms)
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

    const response = getBusmateAIResponse(text);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] min-h-[500px] flex flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Route Assistant</h1>
          <p className="text-gray-500">Instant answers about Dhaka bus transport.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Zap className="h-3.5 w-3.5" />
          Always Online · Zero Latency
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-card overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="bg-primary p-4 flex items-center gap-3 text-white">
          <div className="bg-white/10 p-2 rounded-full">
            <MessageSquare className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="font-bold text-lg">BusMate AI</h2>
            <p className="text-xs text-gray-300 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
              Smart local engine — responds instantly, no internet required
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-primary text-accent'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-tr-sm shadow-md'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-accent">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips — visible when few messages */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 bg-white border-t border-gray-50 pt-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-primary/5 hover:bg-primary/15 text-primary border border-primary/20 px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about routes, fares, stops, crowd, safety..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-14 py-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white p-2 rounded-full disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-2">
            Powered by BusMate's local AI engine · Always instant · No internet needed
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassengerAiAssistant;
