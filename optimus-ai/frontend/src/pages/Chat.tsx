import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

type Message =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; data?: unknown; explanation?: string; isError?: boolean; retryText?: string };

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestIntent = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8006/api/v1/chat/intent', {
        user_input: text,
      });
      setMessages((previous) => [...previous, {
        role: 'assistant',
        content: 'Instrucción interpretada. Revisá los datos extraídos para confirmar si coinciden con lo que quisiste decir.',
        data: response.data.extracted_intent,
        explanation: response.data.explanation,
      }]);
    } catch {
      setMessages((previous) => [...previous, {
        role: 'assistant',
        content: 'No se pudo interpretar la instrucción. El servicio puede no estar disponible.',
        isError: true,
        retryText: text,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setMessages((previous) => [...previous, { role: 'user', content: text }]);
    setInput('');
    void requestIntent(text);
  };

  const retryMessage = (index: number, text: string) => {
    if (isLoading) return;
    setMessages((previous) => previous.filter((_, current) => current !== index));
    void requestIntent(text);
  };

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-6 md:h-[calc(100vh-4rem)] md:min-h-0">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Interpretar instrucciones</h1>
        <p className="mt-2 max-w-2xl text-gray-300">
          Escribí una solicitud para ver cómo la interpreta el sistema. Esta función no ejecuta optimizaciones, simulaciones ni otros análisis.
        </p>
      </header>

      <section aria-label="Interpretación de instrucciones" className="glass-card flex min-h-[24rem] min-w-0 flex-1 flex-col overflow-hidden">
        <div role="log" aria-label="Conversación" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-300">
              <Bot size={36} aria-hidden="true" className="text-primary" />
              <p>Probá con: «Reducí costos un 15 %».</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex min-w-0 gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full sm:flex ${message.role === 'user' ? 'bg-primary text-white' : 'bg-white/10 text-accentLight'}`}>
                {message.role === 'user' ? <User size={18} aria-hidden="true" /> : <Bot size={18} aria-hidden="true" />}
              </div>
              <div className={`min-w-0 max-w-full rounded-xl p-4 text-sm leading-relaxed sm:max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary/20 text-white'
                  : message.isError
                    ? 'border border-red-400/40 bg-red-400/10 text-red-100'
                    : 'border border-white/10 bg-background text-gray-200'
              }`} role={message.role === 'assistant' && message.isError ? 'alert' : undefined}>
                <p className="mb-1 text-xs font-semibold text-gray-300">{message.role === 'user' ? 'Vos' : message.isError ? 'Error' : 'Interpretación'}</p>
                <p className="break-words">{message.content}</p>
                {message.role === 'assistant' && !message.isError && (
                  <p className="mt-3 text-xs text-gray-400">Interpretación únicamente. No se ejecutó ningún análisis.</p>
                )}
                {message.role === 'assistant' && message.data != null && (
                  <details className="mt-3 max-w-full">
                    <summary className="cursor-pointer text-sm font-medium text-blue-300">Ver detalle de la interpretación</summary>
                    {message.explanation && (
                      <div className="mt-2 break-words text-gray-300">
                        <p>El texto del servicio puede mencionar acciones futuras que esta pantalla no ejecuta:</p>
                        <p className="mt-1">«{message.explanation}»</p>
                      </div>
                    )}
                    <pre className="mt-2 max-w-full overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-gray-300">{JSON.stringify(message.data, null, 2)}</pre>
                  </details>
                )}
                {message.role === 'assistant' && message.retryText && (
                  <button type="button" disabled={isLoading} onClick={() => retryMessage(index, message.retryText!)} className="mt-3 min-h-11 rounded-lg border border-red-300/40 px-4 py-2 font-medium text-white transition-colors hover:bg-red-400/10 disabled:opacity-50">
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div role="status" className="flex items-center gap-3 text-sm text-gray-300">
              <Loader2 size={20} aria-hidden="true" className="animate-spin text-primary" />
              Interpretando instrucción…
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4 sm:p-5">
          <form onSubmit={sendMessage}>
            <label htmlFor="instruction" className="mb-2 block text-sm font-medium text-gray-200">Instrucción</label>
            <div className="relative">
              <input
                id="instruction"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ej.: Reducí costos un 15 %"
                className="premium-input min-h-11 pr-16"
                disabled={isLoading}
              />
              <button
                type="submit"
                aria-label="Enviar instrucción"
                disabled={isLoading || !input.trim()}
                className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-primaryDark text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
