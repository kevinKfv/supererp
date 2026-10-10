import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Box, TrendingUp, ArrowRight } from 'lucide-react';

const metrics = [
  { title: 'Predicciones totales', value: '1,2 M', change: '+12,5 %', icon: TrendingUp },
  { title: 'Optimizaciones activas', value: '34', change: '+5,2 %', icon: Activity },
  { title: 'Uso de recursos', value: '87 %', change: '−2,4 %', icon: Box },
  { title: 'Riesgos críticos', value: '2', change: '−50 %', icon: AlertTriangle },
];

const activity = [
  'Simulación de Monte Carlo completada.',
  'Modelo de ventas XGBoost reentrenado.',
  'Regla de asignación activada.',
];

export const Dashboard = () => (
  <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-white">Inicio</h1>
        <p className="mt-2 text-gray-300">Elegí una función para empezar.</p>
      </div>
      <Link to="/chat" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800">
        Interpretar instrucción <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </header>

    <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-blue-100" role="note">
      <strong>Datos de demostración.</strong> Los indicadores y la actividad no representan ejecuciones reales.
    </div>

    <section aria-labelledby="metrics-title" className="space-y-4">
      <h2 id="metrics-title" className="text-xl font-semibold text-white">Indicadores</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, change, icon: Icon }) => (
          <div key={title} className="glass-card min-w-0 p-5">
            <div className="flex min-h-10 items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-300">{title}</h3>
              <Icon size={20} aria-hidden="true" className="shrink-0 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
            <p className="mt-2 text-sm text-gray-400">Variación: {change}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-labelledby="activity-title" className="glass-card p-5 sm:p-6">
        <h2 id="activity-title" className="text-xl font-semibold text-white">Actividad</h2>
        <ul className="mt-5 divide-y divide-white/10">
          {activity.map((item) => (
            <li key={item} className="flex gap-3 py-3 text-sm text-gray-200">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="modules-title" className="glass-card p-5 sm:p-6">
        <h2 id="modules-title" className="text-xl font-semibold text-white">Funciones disponibles</h2>
        <p className="mt-1 text-sm text-gray-300">Optimización calcula una solución; Predicción usa un caso de ejemplo.</p>
        <div className="mt-5 space-y-3">
          <Link to="/optimization" className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5">
            Optimización <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/prediction" className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5">
            Predicción <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  </div>
);
