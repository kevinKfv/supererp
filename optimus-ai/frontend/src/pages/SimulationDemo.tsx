import { useState } from 'react';
import axios from 'axios';
import { 
  Loader2, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  BarChart3, 
  HelpCircle, 
  Info,
  Layers,
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';

type SimulationResult = {
  iterations_run: number;
  mean_profitability: number;
  worst_case_p5: number;
  best_case_p95: number;
  probability_of_loss_percent: number;
};

const presets = [
  {
    name: 'Balanceado (Normal)',
    desc: 'Escenario estándar con volatilidad moderada',
    revenue: 100000,
    revStd: 15000,
    cost: 70000,
    costStd: 10000,
    iterations: 10000,
  },
  {
    name: 'Alta Volatilidad',
    desc: 'Mayor incertidumbre de mercado en precios e insumos',
    revenue: 120000,
    revStd: 35000,
    cost: 85000,
    costStd: 25000,
    iterations: 10000,
  },
  {
    name: 'Conservador',
    desc: 'Costos controlados y demanda predecible',
    revenue: 80000,
    revStd: 5000,
    cost: 50000,
    costStd: 4000,
    iterations: 10000,
  },
];

export const SimulationDemo = () => {
  const [expectedRevenue, setExpectedRevenue] = useState(100000);
  const [revenueStd, setRevenueStd] = useState(15000);
  const [expectedCost, setExpectedCost] = useState(70000);
  const [costStd, setCostStd] = useState(10000);
  const [iterations, setIterations] = useState(10000);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/simulate/montecarlo', {
        expected_revenue: Number(expectedRevenue),
        revenue_std: Number(revenueStd),
        expected_cost: Number(expectedCost),
        cost_std: Number(costStd),
        iterations: Number(iterations),
      });

      if (response.data?.simulation_results) {
        setResult(response.data.simulation_results);
      } else {
        setError('El servicio no devolvió resultados válidos.');
      }
    } catch {
      setError('No se pudo ejecutar la simulación de Monte Carlo. Verificá que el servicio esté activo.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setExpectedRevenue(preset.revenue);
    setRevenueStd(preset.revStd);
    setExpectedCost(preset.cost);
    setCostStd(preset.costStd);
    setIterations(preset.iterations);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge-purple">
            <Zap size={13} className="text-purple-400" /> Motor Cuantitativo
          </span>
          <span className="badge-glow">
            <Layers size={13} className="text-primary" /> NumPy Vectorized
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Simulación Monte Carlo</h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
          Evaluación probabilística de rentabilidad y riesgo corporativo calculando miles de escenarios aleatorios.
        </p>
      </header>

      {/* Apartado Explicativo del Módulo de Simulación */}
      <section aria-label="Información del módulo de simulación" className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/85 to-surfaceHighlight/50 p-6 sm:p-7 text-slate-200 backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-glow-primary">
            <Info size={22} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Este módulo ejecuta una <strong>Simulación de Monte Carlo estocástica vectorizada con NumPy</strong>. En los negocios reales, los ingresos y costos futuros nunca son cifras estáticas: están sujetos a incertidumbre, inflación, retrasos y volatilidad de la demanda.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>¿Para qué se usa?</strong> Genera entre 10.000 y 50.000 escenarios posibles en milisegundos para calcular no solo la rentabilidad esperada, sino también el <strong>peor escenario estadístico (Percentil 5 - VaR / Value at Risk)</strong> y la <strong>probabilidad exacta de entrar en pérdida financiera</strong> antes de aprobar una inversión o proyecto.
            </p>
          </div>
        </div>

        {/* Guía de Parámetros e Interpretación */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <BarChart3 size={18} />
            <span>Guía de Parámetros: ¿Qué significa cada valor a ingresar?</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">1. Ingresos Esperados ($)</span>
              <p className="text-slate-300">La facturación promedio que esperás que genere el proyecto o unidad de negocio.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">2. Volatilidad de Ingresos (±$)</span>
              <p className="text-slate-300">Desviación estándar de los ingresos. A mayor valor, mayor es la incertidumbre de mercado.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">3. Costos Esperados ($)</span>
              <p className="text-slate-300">El presupuesto o gasto operativo medio estimado para llevar a cabo la operación.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
              <span className="font-bold text-white block">4. Volatilidad de Costos (±$)</span>
              <p className="text-slate-300">Margen de imprevistos o sobrecostos posibles (ej: variación de insumos o tipo de cambio).</p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3.5 text-xs text-blue-200 flex items-center gap-2">
            <Gauge size={16} className="text-blue-400 shrink-0" />
            <span>
              <strong>Criterio de Decisión Financiera:</strong> Si la <em>Probabilidad de Pérdida</em> supera el 15% o el <em>Peor Escenario (P5)</em> es negativo, el proyecto se cataloga como de <strong>Alto Riesgo</strong> y exige reservas de contingencia.
            </span>
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escenarios preconfigurados</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group flex flex-col items-start rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition-all hover:border-primary/40 hover:bg-white/[0.04] hover:shadow-glow-primary active:scale-98"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">{preset.name}</span>
                <Sparkles size={14} className="text-slate-500 group-hover:text-primary transition-colors" />
              </div>
              <span className="mt-1.5 text-xs text-slate-400 leading-relaxed">{preset.desc}</span>
              <div className="mt-3 flex gap-2 font-mono text-[10px] text-slate-300">
                <span className="rounded bg-white/5 px-2 py-0.5 border border-white/10">Rev: ${preset.revenue / 1000}k</span>
                <span className="rounded bg-white/5 px-2 py-0.5 border border-white/10">Cost: ${preset.cost / 1000}k</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Configuration Form & Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Panel */}
        <section className="glass-card flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Parámetros del Escenario</h2>
                <p className="mt-0.5 text-xs text-slate-400">Ingresá los supuestos de negocio y niveles de incertidumbre.</p>
              </div>
              <span className="font-mono text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                Motor :8004
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Ingresos esperados ($)</label>
                  <span className="font-mono text-xs text-emerald-400 font-bold">${expectedRevenue.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={expectedRevenue}
                  onChange={(e) => setExpectedRevenue(Number(e.target.value))}
                  className="premium-input font-mono text-base font-semibold"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Volatilidad de ingresos (±$)
                  </label>
                  <span className="font-mono text-xs text-blue-400 font-bold">±${revenueStd.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={revenueStd}
                  onChange={(e) => setRevenueStd(Number(e.target.value))}
                  className="premium-input font-mono text-base font-semibold"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Costos esperados ($)</label>
                  <span className="font-mono text-xs text-amber-400 font-bold">${expectedCost.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={expectedCost}
                  onChange={(e) => setExpectedCost(Number(e.target.value))}
                  className="premium-input font-mono text-base font-semibold"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Volatilidad de costos (±$)
                  </label>
                  <span className="font-mono text-xs text-amber-300 font-bold">±${costStd.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={costStd}
                  onChange={(e) => setCostStd(Number(e.target.value))}
                  className="premium-input font-mono text-base font-semibold"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3.5 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Cantidad de escenarios simulados
                </label>
                <select
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="premium-select font-mono text-sm cursor-pointer"
                >
                  <option value={5000} className="bg-surface text-white">5.000 iteraciones</option>
                  <option value={10000} className="bg-surface text-white">10.000 iteraciones (Recomendado)</option>
                  <option value={25000} className="bg-surface text-white">25.000 iteraciones</option>
                  <option value={50000} className="bg-surface text-white">50.000 iteraciones</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={isLoading}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-primary to-blue-600 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:brightness-110 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin text-white" />
                <span>Ejecutando {iterations.toLocaleString()} iteraciones...</span>
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                <span>Ejecutar Simulación Monte Carlo</span>
              </>
            )}
          </button>
        </section>

        {/* Results Panel */}
        <section className="glass-card flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Análisis de Rentabilidad y Riesgo</h2>
                <p className="mt-0.5 text-xs text-slate-400">Resultados calculados por el motor matemático.</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Distribución Normal</span>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-red-200 animate-slide-up">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            {!result && !error && !isLoading && (
              <div className="my-16 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/25 text-primary">
                  <BarChart3 size={32} />
                </div>
                <p className="mt-4 font-bold text-white text-base">Sin simulación en curso</p>
                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  Configurá los supuestos o elegí un escenario preconfigurado para iniciar el cálculo.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="my-16 flex flex-col items-center justify-center gap-3 text-slate-300">
                <Loader2 size={44} className="animate-spin text-purple-400" />
                <p className="font-bold text-white text-base">Generando distribuciones normales...</p>
                <p className="text-xs text-slate-400">Calculando rentabilidad neta vectorizada con NumPy.</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="mt-5 space-y-4 animate-slide-up">
                {/* Mean Profit */}
                <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.04] to-black/40 p-5 backdrop-blur-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rentabilidad Media Esperada</span>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                    <p className={`text-4xl font-extrabold font-mono tracking-tight ${result.mean_profitability >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(result.mean_profitability)}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-blue-200">
                      <TrendingUp size={13} /> {result.iterations_run.toLocaleString()} simulaciones
                    </span>
                  </div>
                </div>

                {/* Risk Distribution Visual Range Bar */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="text-amber-400 font-semibold">P5 (Peor caso): {formatCurrency(result.worst_case_p5)}</span>
                    <span className="text-blue-400 font-semibold">P95 (Mejor caso): {formatCurrency(result.best_case_p95)}</span>
                  </div>
                  <div className="relative h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">Intervalo de confianza del 90% (entre P5 y P95)</p>
                </div>

                {/* Risk & Loss Probability */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <span className="text-xs font-medium text-slate-400 block">Probabilidad de Pérdida</span>
                    <p className="mt-1 text-3xl font-extrabold text-white font-mono">
                      {result.probability_of_loss_percent}%
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                      {result.probability_of_loss_percent < 5 ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck size={14} /> Riesgo Bajo
                        </span>
                      ) : result.probability_of_loss_percent < 15 ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle size={14} /> Riesgo Moderado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle size={14} /> Riesgo Elevado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <span className="text-xs font-medium text-slate-400 block">Peor Escenario (P5 - VaR)</span>
                    <p className="mt-1 text-2xl font-bold text-amber-300 font-mono">
                      {formatCurrency(result.worst_case_p5)}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">En 95% de casos se gana más de esto.</p>
                  </div>
                </div>

                {/* Optimistic P95 */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Mejor Escenario Optimista (Percentil 95)</span>
                      <p className="mt-1 text-2xl font-bold text-blue-300 font-mono">
                        {formatCurrency(result.best_case_p95)}
                      </p>
                    </div>
                    <span className="text-[11px] rounded bg-blue-500/10 border border-blue-500/20 px-2 py-1 text-blue-300 font-mono">
                      Tope 95%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs text-slate-400">
            <div className="flex items-start gap-2.5">
              <HelpCircle size={16} className="shrink-0 text-primary mt-0.5" />
              <span className="leading-relaxed">
                <strong>Nota Metodológica:</strong> La simulación asume distribuciones normales independientes para ingresos y costos. Los percentiles no garantizan resultados futuros, sino que definen intervalos de confianza estadísticos para la toma de decisiones.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
