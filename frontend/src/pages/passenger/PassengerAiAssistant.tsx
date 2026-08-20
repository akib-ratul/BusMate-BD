import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';
import api from '../../api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const PassengerAiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hello! I am your BusMate AI Assistant. How can I help you with your journey today?'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/ai/chat', { message: userMsg.content });
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: res.data.data.response 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: 'I apologize, but I am having trouble connecting to my service right now. Please try again later.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] min-h-[500px] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Route Assistant</h1>
        <p className="text-gray-500">Get intelligent recommendations and answers about Dhaka transport.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-card overflow-hidden flex flex-col border border-gray-100">
        <div className="bg-primary p-4 flex items-center gap-3 text-white">
          <div className="bg-white/10 p-2 rounded-full">
            <MessageSquare className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="font-bold text-lg">BusMate AI</h2>
            <p className="text-xs text-gray-300">Powered by Gemini</p>
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

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about routes, fares, or bus schedules..."
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
            AI can make mistakes. Verify important information like exact timings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassengerAiAssistant;
