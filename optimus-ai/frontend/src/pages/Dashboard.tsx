import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Box, TrendingUp, Sliders, Database, ArrowRight, Bot, ShieldCheck, Info, Compass } from 'lucide-react';

const metrics = [
  { title: 'Predicciones de Ventas', value: '1,2 M', change: '+12,5 %', icon: TrendingUp },
  { title: 'Optimizaciones OR-Tools', value: '34', change: '+5,2 %', icon: Activity },
  { title: 'Escenarios Simulados', value: '50.000', change: '+18,0 %', icon: Box },
  { title: 'Reglas Activas', value: '12', change: '100% OK', icon: AlertTriangle },
];

const modules = [
  {
    title: 'Optimización de Asignaciones',
    desc: 'Problema de asignación matemática mediante Google OR-Tools (MIP SCIP) y Celery.',
    to: '/optimization',
    icon: Activity,
    badge: 'MIP / SCIP',
  },
  {
    title: 'Predicción de Ventas',
    desc: 'Inferencia de Machine Learning con XGBoost y artefactos en MinIO.',
    to: '/prediction',
    icon: Database,
    badge: 'XGBoost',
  },
  {
    title: 'Simulación Monte Carlo',
    desc: 'Análisis de rentabilidad y riesgo corporativo con distribuciones normales vectorizadas.',
    to: '/simulation',
    icon: TrendingUp,
    badge: 'NumPy',
  },
  {
    title: 'Motor de Reglas de Negocio',
    desc: 'Evaluación dinámica JSON AST con operadores lógicos y acciones prioritarias.',
    to: '/rules',
    icon: Sliders,
    badge: 'JSON AST',
  },
];

export const Dashboard = () => (
  <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-white">Centro de Control</h1>
        <p className="mt-2 text-gray-300">
          SuperERP / OptimusAI — Motores de Decisión, Optimización e Inteligencia de Negocios.
        </p>
      </div>
      <Link
        to="/chat"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800"
      >
        <Bot size={18} aria-hidden="true" />
        Interpretar con IA <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </header>

    <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-blue-100 flex items-center justify-between" role="note">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-primary shrink-0" />
        <span><strong>Entorno Operativo:</strong> Microservicios conectados mediante API Gateway en el puerto 8000.</span>
      </div>
      <span className="text-xs text-blue-300 font-mono hidden sm:inline">v1.0.0-enterprise</span>
    </div>

    {/* Apartado Explicativo General del Sistema */}
    <section aria-label="Introducción a la plataforma" className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-gray-200">
      <div className="flex items-start gap-3">
        <Info size={22} className="text-primary mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">¿Qué es SuperERP / OptimusAI y para qué se usa?</h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Es una suite empresarial de <strong>Inteligencia Operativa y Optimización Matemática</strong>. En lugar de tomar decisiones corporativas basadas en corazonadas o en hojas de cálculo manuales, el sistema integra <strong>4 motores cuantitativos y un asistente cognitivo</strong> que trabajan de forma coordinada:
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs leading-relaxed">
        <div className="rounded-xl border border-white/10 bg-surface/90 p-3.5 space-y-1">
          <span className="font-semibold text-emerald-300 block">1. Predicción (XGBoost)</span>
          <p className="text-gray-300">Anticipa la <strong>demanda y ventas</strong> evaluando precio, presupuesto publicitario y factores de estacionalidad.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/90 p-3.5 space-y-1">
          <span className="font-semibold text-emerald-300 block">2. Simulación (Monte Carlo)</span>
          <p className="text-gray-300">Genera miles de escenarios para evaluar la <strong>probabilidad de pérdida y el peor caso</strong> antes de invertir.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/90 p-3.5 space-y-1">
          <span className="font-semibold text-emerald-300 block">3. Optimización (OR-Tools)</span>
          <p className="text-gray-300">Resuelve la <strong>asignación de recursos y tareas al menor costo</strong> mediante programación matemática entera.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/90 p-3.5 space-y-1">
          <span className="font-semibold text-emerald-300 block">4. Reglas & NLP (AST + XAI)</span>
          <p className="text-gray-300">Aplica <strong>políticas de negocio en caliente</strong> y permite consultar el sistema mediante lenguaje natural.</p>
        </div>
      </div>
    </section>

    {/* Metrics Overview */}
    <section aria-labelledby="metrics-title" className="space-y-4">
      <h2 id="metrics-title" className="text-xl font-semibold text-white">Indicadores de Desempeño</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, change, icon: Icon }) => (
          <div key={title} className="glass-card min-w-0 p-5">
            <div className="flex min-h-10 items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-300">{title}</h3>
              <Icon size={20} aria-hidden="true" className="shrink-0 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
            <p className="mt-2 text-sm text-gray-400">Variación: <span className="text-green-400">{change}</span></p>
          </div>
        ))}
      </div>
    </section>

    {/* Engines Grid */}
    <section aria-labelledby="modules-title" className="space-y-4">
      <h2 id="modules-title" className="text-xl font-semibold text-white">Motores de Decisión Disponibles</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map(({ title, desc, to, icon: Icon, badge }) => (
          <Link
            key={title}
            to={to}
            className="glass-card p-5 transition-all hover:border-primary/50 hover:bg-white/5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/20 p-2 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">{title}</h3>
                </div>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono font-medium text-gray-300">
                  {badge}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">{desc}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
              Abrir módulo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  </div>
);
