import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Activity, Bot, Database } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/optimization", icon: <Activity size={20} />, label: "Optimization" },
    { to: "/prediction", icon: <Database size={20} />, label: "Prediction Lab" },
    { to: "/chat", icon: <Bot size={20} />, label: "Knowledge AI" },
  ];

  return (
    <div className="w-72 h-screen border-r border-white/5 bg-surface/30 backdrop-blur-2xl flex flex-col pt-8 relative z-20">
      <div className="px-8 mb-12 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <BrainCircuit className="text-primary" size={28} />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-accent bg-clip-text text-transparent">
          OptimusAI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-gradient-to-r from-primary/20 to-transparent text-white border border-primary/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <div className={`transition-transform duration-300 group-hover:scale-110`}>
              {item.icon}
            </div>
            <span className="font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-white/5 m-4 bg-white/[0.02] rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(139,92,246,0.4)]">
            AD
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-100">Admin User</p>
            <p className="text-accentLight text-xs mt-0.5">Enterprise Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background overflow-hidden selection:bg-primary/30 relative text-gray-200">
      {/* Animated Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-blob mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none animate-blob animation-delay-2000 mix-blend-screen" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-4000 mix-blend-screen" />
      
      <Sidebar />
      
      <main className="flex-1 h-screen overflow-y-auto p-10 relative z-10 scroll-smooth">
        <Outlet />
      </main>
    </div>
  );
};
