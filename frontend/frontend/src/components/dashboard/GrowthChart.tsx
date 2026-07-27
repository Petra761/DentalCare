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
  Filler,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

import "../../pages/Dashboard/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
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

      const fechaTexto =
        fecha.getFullYear() +
        "-" +
        String(fecha.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(fecha.getDate()).padStart(2, "0");

      const citasDia = citas.filter((c) => c.fecha === fechaTexto);

      const completadas = citasDia.filter(
        (c) => c.estadoCita.toUpperCase() === "COMPLETADA",
      ).length;

      const pendientes = citasDia.filter(
        (c) => c.estadoCita.toUpperCase() === "PENDIENTE",
      ).length;

      const confirmadas = citasDia.filter(
        (c) => c.estadoCita.toUpperCase() === "CONFIRMADA",
      ).length;

      datos.push({
        label: fecha.toLocaleDateString("es-ES", {
          weekday: "short",
        }),

        value: completadas,

        completadas,
        pendientes,
        confirmadas,

        fechaCompleta: fecha.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
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

      const inicioTexto =
        inicio.getFullYear() +
        "-" +
        String(inicio.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(inicio.getDate()).padStart(2, "0");

      const finTexto =
        fin.getFullYear() +
        "-" +
        String(fin.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(fin.getDate()).padStart(2, "0");

      const citasSemana = citas.filter((c) => {
        return c.fecha >= inicioTexto && c.fecha <= finTexto;
      });

      const completadas = citasSemana.filter(
        (c) => c.estadoCita.toUpperCase() === "COMPLETADA",
      ).length;

      const pendientes = citasSemana.filter(
        (c) => c.estadoCita.toUpperCase() === "PENDIENTE",
      ).length;

      const confirmadas = citasSemana.filter(
        (c) => c.estadoCita.toUpperCase() === "CONFIRMADA",
      ).length;

      datos.push({
        label: `Semana ${4 - i}`,
        value: completadas,
        completadas,
        pendientes,
        confirmadas,
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

      const citasMes = citas.filter((c) => {
        const partes = c.fecha.split("-");

        const añoCita = Number(partes[0]);

        const mesCita = Number(partes[1]) - 1;

        return mesCita === mes && añoCita === año;
      });

      const completadas = citasMes.filter(
        (c) => c.estadoCita.toUpperCase() === "COMPLETADA",
      ).length;

      const pendientes = citasMes.filter(
        (c) => c.estadoCita.toUpperCase() === "PENDIENTE",
      ).length;

      const confirmadas = citasMes.filter(
        (c) => c.estadoCita.toUpperCase() === "CONFIRMADA",
      ).length;

      datos.push({
        label: fecha.toLocaleDateString("es-ES", {
          month: "short",
        }),

        value: completadas,

        completadas,
        pendientes,
        confirmadas,
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

          citasDetalle: datos.map((d) => ({
            completadas: d.completadas,
            pendientes: d.pendientes,
            confirmadas: d.confirmadas,
            fechaCompleta: d.fechaCompleta,
          })),

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

  const getOptions = () => ({
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

      tooltip: {
        callbacks: {
          title: (context: any) => {
            const detalle =
              context[0].dataset.citasDetalle[context[0].dataIndex];

            return detalle.fechaCompleta
              ? detalle.fechaCompleta
              : context[0].label;
          },

          label: (context: any) => {
            const detalle = context.dataset.citasDetalle[context.dataIndex];

            return [
              `Citas completadas: ${detalle.completadas}`,
              `Citas pendientes: ${detalle.pendientes}`,
              `Citas confirmadas: ${detalle.confirmadas}`,
            ];
          },
        },
      },
    },
  });

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

          <p>Evolución</p>

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
          <Bar data={getDataChart()} options={getOptions()} />
        ) : (
          <Line data={getDataChart()} options={getOptions()} />
        )}
      </div>
    </div>
  );
};
