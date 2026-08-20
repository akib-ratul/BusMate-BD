import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot, Loader2, Zap } from 'lucide-react';
import api from '../../api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

// Smart local AI engine — runs 100% in browser, zero latency, no backend needed
function getLocalAIResponse(message: string): string | null {
  const m = message.toLowerCase().trim();

  const map: Array<[RegExp, string]> = [
    [/\b(hi|hello|hey|salam|assalamu|yo)\b/, '👋 Hello! I\'m BusMate AI. How can I help with your Dhaka bus journey today?'],
    [/how are you/, '😊 I\'m running perfectly and ready to help you navigate Dhaka!'],
    [/who are you|your name|what are you/, '🤖 I\'m BusMate AI — your smart guide for Dhaka public bus transport!'],
    [/joke|funny|laugh/, '🤣 Why did the bus driver quit? He couldn\'t take people to another level! 😄'],
    [/thanks|thank you|dhonnobad|shukriya/, '🙏 You\'re welcome! Have a safe trip with BusMate!'],
    [/bye|goodbye|see you/, '👋 Goodbye! Stay safe and travel smart with BusMate!'],
    [/ticket|e-ticket|boarding/, '🎟️ View your digital E-Ticket from "My Tickets" in the sidebar. It includes a QR code for boarding!'],
    [/notif|notification|alert/, '🔔 Check your notifications in the "Notifications" section in the sidebar for alerts and updates.'],
    [/lost|found|item/, '🎒 Browse or report lost items in the "Lost & Found" section accessible from the main menu.'],
    [/safe|safety|sos|emergency|help/, '🛡️ For emergencies, use the SOS button in the "Safety SOS" section. It alerts admins with your location!'],
    [/rate|rating|review|feedback/, '⭐ You can rate your bus and driver using the "Rate Us" feature in the sidebar!'],
    [/crowd|busy|full|packed/, '👥 Report or check crowd status using the "Report Crowd" feature in the sidebar!'],
    [/ticket|fare|cost|price|taka|৳/, '💰 Use the Fare Calculator in the sidebar to get exact trip costs between any two Dhaka stops.'],
    [/stop|stops|station/, '📍 Click "View Stops" on any route in the Routes section to see all bus stops on that route.'],
    [/driver|conductor/, '🚌 View your driver\'s details in the Live Map section when tracking a bus.'],
    [/map|live|track|location/, '🗺️ The Live Map shows all active buses moving in real-time across Dhaka! Check the "Live Map" tab.'],
    [/ai|smart|intelligent/, '🤖 I\'m a smart AI trained specifically for Dhaka bus transport. Ask me anything about routes, fares, or stops!'],
    [/dhaka|city|bangladesh|bd/, '🇧🇩 BusMate BD covers all major bus routes across Dhaka city, from Mirpur to Jatrabari and beyond!'],
    [/weather|rain/, '⛅ I only track buses, not clouds! BusMate works rain or shine — your bus info is always up to date.'],
    [/time|how long|duration/, '⏱️ Journey times depend on your route. Check the Routes section for estimated travel durations.'],
    [/register|sign up|account/, '📝 Create a free account at busmatebd.com to access all features including live tracking and e-tickets!'],
    [/password|login|sign in/, '🔐 Use your registered email and password to log in. Demo: passenger@busmatebd.demo / Demo@2024!'],
    [/app|download|mobile/, '📱 BusMate BD is a web app — just open it in your browser on any device, no download needed!'],
  ];

  for (const [pattern, response] of map) {
    if (pattern.test(m)) return response;
  }

  return null; // No local match — needs backend for bus-specific query
}

// Keywords that indicate we need to fetch real bus data from backend
function needsBackendData(message: string): boolean {
  const m = message.toLowerCase();
  const busKeywords = ['route', 'bus', 'from', 'to ', ' to', 'mirpur', 'farmgate', 'uttara', 'motijheel',
    'gulshan', 'mohammadpur', 'dhanmondi', 'jatrabari', 'bashundhara', 'banani', 'shahbagh',
    'karwan', 'shewrapara', 'which bus', 'go to', 'travel', 'how to reach'];
  return busKeywords.some(k => m.includes(k));
}

const SUGGESTIONS = [
  'Which bus goes from Mirpur to Farmgate?',
  'What is the fare to Motijheel?',
  'Which route is least crowded?',
  'How do I book an e-ticket?',
];

const PassengerAiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: '👋 Hello! I\'m **BusMate AI**, your instant guide for Dhaka bus transport!\n\nI can help you with:\n• 🗺 Route finding & bus info\n• 💰 Fare estimates\n• 👥 Crowd status\n• 🎟 E-tickets & trip info\n\nJust ask me anything!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. First try instant local AI (zero latency)
      const localResponse = getLocalAIResponse(text);

      if (localResponse && !needsBackendData(text)) {
        // Simulate slight typing delay for natural feel
        await new Promise(r => setTimeout(r, 400));
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: localResponse };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // 2. Call backend only for bus route/fare specific queries
        try {
          const res = await api.post('/api/ai/chat', { message: text });
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: res.data.data.response
          };
          setMessages(prev => [...prev, aiMsg]);
        } catch (backendErr) {
          // Backend failed (cold start / offline) — show helpful fallback
          const fallback = '🚌 I\'m having trouble connecting to the live bus database right now (the server may be starting up). Here\'s what I can tell you:\n\n• Use the **Routes** tab to search bus routes\n• Use the **Fare Calculator** for exact fares\n• Check the **Live Map** for real-time buses\n\nPlease try again in a moment!';
          const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: fallback };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-gray-500">Get instant answers about Dhaka bus transport.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Zap className="h-3.5 w-3.5" />
          Instant AI · Always Online
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-card overflow-hidden flex flex-col border border-gray-100">
        <div className="bg-primary p-4 flex items-center gap-3 text-white">
          <div className="bg-white/10 p-2 rounded-full">
            <MessageSquare className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="font-bold text-lg">BusMate AI</h2>
            <p className="text-xs text-gray-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block"></span>
              Powered by local smart engine + live bus data
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-primary text-accent'}
              `}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              <div className={`
                max-w-[80%] rounded-2xl p-4
                ${msg.role === 'user'
                  ? 'bg-accent text-white rounded-tr-sm shadow-md shadow-accent/10'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                }
              `}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-accent">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <span className="text-sm text-gray-500 font-medium">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about routes, fares, stops, or anything else..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-14 py-3 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white p-2 rounded-full disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-2">
            General questions answered instantly · Bus queries fetch live data
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassengerAiAssistant;
