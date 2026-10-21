import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Activity, 
  Bot, 
  Database, 
  TrendingUp, 
  Sliders, 
  Menu, 
  X, 
  LogOut, 
  Sparkles,
  Zap
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio', tag: 'Deck' },
  { to: '/optimization', icon: Activity, label: 'Optimización', tag: 'OR-Tools' },
  { to: '/prediction', icon: Database, label: 'Predicción', tag: 'XGBoost' },
  { to: '/simulation', icon: TrendingUp, label: 'Simulación Monte Carlo', tag: 'NumPy' },
  { to: '/rules', icon: Sliders, label: 'Reglas de Negocio', tag: 'AST' },
  { to: '/chat', icon: Bot, label: 'Interpretar instrucciones', tag: 'NLP/XAI' },
];

const Navigation = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav aria-label="Navegación principal" className="flex flex-col gap-1.5">
    {navItems.map(({ to, icon: Icon, label, tag }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'border border-primary/40 bg-gradient-to-r from-blue-600/20 via-primary/15 to-transparent text-white shadow-sm shadow-blue-500/10 font-semibold'
              : 'border border-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white hover:border-white/10'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary shadow-glow-primary" />
            )}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/25 text-primary shadow-glow-primary'
                  : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
              }`}
            >
              <Icon size={18} aria-hidden="true" />
            </div>
            <span className="flex-1 truncate">{label}</span>
            {tag && (
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-mono tracking-wider transition-colors ${
                  isActive
                    ? 'border border-primary/40 bg-primary/20 text-blue-200 font-bold'
                    : 'border border-white/10 bg-white/5 text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {tag}
              </span>
            )}
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mainContent = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    mainContent.current?.focus();
    const storedUser = localStorage.getItem('optimus_user');
    setCurrentUser(storedUser || 'admin_supererp');
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('optimus_token');
    localStorage.removeItem('optimus_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 md:flex md:h-screen">
      {/* Sidebar Desktop */}
      <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-surface/95 backdrop-blur-2xl px-4 py-5 md:flex z-20">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-primary/20 to-purple-600/30 border border-primary/40 shadow-glow-primary">
            <BrainCircuit size={24} className="text-primary animate-pulse-slow" aria-hidden="true" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900" />
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                OptimusAI
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide">
              SuperERP Intelligence
            </p>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="mb-5 mx-1 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">Cluster Activo</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Gateway :8000</span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Motores Cuantitativos
          </div>
          <Navigation />
        </div>

        {/* Bottom User & Environment Card */}
        <div className="mt-auto border-t border-white/10 pt-4 px-1 space-y-3">
          {/* Quick AI Trigger Banner */}
          <Link
            to="/chat"
            className="group flex items-center justify-between rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-primary/10 to-transparent p-2.5 text-xs text-purple-200 transition-all hover:border-purple-500/50 hover:shadow-glow-accent"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-semibold text-white group-hover:text-purple-200">Consultar Asistente</span>
            </div>
            <Zap size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </Link>

          {/* User Profile / Logout */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-purple-600/30 border border-white/15 text-xs font-bold text-white uppercase">
                {currentUser ? currentUser.substring(0, 2) : 'OP'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{currentUser || 'admin_supererp'}</p>
                <p className="truncate text-[10px] text-slate-400">Rol: Administrador</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-red-400"
            >
              <LogOut size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top Header Mobile */}
      <div 
        className="border-b border-white/10 bg-surface/95 backdrop-blur-xl md:hidden sticky top-0 z-30" 
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen) {
            event.preventDefault();
            setMenuOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
              <BrainCircuit size={20} aria-hidden="true" />
            </div>
            <div>
              <span className="text-base font-bold text-white">OptimusAI</span>
              <span className="ml-1.5 rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary">ERP</span>
            </div>
          </div>
          <button
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
        <div id="mobile-navigation" hidden={!menuOpen} className="border-t border-white/10 px-4 py-3 bg-surface/98 space-y-3">
          <Navigation onNavigate={() => setMenuOpen(false)} />
          <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Usuario: {currentUser || 'admin_supererp'}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        ref={mainContent} 
        id="main-content" 
        tabIndex={-1} 
        className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:h-screen md:overflow-y-auto md:px-8 md:py-8 xl:px-12 relative focus:outline-none"
      >
        {/* Subtle Ambient Radial Glow in the background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />
          <div className="absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
