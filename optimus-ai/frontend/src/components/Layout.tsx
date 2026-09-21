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
    <div className="w-64 h-screen border-r border-white/10 bg-surface/50 backdrop-blur-xl flex flex-col pt-8">
      <div className="px-6 mb-10 flex items-center gap-3">
        <BrainCircuit className="text-primary" size={28} />
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          OptimusAI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-sm font-bold">
            AD
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-200">Admin User</p>
            <p className="text-gray-500 text-xs">Enterprise Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      <Sidebar />
      
      <main className="flex-1 h-screen overflow-y-auto p-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};
