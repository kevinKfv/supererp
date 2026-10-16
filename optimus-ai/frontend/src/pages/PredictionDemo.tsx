import { useState } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, Info, HelpCircle, Sparkles, BarChart2 } from 'lucide-react';

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
      const response = await axios.post('http://localhost:8000/api/v1/predict/predict', {
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
    <div className="max-w-4xl space-y-6">
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">
          Machine Learning
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Predicción de Demanda y Ventas</h1>
        <p className="mt-2 max-w-2xl text-gray-300">
          Estimación proyectada de ventas mediante árboles de decisión potenciados por gradiente (XGBoost).
        </p>
      </header>

      {/* Apartado Explicativo del Módulo */}
      <section aria-label="Información del módulo de predicción" className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-gray-200">
        <div className="flex items-start gap-3">
          <Info size={22} className="text-primary mt-0.5 shrink-0" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">¿Qué es este módulo y para qué se usa?</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Este módulo utiliza un modelo de Machine Learning supervisado <strong>XGBoost Regressor</strong> entrenado con datos históricos y almacenado como artefacto en el Object Storage <strong>MinIO</strong>.
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              <strong>¿Para qué se usa?</strong> Permite a directores comerciales y gerentes de operaciones <strong>anticipar la demanda antes de que suceda</strong>. Al ingresar variables del plan comercial (precio y publicidad) y del entorno (temperatura/estacionalidad), el modelo calcula cuántas unidades se venderán, evitando roturas de stock y optimizando el retorno de inversión publicitaria.
            </p>
          </div>
        </div>

        {/* Guía de Variables */}
        <div className="mt-5 rounded-xl border border-white/10 bg-surface/90 p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-emerald-300">
            <BarChart2 size={18} />
            <span>Guía de variables: ¿Qué representa cada campo?</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-xs leading-relaxed">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">1. Precio del Producto ($)</span>
              <p className="text-gray-300">Valor de venta al público. De acuerdo a la elasticidad de la demanda, precios más altos suelen reducir el volumen de ventas.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">2. Inversión en Marketing ($)</span>
              <p className="text-gray-300">Presupuesto en publicidad digital y promociones. A mayor pauta, se incrementa el alcance y la tasa de conversión.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1">
              <span className="font-semibold text-white block">3. Temperatura (°C / Clima)</span>
              <p className="text-gray-300">Factor de estacionalidad externa que influye en el comportamiento del consumidor (días templados favorecen el consumo).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario y Pruebas */}
      <section aria-label="Ejemplo de predicción" className="glass-card p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Parámetros del Escenario de Ventas</h2>
          <p className="mt-1 text-sm text-gray-300">Modificá los valores o seleccioná un escenario predefinido para evaluar la respuesta del modelo.</p>
        </div>

        {/* Presets Rápidos */}
        <div className="flex flex-wrap gap-2">
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
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors"
            >
              ⚡ {p.name}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="pred-price" className="block text-sm font-medium text-gray-200">
              Precio ($)
            </label>
            <input
              id="pred-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              disabled={isLoading}
              className="premium-input w-full min-h-11"
            />
            <span className="text-xs text-gray-400">Rango típico: 50 a 200</span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pred-marketing" className="block text-sm font-medium text-gray-200">
              Inversión en Marketing ($)
            </label>
            <input
              id="pred-marketing"
              type="number"
              value={marketing}
              onChange={(e) => setMarketing(Number(e.target.value))}
              disabled={isLoading}
              className="premium-input w-full min-h-11"
            />
            <span className="text-xs text-gray-400">Pauta publicitaria mensual</span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pred-temp" className="block text-sm font-medium text-gray-200">
              Temperatura (°C)
            </label>
            <input
              id="pred-temp"
              type="number"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              disabled={isLoading}
              className="premium-input w-full min-h-11"
            />
            <span className="text-xs text-gray-400">Clima o índice estacional</span>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-300">
              <Loader2 size={36} aria-hidden="true" className="animate-spin text-primary" />
              <p>Consultando modelo XGBoost en el backend...</p>
            </div>
          ) : showResult && predictionResult !== null ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Sparkles size={18} />
                <span>Predicción calculada con éxito</span>
              </div>
              <p className="text-sm text-gray-300">Para un precio de ${price}, marketing de ${marketing} y {temp}°C:</p>
              <p className="text-4xl font-extrabold text-white">
                {predictionResult.toFixed(1)}
                <span className="text-base font-normal text-gray-300"> unidades de ventas estimadas</span>
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAction}
          disabled={isLoading}
          className={`min-h-11 rounded-lg px-5 py-2.5 font-semibold text-white transition-colors disabled:opacity-50 ${
            showResult ? 'border border-white/20 hover:bg-white/5' : 'bg-primaryDark hover:bg-blue-800'
          }`}
        >
          {showResult ? 'Modificar parámetros' : error ? 'Reintentar predicción' : 'Calcular predicción con XGBoost'}
        </button>
      </section>
    </div>
  );
};
