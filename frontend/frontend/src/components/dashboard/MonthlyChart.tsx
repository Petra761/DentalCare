import React from "react";
import type { DbCita } from "../../services/api";

interface MonthlyChartProps {
  citas: DbCita[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ citas }) => {
  // Datos para el gráfico (últimos 6 meses)
  const chartData = [
    { mes: "ENE", valor: 45 },
    { mes: "FEB", valor: 52 },
    { mes: "MAR", valor: 68 },
    { mes: "ABR", valor: 78 },
    { mes: "MAY", valor: 72 },
    { mes: "JUN", valor: 85 },
  ];

  const maxValor = Math.max(...chartData.map((d) => d.valor));

  return (
    <div className="monthly-chart-container">
      <div className="chart-header">
        <h2>Crecimiento Mensual</h2>
        <button className="filter-btn">Últimos 6 meses</button>
      </div>

      <div className="chart-body">
        <div className="bars-container">
          {chartData.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-wrapper">
                <div
                  className={`bar ${index === 3 ? "bar-highlight" : ""}`}
                  style={{
                    height: `${(item.valor / maxValor) * 100}%`,
                  }}
                />
              </div>
              <span className="bar-label">{item.mes}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-footer">
        <span className="total-citas">Total citas: {citas.length}</span>
      </div>
    </div>
  );
};
