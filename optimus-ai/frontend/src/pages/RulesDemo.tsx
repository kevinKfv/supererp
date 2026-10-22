import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { 
  Loader2, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Play, 
  HelpCircle, 
  Info,
  Code2,
  FileCode,
  Sparkles
} from 'lucide-react';

type RuleCondition = {
  field: string;
  operator: string;
  value: any;
};

type RuleItem = {
  id: string;
  conditions: RuleCondition[];
  condition_logic: 'AND' | 'OR';
  action: string;
  priority: number;
};

type EvaluationResult = {
  rule_id: string;
  passed: boolean;
  action?: string;
};

const presetScenarios = [
  {
    name: 'Descuento por Monto de Venta',
    desc: 'Aplica bonificación si el monto total supera los $1.000',
    rules: [
      {
        id: 'RULE_DESCUENTO_MAYORISTA',
        conditions: [{ field: 'monto_orden', operator: '>', value: 1000 }],
        condition_logic: 'AND' as const,
        action: 'APLICAR_DESCUENTO_10%',
        priority: 10,
      },
    ],
    facts: {
      monto_orden: 1450,
      categoria_cliente: 'CORPORATIVO',
    },
  },
  {
    name: 'Control de Riesgo y Fraude',
    desc: 'Dispara alerta si la transacción es elevada o el usuario es de riesgo',
    rules: [
      {
        id: 'RULE_ALERTA_FRAUDE_CRITICA',
        conditions: [
          { field: 'monto_transaccion', operator: '>', value: 5000 },
          { field: 'es_dispositivo_nuevo', operator: '==', value: true },
        ],
        condition_logic: 'AND' as const,
        action: 'BLOQUEO_PREVENTIVO_Y_SMS',
        priority: 100,
      },
      {
        id: 'RULE_ALERTA_MONITOREO',
        conditions: [{ field: 'score_riesgo', operator: '>=', value: 75 }],
        condition_logic: 'AND' as const,
        action: 'SOLICITAR_SEGUNDO_FACTOR',
        priority: 50,
      },
    ],
    facts: {
      monto_transaccion: 6200,
      es_dispositivo_nuevo: true,
      score_riesgo: 82,
    },
  },
  {
    name: 'Prioridad de Envío Logístico',
    desc: 'Agiliza el despacho si es cliente VIP o el pedido está marcado como urgente',
    rules: [
      {
        id: 'RULE_DESPACHO_PRIORITARIO',
        conditions: [
          { field: 'tipo_cliente', operator: '==', value: 'VIP' },
          { field: 'envio_urgente', operator: '==', value: true },
        ],
        condition_logic: 'OR' as const,
        action: 'ASIGNAR_LOGISTICA_EXPRESS',
        priority: 20,
      },
    ],
    facts: {
      tipo_cliente: 'REGULAR',
      envio_urgente: true,
      peso_kg: 12.5,
    },
  },
];

