import { useState } from 'react';
import axios from 'axios';
import { Loader2, Sliders, CheckCircle2, XCircle, Zap, Play, HelpCircle } from 'lucide-react';

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

      const response = await axios.post('http://localhost:8000/api/v1/rules/evaluate/', {
        rules: parsedRules,
        facts: parsedFacts,
      });

      if (response.data) {
        setResults(response.data.results || []);
        setTriggeredActions(response.data.triggered_actions || []);
      }
    } catch (err: any) {
      setError('Error al evaluar las reglas en el Rules Engine. Verificá los campos y el servicio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">
          Lógica Declarativa
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Motor de Reglas de Negocio</h1>
        <p className="mt-2 max-w-2xl text-gray-300">
          Evaluador puro en Python (JSON AST) que valida condiciones dinámicas y dispara acciones operativas sin modificar código fuente.
        </p>
      </header>

      {/* Preset Scenarios */}
      <section className="glass-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Casos de Uso Empresariales</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {presetScenarios.map((sc, idx) => (
            <button
              key={sc.name}
              type="button"
              onClick={() => handleSelectScenario(idx)}
              className={`flex flex-col items-start rounded-lg border p-3.5 text-left transition-colors ${
                selectedScenarioIndex === idx
                  ? 'border-primary bg-primary/15'
                  : 'border-white/10 bg-background/50 hover:bg-white/5'
              }`}
            >
              <span className="font-semibold text-white">{sc.name}</span>
              <span className="mt-1 text-xs text-gray-400">{sc.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Editor & Execution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="glass-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Reglas Configuradas (JSON AST)</h2>
              <span className="text-xs text-gray-400">Operadores: ==, !=, &gt;, &lt;, &gt;=, &lt;=, IN</span>
            </div>
            <textarea
              rows={8}
              value={rulesJson}
              onChange={(e) => setRulesJson(e.target.value)}
              className="premium-input mt-3 w-full font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
          </section>

          <section className="glass-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Hechos / Datos a Evaluar (Facts)</h2>
              <span className="text-xs text-gray-400">Notación de objeto o punto</span>
            </div>
            <textarea
              rows={5}
              value={factsJson}
              onChange={(e) => setFactsJson(e.target.value)}
              className="premium-input mt-3 w-full font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isLoading}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primaryDark font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  Evaluando condiciones AST...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Evaluar Conjunto de Reglas
                </>
              )}
            </button>
          </section>
        </div>

        {/* Results */}
        <section className="glass-card flex flex-col justify-between p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Resultado de la Evaluación</h2>
            <p className="mt-1 text-sm text-gray-400">
              Respuestas generadas por el evaluador de reglas.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">
                <p>{error}</p>
              </div>
            )}

            {!results && !error && !isLoading && (
              <div className="mt-16 flex flex-col items-center justify-center text-center text-gray-400">
                <Sliders size={48} className="text-primary/50" />
                <p className="mt-4 font-medium text-white">Sin evaluación ejecutada</p>
                <p className="mt-1 max-w-xs text-sm">
                  Presioná "Evaluar Conjunto de Reglas" para procesar las condiciones contra los hechos suministrados.
                </p>
              </div>
            )}

            {results && !isLoading && (
              <div className="mt-5 space-y-5">
                {/* Actions Triggered Summary */}
                <div className="rounded-xl border border-white/10 bg-background/80 p-4">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    <span className="text-sm font-semibold text-white">Acciones Disparadas</span>
                  </div>
                  {triggeredActions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {triggeredActions.map((action, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/40 bg-yellow-400/15 px-3 py-1 text-sm font-bold text-yellow-200"
                        >
                          <Zap size={14} /> {action}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">Ninguna regla activó acciones.</p>
                  )}
                </div>

                {/* Rules Details */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Detalle por Regla</h3>
                  <div className="mt-3 space-y-2">
                    {results.map((res) => (
                      <div
                        key={res.rule_id}
                        className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                          res.passed
                            ? 'border-green-500/30 bg-green-500/10 text-green-200'
                            : 'border-white/10 bg-background/50 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {res.passed ? (
                            <CheckCircle2 size={18} className="text-green-400" />
                          ) : (
                            <XCircle size={18} className="text-gray-500" />
                          )}
                          <span className="font-mono font-medium text-white">{res.rule_id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {res.passed && res.action && (
                            <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-xs text-yellow-300">
                              {res.action}
                            </span>
                          )}
                          <span className={`text-xs font-semibold ${res.passed ? 'text-green-400' : 'text-gray-500'}`}>
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

          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <HelpCircle size={16} className="shrink-0 text-primary" />
              <span>
                <strong>Lógica Desacoplada:</strong> Las reglas son evaluadas por orden de prioridad decreciente. Cada regla evalúa sus condiciones según la lógica especificada (AND u OR) contra los hechos sin persistencia intermedia.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
