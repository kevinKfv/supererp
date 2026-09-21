import React from 'react';
import { Activity, Users, Box, TrendingUp, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, change, icon, isPositive }: any) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-primary">
        {icon}
      </div>
      <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${isPositive ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-400'}`}>
        {isPositive ? '+' : ''}{change}%
      </span>
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-100 mt-1">{value}</p>
  </div>
);

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-gray-400 mt-2">Bienvenido a OptimusAI Enterprise Command Center.</p>
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
        <div className="glass-card p-6 lg:col-span-2 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Optimization Performance</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-gray-500">Gráfico de rendimiento (Integración futura con Recharts)</p>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent AI Actions</h3>
          <div className="space-y-4">
            {[
              { time: "2 min ago", text: "Simulación de Monte Carlo completada." },
              { time: "15 min ago", text: "Modelo de ventas XGBoost re-entrenado." },
              { time: "1 hour ago", text: "Regla de asignación disparada por Knowledge Engine." }
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm text-gray-200">{log.text}</p>
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