export const RulesDemo = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [rulesJson, setRulesJson] = useState(
    JSON.stringify(presetScenarios[0].rules, null, 2)
  );
  const [factsJson, setFactsJson] = useState(
    JSON.stringify(presetScenarios[0].facts, null, 2)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<EvaluationResult[] | null>(null);
  const [triggeredActions, setTriggeredActions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setRulesJson(JSON.stringify(presetScenarios[index].rules, null, 2));
    setFactsJson(JSON.stringify(presetScenarios[index].facts, null, 2));
    setResults(null);
    setTriggeredActions([]);
    setError(null);
  };

  const handleEvaluate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let parsedRules: RuleItem[];
      let parsedFacts: Record<string, any>;

      try {
        parsedRules = JSON.parse(rulesJson);
        if (!Array.isArray(parsedRules)) {
          throw new Error('El conjunto de reglas debe ser un arreglo JSON [...]');
        }
      } catch (err: any) {
        setError(`Error en JSON de Reglas: ${err.message}`);
        setIsLoading(false);
        return;
      }

      try {
        parsedFacts = JSON.parse(factsJson);
        if (typeof parsedFacts !== 'object' || parsedFacts === null) {
          throw new Error('Los hechos deben ser un objeto JSON { ... }');
        }
      } catch (err: any) {
        setError(`Error en JSON de Hechos: ${err.message}`);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(API_ENDPOINTS.rules.evaluate, {
        rules: parsedRules,
        facts: parsedFacts,
      });

      if (response.data) {
        setResults(response.data.results || []);
        setTriggeredActions(response.data.triggered_actions || []);
      }
    } catch {
      setError('Error al evaluar las reglas en el Rules Engine. Verificá los campos y el servicio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge-amber">
            <Sliders size={13} className="text-amber-400" /> Lógica Declarativa
          </span>
          <span className="badge-glow">
            <Code2 size={13} className="text-primary" /> JSON AST Pure Python
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Motor de Reglas de Negocio</h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
          Evaluador puro en Python (JSON AST) que valida condiciones dinámicas y dispara acciones operativas sin modificar código fuente.
        </p>
      </header>

      {/* Apartado Explicativo del Módulo de Reglas */}
      <section aria-label="Información del motor de reglas" className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/85 to-surfaceHighlight/50 p-6 sm:p-7 text-slate-200 backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-glow-primary">
            <Info size={22} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Este módulo implementa un <strong>Evaluador de Reglas de Negocio basado en JSON AST (Abstract Syntax Tree)</strong>. Procesa estructuras compuestas con operadores relacionales (<code>==</code>, <code>!=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>, <code>in</code>) y conectores lógicos (<code>AND</code>, <code>OR</code>, <code>NOT</code>).
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>¿Para qué se usa?</strong> En las empresas, las políticas de crédito, tarifas comerciales, límites de fraude o protocolos de despacho cambian constantemente. Este motor permite modificar las reglas en caliente vía JSON <strong>sin necesidad de recompilar, programar o redesplegar el backend</strong>.
            </p>
          </div>
        </div>

        {/* Guía de Componentes */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <Sliders size={18} />
            <span>Guía de Estructura: ¿Cómo se componen las reglas?</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">1. Hechos (Facts / JSON)</span>
              <p className="text-slate-300">Son los datos del evento a evaluar (ej: monto de compra, tipo de cliente, si es nuevo dispositivo o scoring crediticio).</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">2. Condiciones (Rules / AST)</span>
              <p className="text-slate-300">Las premisas que deben verificarse. Pueden anidar múltiples condiciones con conectores <code>AND</code> o <code>OR</code>.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">3. Acciones Disparadas</span>
              <p className="text-slate-300">Las instrucciones automáticas que el sistema ejecuta si la regla se cumple (ej: <code>APLICAR_DESCUENTO_10%</code>).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preset Scenarios */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Casos de Uso Empresariales</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {presetScenarios.map((sc, idx) => (
            <button
              key={sc.name}
              type="button"
              onClick={() => handleSelectScenario(idx)}
              className={`group flex flex-col items-start rounded-2xl border p-4 text-left transition-all active:scale-98 ${
                selectedScenarioIndex === idx
                  ? 'border-primary bg-primary/20 shadow-glow-primary'
                  : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">{sc.name}</span>
                <Sparkles size={14} className={selectedScenarioIndex === idx ? 'text-primary' : 'text-slate-500'} />
              </div>
              <span className="mt-1.5 text-xs text-slate-400 leading-relaxed">{sc.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Editor & Execution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <section className="glass-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-primary" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reglas Configuradas (JSON AST)</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">==, !=, &gt;, &lt;, &gt;=, &lt;=, IN</span>
            </div>
            <textarea
              rows={8}
              value={rulesJson}
              onChange={(e) => setRulesJson(e.target.value)}
              className="premium-input w-full font-mono text-xs leading-relaxed bg-black/50 border-white/15"
              spellCheck={false}
            />
          </section>

          <section className="glass-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Hechos / Datos a Evaluar (Facts)</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Payload JSON</span>
            </div>
            <textarea
              rows={5}
              value={factsJson}
              onChange={(e) => setFactsJson(e.target.value)}
              className="premium-input w-full font-mono text-xs leading-relaxed bg-black/50 border-white/15"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isLoading}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-primary to-cyan-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Evaluando condiciones AST...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Evaluar Conjunto de Reglas</span>
                </>
              )}
            </button>
          </section>
        </div>

        {/* Results Panel */}
        <section className="glass-card flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Resultado de la Evaluación</h2>
                <p className="mt-0.5 text-xs text-slate-400">Respuestas generadas por el evaluador de reglas.</p>
              </div>
              <span className="font-mono text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                Rules :8005
              </span>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-red-200 animate-slide-up">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            {!results && !error && !isLoading && (
              <div className="my-16 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/25 text-primary">
                  <Sliders size={32} />
                </div>
                <p className="mt-4 font-bold text-white text-base">Sin evaluación ejecutada</p>
                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  Presioná "Evaluar Conjunto de Reglas" para procesar las condiciones contra los hechos suministrados.
                </p>
              </div>
            )}

            {results && !isLoading && (
              <div className="mt-5 space-y-5 animate-slide-up">
                {/* Actions Triggered Summary */}
                <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-black/40 to-slate-900/90 p-5 backdrop-blur-md shadow-glow-emerald">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-amber-400" />
                    <span className="text-sm font-bold text-white tracking-tight">Acciones Disparadas</span>
                  </div>
                  {triggeredActions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {triggeredActions.map((action, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/20 px-3.5 py-1.5 text-xs font-mono font-bold text-amber-200 shadow-sm"
                        >
                          <Zap size={14} className="text-amber-300" /> {action}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">Ninguna regla activó acciones para este payload de hechos.</p>
                  )}
                </div>

                {/* Rules Details */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detalle por Regla</h3>
                  <div className="space-y-2.5">
                    {results.map((res) => (
                      <div
                        key={res.rule_id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm transition-all ${
                          res.passed
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 shadow-sm'
                            : 'border-white/10 bg-black/30 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {res.passed ? (
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle size={18} className="text-slate-500 shrink-0" />
                          )}
                          <span className="font-mono font-semibold text-white">{res.rule_id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {res.passed && res.action && (
                            <span className="rounded-md bg-black/60 border border-amber-500/30 px-2.5 py-0.5 font-mono text-xs text-amber-300">
                              {res.action}
                            </span>
                          )}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${res.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                            {res.passed ? 'CUMPLIDA' : 'NO CUMPLE'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs text-slate-400">
            <div className="flex items-start gap-2.5">
              <HelpCircle size={16} className="shrink-0 text-primary mt-0.5" />
              <span className="leading-relaxed">
                <strong>Lógica Desacoplada:</strong> Las reglas son evaluadas por orden de prioridad decreciente. Cada regla evalúa sus condiciones según la lógica especificada (AND u OR) contra los hechos sin persistencia intermedia.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
