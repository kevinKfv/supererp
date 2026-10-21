import { Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  Box, 
  TrendingUp, 
  Sliders, 
  Database, 
  ArrowRight, 
  Bot, 
  ShieldCheck, 
  Info, 
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

const metrics = [
  { 
    title: 'Predicciones de Ventas', 
    value: '1,2 M', 
    change: '+12,5 %', 
    icon: TrendingUp,
    badge: 'XGBoost v2',
    accent: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30'
  },
  { 
    title: 'Optimizaciones OR-Tools', 
    value: '34', 
    change: '+5,2 %', 
    icon: Activity,
    badge: 'MIP / SCIP',
    accent: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30'
  },
  { 
    title: 'Escenarios Simulados', 
    value: '50.000', 
    change: '+18,0 %', 
    icon: Box,
    badge: 'Monte Carlo',
    accent: 'from-purple-500/20 to-indigo-500/10',
    border: 'border-purple-500/30'
  },
  { 
    title: 'Reglas Activas', 
    value: '12', 
    change: '100% OK', 
    icon: AlertTriangle,
    badge: 'JSON AST',
    accent: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30'
  },
];

const modules = [
  {
    title: 'Optimización de Asignaciones',
    desc: 'Problema de asignación matemática mediante Google OR-Tools (MIP SCIP) y Celery.',
    to: '/optimization',
    icon: Activity,
    badge: 'MIP / SCIP',
    tech: 'Google OR-Tools • Celery • Redis',
    color: 'text-emerald-400',
    glow: 'group-hover:border-emerald-500/40 group-hover:shadow-glow-emerald',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30'
  },
  {
    title: 'Predicción de Ventas',
    desc: 'Inferencia de Machine Learning con XGBoost y artefactos en MinIO.',
    to: '/prediction',
    icon: Database,
    badge: 'XGBoost',
    tech: 'Scikit-Learn • MinIO • Inferencia',
    color: 'text-blue-400',
    glow: 'group-hover:border-blue-500/40 group-hover:shadow-glow-primary',
    iconBg: 'bg-blue-500/15 border-blue-500/30'
  },
  {
    title: 'Simulación Monte Carlo',
    desc: 'Análisis de rentabilidad y riesgo corporativo con distribuciones normales vectorizadas.',
    to: '/simulation',
    icon: TrendingUp,
    badge: 'NumPy',
    tech: 'NumPy Vectorized • Percentiles P5/P95',
    color: 'text-purple-400',
    glow: 'group-hover:border-purple-500/40 group-hover:shadow-glow-accent',
    iconBg: 'bg-purple-500/15 border-purple-500/30'
  },
  {
    title: 'Motor de Reglas de Negocio',
    desc: 'Evaluación dinámica JSON AST con operadores lógicos y acciones prioritarias.',
    to: '/rules',
    icon: Sliders,
    badge: 'JSON AST',
    tech: 'Dynamic AST Parser • In-Memory Rules',
    color: 'text-amber-400',
    glow: 'group-hover:border-amber-500/40 group-hover:shadow-glow-emerald',
    iconBg: 'bg-amber-500/15 border-amber-500/30'
  },
];

const microservices = [
  { name: 'Gateway', port: '8000', status: 'Activo' },
  { name: 'Identity', port: '8001', status: 'Activo' },
  { name: 'Optimization', port: '8002', status: 'Activo' },
  { name: 'Prediction', port: '8003', status: 'Activo' },
  { name: 'Simulation', port: '8004', status: 'Activo' },
  { name: 'Rules', port: '8005', status: 'Activo' },
  { name: 'Knowledge', port: '8006', status: 'Activo' },
];

export const Dashboard = () => (
  <div className="space-y-8 pb-10">
    {/* Hero Header */}
    <header className="relative flex flex-wrap items-start justify-between gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-slate-900/90 to-surfaceHighlight/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />

      <div className="relative max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-blue-300">
            <Cpu size={13} className="text-primary" /> SuperERP Ecosystem
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Producción
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Centro de Control</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
          SuperERP / OptimusAI — Motores de Decisión, Optimización e Inteligencia de Negocios.
        </p>
      </div>

      <div className="relative flex flex-wrap items-center gap-3">
        <Link
          to="/chat"
          className="btn-action-primary shadow-glow-primary group"
        >
          <Bot size={18} aria-hidden="true" className="group-hover:rotate-12 transition-transform" />
          <span>Interpretar con IA</span>
          <ArrowRight size={17} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </header>

    {/* Operational status bar */}
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl px-5 py-3.5 text-sm text-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-lg" role="note">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
          <ShieldCheck size={18} className="shrink-0" />
        </div>
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-white">Entorno Operativo:</span> Microservicios conectados mediante API Gateway en el puerto 8000.
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span>7/7 SERVICIOS ACTIVOS</span>
        <span className="text-slate-600">•</span>
        <span className="text-blue-400 font-semibold">v1.0.0-enterprise</span>
      </div>
    </div>

    {/* Apartado Explicativo General del Sistema */}
    <section aria-label="Introducción a la plataforma" className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/80 to-surfaceHighlight/50 p-6 text-slate-200 backdrop-blur-xl shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary shadow-glow-primary">
          <Info size={22} className="shrink-0" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">¿Qué es SuperERP / OptimusAI y para qué se usa?</h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Es una suite empresarial de <strong>Inteligencia Operativa y Optimización Matemática</strong>. En lugar de tomar decisiones corporativas basadas en corazonadas o en hojas de cálculo manuales, el sistema integra <strong>4 motores cuantitativos y un asistente cognitivo</strong> que trabajan de forma coordinada:
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs leading-relaxed">
        <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 transition-all hover:bg-white/[0.06] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 text-sm">1. Predicción</span>
            <span className="text-[10px] font-mono rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 border border-emerald-500/30">XGBoost</span>
          </div>
          <p className="text-slate-300">Anticipa la <strong>demanda y ventas</strong> evaluando precio, presupuesto publicitario y factores de estacionalidad.</p>
        </div>

        <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 transition-all hover:bg-white/[0.06] hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 text-sm">2. Simulación</span>
            <span className="text-[10px] font-mono rounded bg-purple-500/20 px-2 py-0.5 text-purple-300 border border-purple-500/30">Monte Carlo</span>
          </div>
          <p className="text-slate-300">Genera miles de escenarios para evaluar la <strong>probabilidad de pérdida y el peor caso</strong> antes de invertir.</p>
        </div>

        <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 transition-all hover:bg-white/[0.06] hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-300 text-sm">3. Optimización</span>
            <span className="text-[10px] font-mono rounded bg-blue-500/20 px-2 py-0.5 text-blue-300 border border-blue-500/30">OR-Tools</span>
          </div>
          <p className="text-slate-300">Resuelve la <strong>asignación de recursos y tareas al menor costo</strong> mediante programación matemática entera.</p>
        </div>

        <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 transition-all hover:bg-white/[0.06] hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-sm">4. Reglas & NLP</span>
            <span className="text-[10px] font-mono rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 border border-amber-500/30">AST + XAI</span>
          </div>
          <p className="text-slate-300">Aplica <strong>políticas de negocio en caliente</strong> y permite consultar el sistema mediante lenguaje natural.</p>
        </div>
      </div>
    </section>

    {/* Metrics Overview */}
    <section aria-labelledby="metrics-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="metrics-title" className="text-xl font-bold tracking-tight text-white">Indicadores de Desempeño</h2>
        <span className="text-xs font-mono text-slate-400">Actualizado en tiempo real</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, change, icon: Icon, badge, accent, border }) => (
          <div 
            key={title} 
            className={`glass-card p-5 relative overflow-hidden border ${border} bg-gradient-to-br ${accent} hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white shadow-sm">
                <Icon size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold tracking-tight text-white font-mono">{value}</p>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {change}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-slate-400">
              <span>Variación acumulada</span>
              <span className="font-mono text-[11px] text-slate-300">{badge}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Engines Grid */}
    <section aria-labelledby="modules-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="modules-title" className="text-xl font-bold tracking-tight text-white">Motores de Decisión Disponibles</h2>
        <span className="text-xs text-slate-400">Seleccioná un motor para experimentar</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {modules.map(({ title, desc, to, icon: Icon, badge, tech, color, glow, iconBg }) => (
          <Link
            key={title}
            to={to}
            className={`glass-card-interactive p-6 flex flex-col justify-between group border border-white/10 ${glow}`}
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${iconBg} ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">{title}</h3>
                    <p className="text-xs font-mono text-slate-400">{tech}</p>
                  </div>
                </div>
                <span className="rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-xs font-mono font-semibold text-slate-200">
                  {badge}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">{desc}</p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-primary">
              <span className="group-hover:text-blue-300 transition-colors">Abrir módulo de análisis</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* Microservices Cluster Telemetry */}
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Topología de Microservicios Conectados</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Red Saludable
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
        {microservices.map((svc) => (
          <div key={svc.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 flex flex-col justify-between">
            <span className="font-semibold text-slate-200">{svc.name}</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400">:{svc.port}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);
