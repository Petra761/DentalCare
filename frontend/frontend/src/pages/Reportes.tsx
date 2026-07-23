import React from 'react';
import { BarChart3 } from 'lucide-react';

export const Reportes: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
      <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4 text-brand-700">
        <BarChart3 size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Reportes</h1>
      <p className="text-slate-500 max-w-md">Esta vista se encuentra actualmente en desarrollo y estará disponible próximamente.</p>
      <span className="mt-4 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold uppercase tracking-wider">Por implementar</span>
    </div>
  );
};
