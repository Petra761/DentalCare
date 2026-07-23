import React from "react";

interface AgendaStatsProps {
  stats: {
    totales: number;
    porcentaje: number;
  };
}

const AgendaStats: React.FC<AgendaStatsProps> = ({ stats }) => {
  return (
    <div className="bg-white border border-outline-variant rounded-lg p-5 shadow-sm">
      <h4 className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-wider">
        Resumen Mensual
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-low transition-all hover:border-primary/30">
          <p className="text-[10px] text-outline font-bold mb-1 uppercase">
            Citas Totales
          </p>
          <p className="text-2xl font-black text-primary">{stats.totales}</p>
        </div>

        <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-low transition-all hover:border-secondary/30">
          <p className="text-[10px] text-outline font-bold mb-1 uppercase">
            Confirmadas
          </p>
          <p className="text-2xl font-black text-secondary">
            {stats.porcentaje}%
          </p>
        </div>
      </div>

      <div className="mt-4 w-full bg-outline-variant rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-secondary h-full transition-all duration-500"
          style={{ width: `${stats.porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AgendaStats;
