import React from 'react';
import { Activity, Users, Box, TrendingUp, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, change, icon, isPositive }: any) => (
  <div className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-primary shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md ${isPositive ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
        {isPositive ? '+' : ''}{change}%
      </span>
    </div>
    <h3 className="text-gray-400 text-sm font-medium tracking-wide">{title}</h3>
    <p className="text-3xl font-bold text-gray-100 mt-2 tracking-tight group-hover:text-white transition-colors">{value}</p>
  </div>
);

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-up duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">System Overview</h1>
        <p className="text-gray-400 text-lg">Bienvenido a OptimusAI Enterprise Command Center.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Predictions" 
          value="1.2M" 
          change={12.5} 
          isPositive={true} 
          icon={<TrendingUp />} 
        />
        <StatCard 
          title="Active Optimizations" 
          value="34" 
          change={5.2} 
          isPositive={true} 
          icon={<Activity />} 
        />
        <StatCard 
          title="Resource Utilization" 
          value="87%" 
          change={-2.4} 
          isPositive={false} 
          icon={<Box />} 
        />
        <StatCard 
          title="Critical Risks" 
          value="2" 
          change={-50.0} 
          isPositive={true} 
          icon={<AlertTriangle />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2 min-h-[420px] flex flex-col hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Optimization Performance</h3>
            <button className="text-sm text-primary hover:text-primaryDark transition-colors">View Details &rarr;</button>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
            <p className="text-gray-500 group-hover:text-gray-300 transition-colors">Gráfico de rendimiento (Integración futura con Recharts)</p>
          </div>
        </div>
        
        <div className="glass-card p-6 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent AI Actions</h3>
          </div>
          <div className="space-y-6">
            {[
              { time: "2 min ago", text: "Simulación de Monte Carlo completada.", status: "success" },
              { time: "15 min ago", text: "Modelo de ventas XGBoost re-entrenado.", status: "info" },
              { time: "1 hour ago", text: "Regla de asignación disparada por Knowledge Engine.", status: "warning" }
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-125 ${
                  log.status === 'success' ? 'bg-secondary text-secondary' : 
                  log.status === 'warning' ? 'bg-amber-400 text-amber-400' : 'bg-primary text-primary'
                }`} />
                <div>
                  <p className="text-sm text-gray-200 group-hover:text-white transition-colors">{log.text}</p>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
