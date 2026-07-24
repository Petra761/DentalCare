import React, { useState } from "react";
import type { DbCita } from "../../services/api";
import type { ChartOptions } from "chart.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

import "../../pages/dashboard/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface GrowthChartProps {
  citas: DbCita[];
}

type Periodo = "diario" | "semanal" | "mensual";

export const GrowthChart: React.FC<GrowthChartProps> = ({ citas }) => {
  const [periodo, setPeriodo] = useState<Periodo>("diario");

  // ===============================
  // ULTIMOS 7 DIAS
  // ===============================

  const obtenerDiario = () => {
    const datos: any[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();

      fecha.setDate(fecha.getDate() - i);

      const fechaTexto = fecha.toISOString().split("T")[0];

      const cantidad = citas.filter((c) => c.fecha === fechaTexto).length;

      datos.push({
        label: fecha.toLocaleDateString("es-ES", {
          weekday: "short",
        }),

        value: cantidad,
      });
    }

    return datos;
  };

  // ===============================
  // ULTIMAS 4 SEMANAS
  // ===============================

  const obtenerSemanal = () => {
    const datos: any[] = [];

    for (let i = 3; i >= 0; i--) {
      const inicio = new Date();

      inicio.setDate(inicio.getDate() - i * 7);

      const fin = new Date(inicio);

      fin.setDate(fin.getDate() + 6);

      const cantidad = citas.filter((c) => {
        const fechaCita = new Date(c.fecha);

        return fechaCita >= inicio && fechaCita <= fin;
      }).length;

      datos.push({
        label: `Semana ${4 - i}`,

        value: cantidad,
      });
    }

    return datos;
  };

  // ===============================
  // ULTIMOS 6 MESES
  // ===============================

  const obtenerMensual = () => {
    const datos: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();

      fecha.setMonth(fecha.getMonth() - i);

      const mes = fecha.getMonth();

      const año = fecha.getFullYear();

      const cantidad = citas.filter((c) => {
        const fechaCita = new Date(c.fecha);

        return fechaCita.getMonth() === mes && fechaCita.getFullYear() === año;
      }).length;

      datos.push({
        label: fecha.toLocaleDateString("es-ES", {
          month: "short",
        }),

        value: cantidad,
      });
    }

    return datos;
  };

  // ===============================
  // DATOS PARA CHART JS
  // ===============================

  const getDataChart = () => {
    let datos: any[] = [];

    switch (periodo) {
      case "diario":
        datos = obtenerDiario();

        break;

      case "semanal":
        datos = obtenerSemanal();

        break;

      case "mensual":
        datos = obtenerMensual();

        break;
    }

    return {
      labels: datos.map((d) => d.label),

      datasets: [
        {
          label: "Citas",

          data: datos.map((d) => d.value),

          borderColor: "#009688",

          backgroundColor: "#E0F2F1",

          pointBackgroundColor: "#00796B",

          pointBorderColor: "#FFFFFF",

          pointRadius: 5,
          borderRadius: 8,

          borderWidth: 3,

          tension: 0.4,

          fill: true,
        },
      ],
    };
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          stepSize: 1,

          precision: 0,
        },
      },
    },

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const getTotalPeriodo = () => {
    let datos: any[] = [];

    switch (periodo) {
      case "diario":
        datos = obtenerDiario();
        break;

      case "semanal":
        datos = obtenerSemanal();
        break;

      case "mensual":
        datos = obtenerMensual();
        break;
    }

    return datos.reduce((total, item) => total + item.value, 0);
  };

  return (
    <div className="growth-container">
      <div className="growth-header">
        <div>
          <h2>Crecimiento de citas</h2>

          <p>Evolución de reservas realizadas</p>

          <span className="growth-total">Total: {getTotalPeriodo()} citas</span>
        </div>

        <div className="growth-buttons">
          <button
            className={periodo === "diario" ? "active" : ""}
            onClick={() => setPeriodo("diario")}
          >
            Diario
          </button>

          <button
            className={periodo === "semanal" ? "active" : ""}
            onClick={() => setPeriodo("semanal")}
          >
            Semanal
          </button>

          <button
            className={periodo === "mensual" ? "active" : ""}
            onClick={() => setPeriodo("mensual")}
          >
            Mensual
          </button>
        </div>
      </div>

      <div className="chart-area">
        {periodo === "semanal" ? (
          <Bar data={getDataChart()} options={options} />
        ) : (
          <Line data={getDataChart()} options={options} />
        )}
      </div>
    </div>
  );
};
