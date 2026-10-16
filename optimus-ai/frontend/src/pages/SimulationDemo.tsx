import { useState } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw, BarChart3, HelpCircle, Info } from 'lucide-react';

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
    <div className="max-w-5xl space-y-6">
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">
          Motor Cuantitativo
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Simulación Monte Carlo</h1>
        <p className="mt-2 max-w-2xl text-gray-300">
          Evaluación probabilística de rentabilidad y riesgo corporativo calculando miles de escenarios aleatorios.
        </p>
      </header>

      {/* Apartado Explicativo del Módulo de Simulación */}
      <section aria-label="Información del módulo de simulación" className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-gray-200">
        <div className="flex items-start gap-3">
          <Info size={22} className="text-primary mt-0.5 shrink-0" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Este módulo ejecuta una <strong>Simulación de Monte Carlo estocástica vectorizada con NumPy</strong>. En los negocios reales, los ingresos y costos futuros nunca son cifras estáticas: están sujetos a incertidumbre, inflación, retrasos y volatilidad de la demanda.
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              <strong>¿Para qué se usa?</strong> Genera entre 10.000 y 50.000 escenarios posibles en milisegundos para calcular no solo la rentabilidad esperada, sino también el <strong>peor escenario estadístico (Percentil 5 - VaR / Value at Risk)</strong> y la <strong>probabilidad exacta de entrar en pérdida financiera</strong> antes de aprobar una inversión o proyecto.
            </p>
          </div>
        </div>

        {/* Guía de Parámetros e Interpretación */}
        <div className="mt-5 rounded-xl border border-white/10 bg-surface/90 p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-emerald-300">
            <BarChart3 size={18} />
            <span>Guía de Parámetros: ¿Qué significa cada valor a ingresar?</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs leading-relaxed">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">1. Ingresos Esperados ($)</span>
              <p className="text-gray-300">La facturación promedio que esperás que genere el proyecto o unidad de negocio.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">2. Volatilidad de Ingresos (±$)</span>
              <p className="text-gray-300">Desviación estándar de los ingresos. A mayor valor, mayor es la incertidumbre de mercado.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">3. Costos Esperados ($)</span>
              <p className="text-gray-300">El presupuesto o gasto operativo medio estimado para llevar a cabo la operación.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">4. Volatilidad de Costos (±$)</span>
              <p className="text-gray-300">Margen de imprevistos o sobrecostos posibles (ej: variación de insumos o tipo de cambio).</p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-400/20 bg-blue-400/10 p-2.5 text-xs text-blue-200">
            📊 <strong>Cómo interpretar el resultado:</strong> Si la <em>Probabilidad de Pérdida</em> supera el 15% o el <em>Peor Escenario (P5)</em> es negativo, el proyecto se considera de <strong>Alto Riesgo</strong> y requiere mitigación previa.
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="glass-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Escenarios preconfigurados</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-start rounded-lg border border-white/10 bg-background/50 p-3.5 text-left transition-colors hover:border-primary/50 hover:bg-white/5"
            >
              <span className="font-semibold text-white">{preset.name}</span>
              <span className="mt-1 text-xs text-gray-400">{preset.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Configuration Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card flex flex-col justify-between p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Parámetros del Escenario</h2>
            <p className="mt-1 text-sm text-gray-400">Ingresá los supuestos de negocio y niveles de incertidumbre.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200">Ingresos esperados ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={expectedRevenue}
                  onChange={(e) => setExpectedRevenue(Number(e.target.value))}
                  className="premium-input mt-1.5 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Volatilidad / Desviación estándar de ingresos ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={revenueStd}
                  onChange={(e) => setRevenueStd(Number(e.target.value))}
                  className="premium-input mt-1.5 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Costos esperados ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={expectedCost}
                  onChange={(e) => setExpectedCost(Number(e.target.value))}
                  className="premium-input mt-1.5 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Volatilidad / Desviación estándar de costos ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={costStd}
                  onChange={(e) => setCostStd(Number(e.target.value))}
                  className="premium-input mt-1.5 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Cantidad de escenarios simulados</label>
                <select
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="premium-input mt-1.5 w-full cursor-pointer"
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
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primaryDark font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin text-white" />
                Ejecutando {iterations.toLocaleString()} iteraciones...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Ejecutar Simulación Monte Carlo
              </>
            )}
          </button>
        </section>

        {/* Results Panel */}
        <section className="glass-card flex flex-col justify-between p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Análisis de Rentabilidad y Riesgo</h2>
            <p className="mt-1 text-sm text-gray-400">Resultados calculados por el motor matemático.</p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">
                <p>{error}</p>
              </div>
            )}

            {!result && !error && !isLoading && (
              <div className="mt-12 flex flex-col items-center justify-center text-center text-gray-400">
                <BarChart3 size={48} className="text-primary/50" />
                <p className="mt-4 font-medium text-white">Sin simulación en curso</p>
                <p className="mt-1 max-w-xs text-sm">
                  Configurá los supuestos o elegí un escenario preconfigurado para iniciar el cálculo.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="mt-16 flex flex-col items-center justify-center gap-3 text-gray-300">
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="font-medium text-white">Generando distribuciones normales...</p>
                <p className="text-xs text-gray-400">Calculando rentabilidad neta vectorizada con NumPy.</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="mt-5 space-y-4">
                {/* Mean Profit */}
                <div className="rounded-xl border border-white/10 bg-background/80 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rentabilidad Media Esperada</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <p className={`text-3xl font-extrabold ${result.mean_profitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(result.mean_profitability)}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                      <TrendingUp size={12} /> {result.iterations_run.toLocaleString()} iteraciones
                    </span>
                  </div>
                </div>

                {/* Risk & Loss Probability */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-background/60 p-4">
                    <span className="text-xs font-medium text-gray-400">Probabilidad de Pérdida</span>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {result.probability_of_loss_percent}%
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      {result.probability_of_loss_percent < 5 ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <ShieldCheck size={14} /> Riesgo Bajo
                        </span>
                      ) : result.probability_of_loss_percent < 15 ? (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <AlertTriangle size={14} /> Riesgo Moderado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle size={14} /> Riesgo Elevado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-background/60 p-4">
                    <span className="text-xs font-medium text-gray-400">Peor Escenario (P5 - VaR 95%)</span>
                    <p className="mt-1 text-2xl font-bold text-amber-300">
                      {formatCurrency(result.worst_case_p5)}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">En el 95% de los casos se gana más de esto.</p>
                  </div>
                </div>

                {/* Optimistic P95 */}
                <div className="rounded-xl border border-white/10 bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-gray-400">Mejor Escenario Optimista (Percentil 95)</span>
                      <p className="mt-1 text-xl font-bold text-blue-300">
                        {formatCurrency(result.best_case_p95)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">Potencial máximo razonable</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <HelpCircle size={16} className="shrink-0 text-primary" />
              <span>
                <strong>Nota Metodológica:</strong> La simulación asume distribuciones normales independientes para ingresos y costos. Los percentiles no garantizan resultados futuros, sino que definen intervalos de confianza estadísticos para la toma de decisiones.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
