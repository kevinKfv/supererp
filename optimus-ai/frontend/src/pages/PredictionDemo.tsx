import { useState } from 'react';

export const PredictionDemo = () => {
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-blue-200">Demo guiada</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Predicción</h1>
        <p className="mt-2 max-w-2xl text-gray-300">Conocé las entradas y la presentación de un posible resultado de ventas.</p>
      </header>

      <p role="note" className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-blue-100">
        Ejemplo de solo lectura. Esta pantalla no consulta un modelo ni envía datos al motor de predicción.
      </p>

      <section aria-label="Ejemplo de predicción" className="glass-card p-5 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          {showResult ? (
            <div>
              <h2 className="text-xl font-semibold text-white">Resultado de ejemplo</h2>
              <p className="mt-2 text-sm text-gray-300">Una vista ilustrativa de cómo podría presentarse una predicción.</p>
              <div className="mt-5 rounded-xl border border-white/10 bg-background p-5">
                <p className="text-sm font-medium text-gray-300">Ventas estimadas de ejemplo</p>
                <p className="mt-2 text-4xl font-bold text-white">308 <span className="text-base font-normal text-gray-300">unidades de ventas</span></p>
              </div>
              <p className="mt-4 text-sm text-gray-300">El valor 308 es ficticio. No fue calculado a partir de las entradas ni generado por un modelo entrenado.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white">Entradas de ejemplo</h2>
              <p className="mt-2 text-sm text-gray-300">El prototipo del motor usa estas tres variables. Sus unidades aún no están definidas para uso de negocio.</p>
              <dl className="mt-5 divide-y divide-white/10 rounded-xl border border-white/10 px-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-gray-300">Precio</dt><dd className="font-semibold text-white">100</dd></div>
                <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-gray-300">Inversión en marketing</dt><dd className="font-semibold text-white">80</dd></div>
                <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-gray-300">Temperatura</dt><dd className="font-semibold text-white">25</dd></div>
              </dl>
            </div>
          )}
        </div>

        <button type="button" onClick={() => setShowResult((current) => !current)} className="mt-6 min-h-11 rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800">
          {showResult ? 'Volver a las entradas' : 'Ver resultado de ejemplo'}
        </button>
      </section>
    </div>
  );
};
