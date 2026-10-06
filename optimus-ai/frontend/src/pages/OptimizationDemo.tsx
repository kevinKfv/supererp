import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const OptimizationDemo = () => {
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const costsMatrix = [
    [4, 1],
    [2, 3]
  ];

  const startOptimization = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/optimize/assignment', {
        costs: costsMatrix,
      });
      if (response.data && response.data.task_id) {
        setTaskId(response.data.task_id);
      } else {
        throw new Error('No se recibió un ID de tarea.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la optimización.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taskId && !result && !error) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/optimize/status/${taskId}`);
          const data = response.data;
          
          if (data.status === 'SUCCESS') {
            setResult(data.result);
            setShowResult(true);
            setIsLoading(false);
            clearInterval(interval);
          } else if (data.status === 'FAILURE') {
            setError(data.error || 'La optimización falló.');
            setIsLoading(false);
            clearInterval(interval);
          }
          // Si está en pending o queued, sigue esperando
        } catch (err: any) {
          setError('Error al consultar el estado de la tarea.');
          setIsLoading(false);
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId, result, error]);

  const handleAction = () => {
    if (showResult || error) {
      setShowResult(false);
      setError(null);
      setTaskId(null);
      setResult(null);
    } else {
      void startOptimization();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">Demo integrada</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Optimización</h1>
        <p className="mt-2 max-w-2xl text-gray-300">Resolvé un problema de asignación de tareas enviándolo al motor matemático en background.</p>
      </header>

      <p role="note" className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-blue-100">
        Esta pantalla envía los costos al Optimization Engine vía API Gateway y hace polling (Celery) para esperar el resultado.
      </p>

      <section aria-label="Ejemplo de optimización" className="glass-card p-5 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-100">
              <p>Ocurrió un error: {error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-300">
               <Loader2 size={36} aria-hidden="true" className="animate-spin text-primary" />
               <p>Resolviendo matriz en background (Polling task: {taskId})...</p>
            </div>
          ) : showResult && result ? (
            <div>
              <h2 className="text-xl font-semibold text-white">Resultado de la Optimización</h2>
              <p className="mt-2 text-sm text-gray-300">La asignación elegida minimiza el costo total basado en OR-Tools.</p>
              <ol className="mt-5 divide-y divide-white/10 rounded-xl border border-white/10 px-4">
                {result.assignments?.map((assignment: any, idx: number) => (
                  <li key={idx} className="flex flex-wrap justify-between gap-2 py-3 text-sm text-gray-200">
                    <span>Trabajador {assignment.worker + 1} → Tarea {assignment.task + 1}</span>
                    <span>Costo: {assignment.cost}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm text-gray-300">Costo total optimizado</p>
              <p className="mt-1 text-3xl font-bold text-white">{result.total_cost} <span className="text-base font-normal text-gray-300">unidades de costo</span></p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white">Matriz de costos a resolver</h2>
              <p className="mt-2 text-sm text-gray-300">Cada celda indica el costo de asignar un trabajador a una tarea.</p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[15rem] border-collapse text-left text-sm">
                  <thead className="bg-white/5 text-gray-200">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Trabajador</th>
                      <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Tarea 1</th>
                      <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Tarea 2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-gray-200">
                    <tr><th scope="row" className="px-3 py-3 font-medium sm:px-4">Trabajador 1</th><td className="px-3 py-3 sm:px-4">4</td><td className="px-3 py-3 sm:px-4">1</td></tr>
                    <tr><th scope="row" className="px-3 py-3 font-medium sm:px-4">Trabajador 2</th><td className="px-3 py-3 sm:px-4">2</td><td className="px-3 py-3 sm:px-4">3</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <button 
          type="button" 
          onClick={handleAction}
          disabled={isLoading} 
          className="mt-6 min-h-11 rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {showResult || error ? 'Volver a la matriz' : 'Iniciar Optimización'}
        </button>
      </section>
    </div>
  );
};
