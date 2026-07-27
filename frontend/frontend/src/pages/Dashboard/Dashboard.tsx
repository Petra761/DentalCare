import React, { useEffect, useState } from "react";
import { Calendar, Users, Bot, XCircle } from "lucide-react";

import { apiService } from "../../services/api";
import type { DbCita, Cliente, Servicio } from "../../services/api";
import { RecentReservations } from "../../components/dashboard/RecentReservations";
import { GrowthChart } from "../../components/dashboard/GrowthChart";
import { AssistantMetrics } from "../../components/dashboard/AssistantMetrics";

import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const [citas, setCitas] = useState<DbCita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [citasDB, clientesDb, serviciosDB] = await Promise.all([
        apiService.GetCitasDashboard(),
        apiService.getClientes(),
        apiService.getServicios(),
      ]);
      console.log("CLIENTES API:", clientesDb);
      console.log("CITAS API:", citasDB);
      const detalles = await apiService.getDetallesCita();

      const citasConServicio = citasDB.map((cita) => {
        const detalle = detalles.find((d) => d.idCita === cita.idCita);

        const servicio = serviciosDB.find(
          (s) => s.idServicio === detalle?.idServicio,
        );

        return {
          ...cita,
          serviceName: servicio?.nombre,
        };
      });

      setCitas(citasConServicio);

      // Guardar la lista de pacientes
      setClientes(clientesDb);

      // Guardar el total de pacientes
      setTotalPacientes(clientesDb.length);
      setServicios(serviciosDB);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="dashboard-loading">Cargando Dashboard...</div>;
  }

  // ==========================
  // MÉTRICAS DINÁMICAS
  // ==========================

  const fechaActual = new Date();

  const hoy =
    fechaActual.getFullYear() +
    "-" +
    String(fechaActual.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(fechaActual.getDate()).padStart(2, "0");

  const citasHoy = citas.filter((c) => c.fecha === hoy);

  // Cancelaciones generales
  const canceladas = citas.filter(
    (c) => c.estadoCita.toUpperCase() === "CANCELADA",
  );

  // Citas realizadas por WhatsApp (Bot)
  const citasWhatsApp = citas.filter(
    (c) => c.medioComunicacion?.toLowerCase() === "whatsapp",
  );

  // Confirmadas por Bot
  const confirmadasBot = citasWhatsApp.filter(
    (c) => c.estadoCita.toUpperCase() === "CONFIRMADA",
  );

  // Efectividad del Bot
  const efectividadBot =
    citasWhatsApp.length === 0
      ? 0
      : Math.round((confirmadasBot.length / citasWhatsApp.length) * 100);

  // Tasa de cancelación general
  const tasaCancelacion =
    citas.length === 0
      ? 0
      : Math.round((canceladas.length / citas.length) * 100);
  // ==========================
  // MÉTRICAS ASISTENTE VIRTUAL
  // ==========================

  // Citas realizadas mediante WhatsApp (Bot)
  const citasBot = citas.filter(
    (c) => c.medioComunicacion?.toUpperCase() === "WHATSAPP",
  );

  // Agendadas por Bot
  // (pendientes o confirmadas creadas por WhatsApp)
  const agendadasBot = citasBot.filter((c) => {
    const estado = c.estadoCita.toUpperCase();

    return estado === "PENDIENTE" || estado === "CONFIRMADA";
  }).length;

  // Reagendadas por Bot
  const reagendadasBot = citasBot.filter(
    (c) => c.estadoCita.toUpperCase() === "REAGENDADO",
  ).length;

  // Canceladas por Bot
  const canceladasBot = citasBot.filter(
    (c) => c.estadoCita.toUpperCase() === "CANCELADA",
  ).length;
  return (
    <div className="dashboard">
      <section className="cards-grid">
        <div className="card card-green">
          <div className="card-icon">
            <Calendar size={26} />
          </div>

          <span className="card-title">CITAS DEL DÍA</span>

          <h2>{citasHoy.length}</h2>

          <p>Total programadas para hoy</p>
        </div>

        <div className="card card-blue">
          <div className="card-icon">
            <Users size={26} />
          </div>

          <span className="card-title">PACIENTES</span>

          <h2>{totalPacientes}</h2>

          <p>Registrados en el sistema</p>
        </div>

        <div className="card card-cyan">
          <div className="card-icon">
            <Bot size={26} />
          </div>

          <span className="card-title">EFECTIVIDAD BOT</span>

          <h2>{efectividadBot}%</h2>

          <p>Citas confirmadas automáticamente</p>
        </div>

        <div className="card card-red">
          <div className="card-icon">
            <XCircle size={26} />
          </div>

          <span className="card-title">CANCELACIONES</span>

          <h2>{tasaCancelacion}%</h2>

          <p>Tasa de cancelación</p>
        </div>
      </section>
      <section className="dashboard-bottom">
        <div>
          <GrowthChart citas={citas} />
        </div>

        <div>
          <RecentReservations citas={citas} clientes={clientes} />
        </div>
      </section>
      <section className="assistant-container">
        <AssistantMetrics
          agendadasBot={agendadasBot}
          reagendadasBot={reagendadasBot}
          canceladasBot={canceladasBot}
        />
      </section>
    </div>
  );
};

export default Dashboard;
