import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ArrowRight, 
  Info, 
  Sparkles,
  BrainCircuit
} from 'lucide-react';

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
    <div className={`flex max-w-4xl flex-col gap-6 pb-12 ${messages.length ? 'min-h-[calc(100dvh-7rem)] md:h-[calc(100vh-4rem)] md:min-h-0' : ''}`}>
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge-purple">
            <Sparkles size={13} className="text-purple-400" /> Knowledge Engine
          </span>
          <span className="badge-glow">
            <BrainCircuit size={13} className="text-primary" /> XAI & Vector Retrieval
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Interpretar Instrucciones con IA</h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
          Escribí tu objetivo de negocio en lenguaje natural. El asistente extraerá la intención, estructurará los parámetros y te derivará al motor correspondiente.
        </p>
      </header>

      {/* Apartado Explicativo del Chat / Knowledge Engine */}
      <section aria-label="Información del asistente IA" className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/85 to-surfaceHighlight/50 p-6 sm:p-7 text-slate-200 backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-glow-primary">
            <Info size={22} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Este módulo funciona con el <strong>Knowledge Engine</strong> de OptimusAI. Combina procesamiento de lenguaje natural (NLP) con <strong>Inteligencia Artificial Explicable (XAI - Explainable AI)</strong> y recuperación en base vectorial con <strong>Qdrant</strong>.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>¿Para qué se usa?</strong> Permite a directores y operadores interactuar con toda la suite de optimización mediante lenguaje coloquial. No necesitás saber cómo programar un solver MIP o una simulación: le pedís al chat tu meta y la IA <strong>clasifica la intención (Optimizar, Predecir, Simular o Aplicar Reglas)</strong>, extrae los parámetros numéricos y genera una explicación en lenguaje humano.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <Sparkles size={16} />
            <span>Ejemplos de frases que podés probar:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300">
            <li><em>"Quiero optimizar los turnos del equipo para reducir los costos al mínimo."</em></li>
            <li><em>"Predecir las ventas si fijamos el precio en 120 e invertimos 300 en marketing."</em></li>
            <li><em>"Evaluar el riesgo de un proyecto nuevo con ingresos de 200.000 y costos de 140.000."</em></li>
            <li><em>"Verificar qué descuento comercial le corresponde a un cliente con compra mayor a 1.000."</em></li>
          </ul>
        </div>
      </section>

      {/* Chat Workspace */}
      <section aria-label="Interpretación de instrucciones" className={`glass-card flex min-w-0 flex-col overflow-hidden border border-white/15 ${messages.length ? 'min-h-[24rem] flex-1' : 'min-h-[20rem]'}`}>
        <div role="log" aria-label="Conversación" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="my-10 flex h-full flex-col items-center justify-center gap-3 text-center text-slate-300">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 text-primary shadow-glow-primary">
                <Bot size={36} aria-hidden="true" />
              </div>
              <p className="font-bold text-white text-lg mt-2">¿En qué puedo ayudarte hoy?</p>
              <p className="text-xs text-slate-400 max-w-sm">Elegí una consulta rápida de ejemplo o ingresá tu instrucción empresarial abajo:</p>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mt-3">
                <button
                  type="button"
                  onClick={() => { setInput('Reducir costos de logística en un 15%'); }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-primary/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  ⚡ «Reducir costos en un 15%»
                </button>
                <button
                  type="button"
                  onClick={() => { setInput('Simular riesgo y rentabilidad para el próximo trimestre'); }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-primary/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  ⚡ «Simular riesgo y rentabilidad»
                </button>
                <button
                  type="button"
                  onClick={() => { setInput('Asignar empleados a las tareas pendientes'); }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-primary/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  ⚡ «Asignar empleados a tareas»
                </button>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex min-w-0 gap-3.5 animate-slide-up ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border sm:flex ${
                message.role === 'user' 
                  ? 'border-blue-500/30 bg-blue-600/20 text-blue-300 shadow-glow-primary' 
                  : 'border-purple-500/30 bg-purple-600/20 text-purple-300 shadow-glow-accent'
              }`}>
                {message.role === 'user' ? <User size={18} aria-hidden="true" /> : <Bot size={18} aria-hidden="true" />}
              </div>

              <div className={`min-w-0 max-w-full rounded-2xl p-4 sm:p-5 text-sm leading-relaxed sm:max-w-[80%] shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600/30 to-primary/25 border border-blue-500/30 text-white'
                  : message.isError
                    ? 'border border-red-500/40 bg-red-500/15 text-red-100'
                    : 'border border-white/15 bg-black/40 text-slate-200 backdrop-blur-md'
              }`} role={message.role === 'assistant' && message.isError ? 'alert' : undefined}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {message.role === 'user' ? 'Vos' : message.isError ? 'Error de Interpretación' : 'OptimusAI Knowledge Engine'}
                  </span>
                  {message.role === 'assistant' && !message.isError && (
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-mono text-primary border border-primary/30">
                      NLP / XAI
                    </span>
                  )}
                </div>

                <p className="break-words">{message.content}</p>
                
                {message.role === 'assistant' && message.data != null && (
                  <div className="mt-4 space-y-3.5 border-t border-white/10 pt-3">
                    {message.explanation && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-white block mb-1">Explicación Cognitiva:</span>
                        {message.explanation}
                      </div>
                    )}

                    {/* Action buttons based on detected intent */}
                    {(message.data.intent === 'OPTIMIZE' || message.data.intent === 'ASSIGN') && (
                      <Link
                        to="/optimization"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:brightness-110 active:scale-95"
                      >
                        Abrir Motor de Optimización <ArrowRight size={14} />
                      </Link>
                    )}

                    {message.data.intent === 'SIMULATE' && (
                      <Link
                        to="/simulation"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/25 transition-all hover:brightness-110 active:scale-95"
                      >
                        Abrir Simulación Monte Carlo <ArrowRight size={14} />
                      </Link>
                    )}

                    {message.data.intent === 'PREDICT' && (
                      <Link
                        to="/prediction"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:brightness-110 active:scale-95"
                      >
                        Abrir Predicción con XGBoost <ArrowRight size={14} />
                      </Link>
                    )}

                    <details className="mt-2 max-w-full">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors">
                        Ver payload JSON estructurado
                      </summary>
                      <pre className="mt-2 max-w-full overflow-x-auto rounded-xl bg-black/60 border border-white/10 p-3 text-xs text-slate-300 font-mono">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {message.role === 'assistant' && message.retryText && (
                  <button 
                    type="button" 
                    disabled={isLoading} 
                    onClick={() => retryMessage(index, message.retryText!)} 
                    className="mt-3 min-h-10 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-400/20 disabled:opacity-50"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div role="status" className="flex items-center gap-3 text-sm text-slate-300 animate-pulse">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              </div>
              <span className="font-medium text-xs sm:text-sm">Interpretando instrucción con Knowledge Engine…</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-slate-950/60 p-4 sm:p-5 backdrop-blur-xl">
          <form onSubmit={sendMessage}>
            <label htmlFor="instruction" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Instrucción
            </label>
            <div className="relative">
              <input
                id="instruction"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribí acá (ej. «Reducir costos de producción en 20%»)"
                className="premium-input min-h-12 pr-14 text-sm font-medium"
                disabled={isLoading}
              />
              <button
                type="submit"
                aria-label="Enviar instrucción"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-primary text-white shadow-md shadow-blue-500/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
