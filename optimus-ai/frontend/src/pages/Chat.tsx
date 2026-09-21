import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export const Chat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Usamos localhost:8006 porque es donde vive el Knowledge Engine en el docker-compose
      const res = await axios.post('http://localhost:8006/api/v1/chat/intent', {
        user_input: userMsg
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.explanation,
        data: res.data.extracted_intent
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Error al comunicarse con el Knowledge Engine. ¿Están corriendo los contenedores de Docker?",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Knowledge Assistant</h1>
        <p className="text-gray-400 mt-2">IA Conversacional y XAI (Explainable AI).</p>
      </header>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Bot size={48} className="mb-4 text-white/20" />
              <p>Prueba con: "Reducí costos un 15%"</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/10 text-accent'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary/20 text-white rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
              }`}>
                <p>{msg.content}</p>
                {msg.data && (
                  <pre className="mt-4 p-3 rounded-xl bg-black/40 text-xs text-gray-400 overflow-x-auto">
                    {JSON.stringify(msg.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-white/10 text-accent flex items-center justify-center">
                 <Bot size={20} />
               </div>
               <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center">
                 <Loader2 className="animate-spin text-accent" size={20} />
               </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/10">
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un comando en lenguaje natural..."
              className="premium-input pr-12"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
