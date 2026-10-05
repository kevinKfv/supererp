import { useState } from 'react';

export const OptimizationDemo = () => {
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">Demo guiada</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Optimización</h1>
        <p className="mt-2 max-w-2xl text-gray-300">Explorá cómo se presenta una asignación de tareas según sus costos.</p>
      </header>

      <p role="note" className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-blue-100">
        Ejemplo de solo lectura. Esta pantalla no envía datos al motor de optimización ni inicia una tarea real.
      </p>

      <section aria-label="Ejemplo de optimización" className="glass-card p-5 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          {showResult ? (
            <div>
              <h2 className="text-xl font-semibold text-white">Resultado de ejemplo</h2>
              <p className="mt-2 text-sm text-gray-300">La asignación ilustrativa toma el menor costo total de esta matriz fija.</p>
              <ol className="mt-5 divide-y divide-white/10 rounded-xl border border-white/10 px-4">
                <li className="flex flex-wrap justify-between gap-2 py-3 text-sm text-gray-200">
                  <span>Trabajador 1 → Tarea 2</span><span>Costo: 1</span>
                </li>
                <li className="flex flex-wrap justify-between gap-2 py-3 text-sm text-gray-200">
                  <span>Trabajador 2 → Tarea 1</span><span>Costo: 2</span>
                </li>
              </ol>
              <p className="mt-5 text-sm text-gray-300">Costo total del ejemplo</p>
              <p className="mt-1 text-3xl font-bold text-white">3 <span className="text-base font-normal text-gray-300">unidades de costo</span></p>
              <p className="mt-3 text-sm text-gray-400">Este resultado está predefinido; no proviene de una ejecución del motor.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white">Matriz de costos de ejemplo</h2>
              <p className="mt-2 text-sm text-gray-300">Cada celda indica el costo de asignar un trabajador a una tarea, en unidades de ejemplo.</p>
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

        <button type="button" onClick={() => setShowResult((current) => !current)} className="mt-6 min-h-11 rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800">
          {showResult ? 'Volver al ejemplo' : 'Ver resultado de ejemplo'}
        </button>
      </section>
    </div>
  );
};
