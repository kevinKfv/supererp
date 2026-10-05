import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Activity, Bot, Database, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/optimization', icon: Activity, label: 'Optimización', demo: true },
  { to: '/prediction', icon: Database, label: 'Predicción', demo: true },
  { to: '/chat', icon: Bot, label: 'Interpretar instrucciones' },
];

const Navigation = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav aria-label="Navegación principal" className="flex flex-col gap-1">
    {navItems.map(({ to, icon: Icon, label, demo }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex min-h-11 items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? 'border-primary/40 bg-primary/15 text-white'
              : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
          }`
        }
      >
        <Icon size={19} aria-hidden="true" className="shrink-0" />
        <span className="flex-1">{label}</span>
        {demo && <span className="text-xs font-normal text-gray-400">Demo</span>}
      </NavLink>
    ))}
  </nav>
);

export const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mainContent = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainContent.current?.focus();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-gray-100 md:flex md:h-screen">
      <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-surface px-4 py-6 md:flex">
        <div className="mb-10 flex items-center gap-3 px-3">
          <BrainCircuit size={28} aria-hidden="true" className="text-primary" />
          <span className="text-xl font-bold text-white">OptimusAI</span>
        </div>
        <Navigation />
        <p className="mt-auto px-3 text-xs text-gray-400">Prototipo de análisis empresarial</p>
      </aside>

      <div className="border-b border-white/10 bg-surface md:hidden" onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          event.preventDefault();
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}>
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={24} aria-hidden="true" className="text-primary" />
            <span className="text-lg font-bold text-white">OptimusAI</span>
          </div>
          <button
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 text-white hover:bg-white/5"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        <div id="mobile-navigation" hidden={!menuOpen} className="border-t border-white/10 px-3 py-3">
          <Navigation onNavigate={() => setMenuOpen(false)} />
        </div>
      </div>

      <main ref={mainContent} id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:h-screen md:overflow-y-auto md:px-8 md:py-8 xl:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
