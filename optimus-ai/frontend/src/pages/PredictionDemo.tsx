import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { 
  Loader2, 
  Info, 
  Sparkles, 
  BarChart2, 
  DollarSign, 
  Megaphone, 
  Thermometer, 
  CheckCircle2,
  Zap
} from 'lucide-react';

const presets = [
  { name: 'Campaña Balanceada', price: 100, marketing: 150, temp: 24, desc: 'Precio promedio con inversión publicitaria estándar.' },
  { name: 'Alta Inversión de Lanzamiento', price: 80, marketing: 450, temp: 26, desc: 'Precio promocional y fuerte pauta en marketing.' },
  { name: 'Producto Premium', price: 180, marketing: 50, temp: 15, desc: 'Precio elevado con baja inversión en temporada fría.' },
];

export const PredictionDemo = () => {
  const [price, setPrice] = useState(100);
  const [marketing, setMarketing] = useState(150);
  const [temp, setTemp] = useState(24);

  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);
    try {
      const response = await axios.post(API_ENDPOINTS.prediction.predict, {
        features: [[Number(price), Number(marketing), Number(temp)]],
      });
      const prediction = response.data?.predictions?.[0];
      if (typeof prediction !== 'number' || !Number.isFinite(prediction)) {
        setError('El servicio no devolvió una predicción válida. Intentá nuevamente.');
        return;
      }
      setPredictionResult(prediction);
      setShowResult(true);
    } catch {
      setError('No se pudo calcular la predicción en este momento. Verificá que el modelo esté entrenado en MinIO.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = () => {
    if (showResult) {
      setShowResult(false);
      setError(null);
      setPredictionResult(null);
    } else {
      void fetchPrediction();
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge-glow">
            <Zap size={13} className="text-primary" /> Machine Learning
          </span>
          <span className="badge-success">
            <CheckCircle2 size={13} className="text-emerald-400" /> MinIO Conectado
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Predicción de Demanda y Ventas</h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
          Estimación proyectada de ventas mediante árboles de decisión potenciados por gradiente (XGBoost).
        </p>
      </header>

      {/* Apartado Explicativo del Módulo */}
      <section aria-label="Información del módulo de predicción" className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/85 to-surfaceHighlight/50 p-6 sm:p-7 text-slate-200 backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-glow-primary">
            <Info size={22} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Este módulo utiliza un modelo de Machine Learning supervisado <strong>XGBoost Regressor</strong> entrenado con datos históricos y almacenado como artefacto en el Object Storage <strong>MinIO</strong>.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>¿Para qué se usa?</strong> Permite a directores comerciales y gerentes de operaciones <strong>anticipar la demanda antes de que suceda</strong>. Al ingresar variables del plan comercial (precio y publicidad) y del entorno (temperatura/estacionalidad), el modelo calcula cuántas unidades se venderán, evitando roturas de stock y optimizando el retorno de inversión publicitaria.
            </p>
          </div>
        </div>

        {/* Guía de Variables */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <BarChart2 size={18} />
            <span>Guía de variables: ¿Qué representa cada campo?</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-xs leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" /> 1. Precio del Producto ($)
              </span>
              <p className="text-slate-300">Valor de venta al público. De acuerdo a la elasticidad de la demanda, precios más altos suelen reducir el volumen de ventas.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Megaphone size={14} className="text-blue-400" /> 2. Inversión en Marketing ($)
              </span>
              <p className="text-slate-300">Presupuesto en publicidad digital y promociones. A mayor pauta, se incrementa el alcance y la tasa de conversión.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Thermometer size={14} className="text-amber-400" /> 3. Temperatura (°C / Clima)
              </span>
              <p className="text-slate-300">Factor de estacionalidad externa que influye en el comportamiento del consumidor (días templados favorecen el consumo).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario y Pruebas */}
      <section aria-label="Ejemplo de predicción" className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Parámetros del Escenario de Ventas</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">Modificá los valores o seleccioná un escenario predefinido para evaluar la respuesta del modelo.</p>
          </div>
          <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-lg">
            Inferencia :8003
          </span>
        </div>

        {/* Presets Rápidos */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Escenarios Rápidos:</span>
          <div className="flex flex-wrap gap-2.5">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setPrice(p.price);
                  setMarketing(p.marketing);
                  setTemp(p.temp);
                  setShowResult(false);
                }}
                className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-primary/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <Sparkles size={13} className="text-primary group-hover:scale-110 transition-transform" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pred-price" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" /> Precio ($)
              </label>
              <span className="font-mono text-xs text-emerald-400 font-bold">${price}</span>
            </div>
            <input
              id="pred-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              disabled={isLoading}
              className="premium-input font-mono text-lg font-bold"
            />
            <span className="block text-[11px] text-slate-400">Rango típico: 50 a 200</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pred-marketing" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Megaphone size={14} className="text-blue-400" /> Inversión en Marketing ($)
              </label>
              <span className="font-mono text-xs text-blue-400 font-bold">${marketing}</span>
            </div>
            <input
              id="pred-marketing"
              type="number"
              value={marketing}
              onChange={(e) => setMarketing(Number(e.target.value))}
              disabled={isLoading}
              className="premium-input font-mono text-lg font-bold"
            />
            <span className="block text-[11px] text-slate-400">Pauta publicitaria mensual</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pred-temp" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Thermometer size={14} className="text-amber-400" /> Temperatura (°C)
              </label>
              <span className="font-mono text-xs text-amber-400 font-bold">{temp}°C</span>
            </div>
            <input
              id="pred-temp"
              type="number"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              disabled={isLoading}
              className="premium-input font-mono text-lg font-bold"
            />
            <span className="block text-[11px] text-slate-400">Clima o índice estacional</span>
          </div>
        </div>

        {/* Dynamic Results & Status */}
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-red-200 animate-slide-up">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-300 rounded-2xl border border-white/10 bg-white/[0.02]">
              <Loader2 size={36} aria-hidden="true" className="animate-spin text-primary" />
              <p className="font-medium text-sm">Consultando modelo XGBoost en el backend...</p>
              <span className="text-xs text-slate-400 font-mono">Inferencia ML en /api/v1/predict/predict</span>
            </div>
          ) : showResult && predictionResult !== null ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-slate-900/90 to-surfaceHighlight p-6 space-y-4 shadow-glow-emerald animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles size={18} />
                  <span>Predicción calculada con éxito</span>
                </div>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40">
                  XGBoost Inferred
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Demanda Estimada:</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-white font-mono mt-1">
                    {predictionResult.toFixed(1)}
                    <span className="text-base font-normal text-slate-300 ml-2">unidades de ventas estimadas</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-right">
                  <span className="text-[11px] text-slate-400 block">Facturación Proyectada</span>
                  <span className="font-mono text-xl font-bold text-emerald-400">
                    ${(predictionResult * price).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Escenario evaluado: Precio <strong className="text-white">${price}</strong>, Marketing <strong className="text-white">${marketing}</strong> y Temperatura de <strong className="text-white">{temp}°C</strong>.
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAction}
          disabled={isLoading}
          className={`w-full sm:w-auto min-h-12 rounded-xl px-6 py-3 font-semibold text-white transition-all shadow-lg active:scale-98 disabled:opacity-50 ${
            showResult 
              ? 'btn-action-secondary' 
              : 'btn-action-primary'
          }`}
        >
          {showResult ? 'Modificar parámetros' : error ? 'Reintentar predicción' : 'Calcular predicción con XGBoost'}
        </button>
      </section>
    </div>
  );
};
