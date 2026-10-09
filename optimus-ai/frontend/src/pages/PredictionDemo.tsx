import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const PredictionDemo = () => {
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
        features: [[100.0, 80.0, 25.0]],
      });
      const prediction = response.data?.predictions?.[0];
      if (typeof prediction !== 'number' || !Number.isFinite(prediction)) {
        setError('El servicio no devolvió una predicción válida. Intentá nuevamente.');
        return;
      }
      setPredictionResult(prediction);
      setShowResult(true);
    } catch {
      setError('No se pudo calcular la predicción en este momento. Intentá nuevamente más tarde.');
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
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">Demo integrada</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Predicción</h1>
        <p className="mt-2 max-w-2xl text-gray-300">Conocé las entradas y la presentación de un posible resultado de ventas a través del API Gateway.</p>
      </header>

      <p role="note" className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-blue-100">
        Esta pantalla se conecta al Prediction Engine mediante el API Gateway.
      </p>

      <section aria-label="Ejemplo de predicción" className="glass-card p-5 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">
              <p>{error}</p>
            </div>
          )}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-300">
               <Loader2 size={36} aria-hidden="true" className="animate-spin text-primary" />
               <p>Consultando al modelo de predicción...</p>
            </div>
          ) : showResult && predictionResult !== null ? (
            <div>
              <h2 className="text-xl font-semibold text-white">Resultado de la predicción</h2>
              <p className="mt-2 text-sm text-gray-300">Este valor fue calculado por el motor de Machine Learning.</p>
              <div className="mt-5 rounded-xl border border-white/10 bg-background p-5">
                <p className="text-sm font-medium text-gray-300">Ventas estimadas</p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {predictionResult.toFixed(2)}
                  <span className="text-base font-normal text-gray-300"> unidades de ventas</span>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white">Entradas de ejemplo</h2>
              <p className="mt-2 text-sm text-gray-300">El motor usa estas tres variables (precio, marketing, temperatura).</p>
              <dl className="mt-5 divide-y divide-white/10 rounded-xl border border-white/10 px-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-gray-300">Precio</dt><dd className="font-semibold text-white">100</dd></div>
                <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-gray-300">Inversión en marketing</dt><dd className="font-semibold text-white">80</dd></div>
                <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-gray-300">Temperatura</dt><dd className="font-semibold text-white">25</dd></div>
              </dl>
            </div>
          )}
        </div>

        <button 
          type="button" 
          onClick={handleAction} 
          disabled={isLoading}
          className="mt-6 min-h-11 rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {showResult ? 'Volver a las entradas' : error ? 'Reintentar predicción' : 'Calcular predicción'}
        </button>
      </section>
    </div>
  );
};
