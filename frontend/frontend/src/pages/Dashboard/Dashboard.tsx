import React, { useEffect, useState } from "react";
import { Calendar, Users, Bot, XCircle } from "lucide-react";

import { apiService } from "../../services/api";
import type { DbCita, Cliente, Servicio } from "../../services/api";
import { RecentReservations } from "../../components/dashboard/RecentReservations";
import { GrowthChart } from "../../components/dashboard/GrowthChart";
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
      const [citasDB, clientesResponse, serviciosDB] = await Promise.all([
        apiService.getDbCitas(),
        apiService.getClientesDashboard(),
        apiService.getServicios(),
      ]);
      console.log("CLIENTES API:", clientesResponse.pacientes);
      console.log("CITAS API:", citasDB);
      setCitas(citasDB);

      // Guardar la lista de pacientes
      setClientes(clientesResponse.pacientes);

      // Guardar el total de pacientes
      setTotalPacientes(clientesResponse.totalPacientes);
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

  const hoy = new Date().toISOString().split("T")[0];

  const citasHoy = citas.filter((c) => c.fecha === hoy);

  const canceladas = citas.filter(
    (c) => c.estadoCita.toUpperCase() === "CANCELADA",
  );

  const confirmadas = citas.filter(
    (c) => c.estadoCita.toUpperCase() === "CONFIRMADA",
  );

  const efectividad =
    citas.length === 0
      ? 0
      : Math.round((confirmadas.length / citas.length) * 100);

  const tasaCancelacion =
    citas.length === 0
      ? 0
      : Math.round((canceladas.length / citas.length) * 100);
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

          <h2>{efectividad}%</h2>

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
    </div>
  );
};

export default Dashboard;
