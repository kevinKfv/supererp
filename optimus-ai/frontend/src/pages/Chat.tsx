import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Send, Bot, User, Loader2, ArrowRight, Info, Sparkles } from 'lucide-react';

type Message =
  | { role: 'user'; content: string }
  | {
      role: 'assistant';
      content: string;
      data?: any;
      explanation?: string;
      isError?: boolean;
      retryText?: string;
    };

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestIntent = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/chat/intent', {
        user_input: text,
      });
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: 'Instrucción interpretada. Revisá los parámetros extraídos y la acción recomendada.',
          data: response.data.extracted_intent,
          explanation: response.data.explanation,
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: 'No se pudo interpretar la instrucción.',
          isError: true,
          retryText: text,
        },
      ]);
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
    <div className={`flex max-w-4xl flex-col gap-6 ${messages.length ? 'min-h-[calc(100dvh-7rem)] md:h-[calc(100vh-4rem)] md:min-h-0' : ''}`}>
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">
          Knowledge Engine
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Interpretar Instrucciones con IA</h1>
        <p className="mt-2 max-w-2xl text-gray-300">
          Escribí tu objetivo de negocio en lenguaje natural. El asistente extraerá la intención, estructurará los parámetros y te derivará al motor correspondiente.
        </p>
      </header>

      {/* Apartado Explicativo del Chat / Knowledge Engine */}
      <section aria-label="Información del asistente IA" className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-gray-200">
        <div className="flex items-start gap-3">
          <Info size={22} className="text-primary mt-0.5 shrink-0" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Este módulo funciona con el <strong>Knowledge Engine</strong> de OptimusAI. Combina procesamiento de lenguaje natural (NLP) con <strong>Inteligencia Artificial Explicable (XAI - Explainable AI)</strong> y recuperación en base vectorial con <strong>Qdrant</strong>.
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              <strong>¿Para qué se usa?</strong> Permite a directores y operadores interactuar con toda la suite de optimización mediante lenguaje coloquial. No necesitás saber cómo programar un solver MIP o una simulación: le pedís al chat tu meta y la IA <strong>clasifica la intención (Optimizar, Predecir, Simular o Aplicar Reglas)</strong>, extrae los parámetros numéricos y genera una explicación en lenguaje humano.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-surface/90 p-3.5 text-xs text-gray-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
            <Sparkles size={16} />
            <span>Ejemplos de frases que podés probar:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li><em>"Quiero optimizar los turnos del equipo para reducir los costos al mínimo."</em></li>
            <li><em>"Predecir las ventas si fijamos el precio en 120 e invertimos 300 en marketing."</em></li>
            <li><em>"Evaluar el riesgo de un proyecto nuevo con ingresos de 200.000 y costos de 140.000."</em></li>
            <li><em>"Verificar qué descuento comercial le corresponde a un cliente con compra mayor a 1.000."</em></li>
          </ul>
        </div>
      </section>

      <section aria-label="Interpretación de instrucciones" className={`glass-card flex min-w-0 flex-col overflow-hidden ${messages.length ? 'min-h-[24rem] flex-1' : 'min-h-[18rem]'}`}>
        <div role="log" aria-label="Conversación" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-300">
              <Bot size={36} aria-hidden="true" className="text-primary" />
              <p className="font-medium text-white">¿En qué puedo ayudarte?</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mt-2">
                <button
                  type="button"
                  onClick={() => { setInput('Reducir costos de logística en un 15%'); }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-200 hover:bg-white/10"
                >
                  «Reducir costos en un 15%»
                </button>
                <button
                  type="button"
                  onClick={() => { setInput('Simular riesgo y rentabilidad para el próximo trimestre'); }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-200 hover:bg-white/10"
                >
                  «Simular riesgo y rentabilidad»
                </button>
                <button
                  type="button"
                  onClick={() => { setInput('Asignar empleados a las tareas pendientes'); }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-200 hover:bg-white/10"
                >
                  «Asignar empleados a tareas»
                </button>
              </div>
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
                
                {message.role === 'assistant' && message.data != null && (
                  <div className="mt-3 space-y-3">
                    {message.explanation && (
                      <p className="break-words text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10">
                        {message.explanation}
                      </p>
                    )}

                    {/* Action buttons based on detected intent */}
                    {(message.data.intent === 'OPTIMIZE' || message.data.intent === 'ASSIGN') && (
                      <Link
                        to="/optimization"
                        className="inline-flex items-center gap-2 rounded-lg bg-primaryDark px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                      >
                        Abrir Motor de Optimización <ArrowRight size={14} />
                      </Link>
                    )}

                    {message.data.intent === 'SIMULATE' && (
                      <Link
                        to="/simulation"
                        className="inline-flex items-center gap-2 rounded-lg bg-primaryDark px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                      >
                        Abrir Simulación Monte Carlo <ArrowRight size={14} />
                      </Link>
                    )}

                    <details className="mt-2 max-w-full">
                      <summary className="cursor-pointer text-xs font-medium text-blue-300">Ver payload JSON extraído</summary>
                      <pre className="mt-2 max-w-full overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 font-mono">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </details>
                  </div>
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
                placeholder="Escribí acá (ej. «Reducir costos de producción en 20%»)"
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
