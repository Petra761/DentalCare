import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Zap,
  XCircle,
  MessageCircle,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { TopBar } from "../../components/dashboard/TopBar";
import { StatCard } from "../../components/dashboard/StatCard";
import { MonthlyChart } from "../../components/dashboard/MonthlyChart";
import { RecentReservations } from "../../components/dashboard/RecentReservations";
import { ProgressBar } from "../../components/dashboard/ProgressBar";
import "./Dashboard.css";
import type {
  DbCita,
  Cliente,
  Servicio,
  Usuario,
  Categoria,
  DetalleCita,
} from "../../services/api";
import { apiService } from "../../services/api";

export const Dashboard: React.FC = () => {
  // Estado para los datos
  const [citas, setCitas] = useState<DbCita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [detalleCitas, setDetalleCitas] = useState<DetalleCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Dr. Alejandro");

  // Simular carga de datos (reemplazar con API calls reales)
  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);

      const [
        usuariosData,
        clientesData,
        categoriasData,
        serviciosData,
        citasData,
        detalleData,
      ] = await Promise.all([
        apiService.getUsuarios(),
        apiService.getClientes(),
        apiService.getCategorias(),
        apiService.getServicios(),
        apiService.getDbCitas(),
        apiService.getDetallesCita(),
      ]);

      setUsuarios(usuariosData);
      setClientes(clientesData);
      setCategorias(categoriasData);
      setServicios(serviciosData);
      setCitas(citasData);
      setDetalleCitas(detalleData);

      if (usuariosData.length > 0) {
        setUserName(usuariosData[0].nombreUsuario);
      }
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const hoy = new Date().toISOString().split("T")[0];

  const citasDelDia = citas.filter((c) => c.fecha === hoy).length;
  const pacientesNuevos = clientes.length;
  const efectividadBot =
    citas.length === 0
      ? "0%"
      : `${Math.round(
          (citas.filter((c) => c.estadoCita === "Confirmada").length /
            citas.length) *
            100,
        )}%`;
  const tasaCancelacion =
    citas.length === 0
      ? "0%"
      : `${Math.round(
          (citas.filter((c) => c.estadoCita === "Cancelada").length /
            citas.length) *
            100,
        )}%`;

  // Datos para métricas del asistente
  const totalConsultas = citas.length;
  const citasConfirmadas = citas.filter(
    (c) => c.estadoCita === "Confirmada",
  ).length;
  const citasPendientes = citas.filter(
    (c) => c.estadoCita === "Pendiente",
  ).length;
  const porcentajeConfirmadas =
    totalConsultas > 0
      ? Math.round((citasConfirmadas / totalConsultas) * 100)
      : 0;

  const handleNewCita = () => {
    console.log("Nueva cita");
    // Implementar acción
  };

  const handleLogout = () => {
    console.log("Logout");
    // Implementar acción
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {/* <Sidebar
        userName={userName}
        onNewCita={handleNewCita}
        onLogout={handleLogout}
      /> */}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <TopBar userName={userName} />

        {/* Content Wrapper */}
        <div className="dashboard-content">
          {/* Stat Cards Grid */}
          <section className="stats-grid">
            <StatCard
              title="CITAS DEL DÍA"
              value={citasDelDia}
              subtitle="+12% vs ayer"
              icon={Calendar}
              color="#10B981"
            />
            <StatCard
              title="PACIENTES NUEVOS (MES)"
              value={pacientesNuevos}
              subtitle="+5% mes ant."
              icon={Users}
              color="#3B82F6"
            />
            <StatCard
              title="EFECTIVIDAD DEL BOT (%)"
              value={efectividadBot}
              icon={Zap}
              color="#06B6D4"
            />
            <StatCard
              title="TASA DE CANCELACIÓN"
              value={tasaCancelacion}
              subtitle="-2.1%"
              icon={XCircle}
              color="#EF4444"
            />
            <StatCard
              title="CITAS CONFIRMADAS"
              value={`${porcentajeConfirmadas}%`}
              subtitle={`${citasConfirmadas} citas`}
              icon={CheckCircle2}
              color="#10B981"
            />
            <StatCard
              title="CITAS PENDIENTES"
              value={citasPendientes}
              subtitle="Por confirmar"
              icon={Clock3}
              color="#F59E0B"
            />
          </section>

          {/* Charts and Tables Grid */}
          <div className="charts-container">
            {/* Monthly Chart */}
            <MonthlyChart citas={citas} />

            {/* Recent Reservations */}
            <RecentReservations
              citas={citas}
              clientes={clientes}
              servicios={servicios}
            />
          </div>

          {/* Assistant Metrics */}
          <section className="assistant-section">
            {/* Header */}
            <div className="assistant-header">
              <div className="assistant-title-wrapper">
                <div className="assistant-icon-title">
                  <Zap size={24} />
                </div>
                <h2>Métricas del Asistente Virtual</h2>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-box">
                <div className="metric-label">AGENDADOS POR BOT</div>
                <div className="metric-value">14</div>
                <div className="metric-subtext">esta mes</div>
              </div>

              <div className="metric-box">
                <div className="metric-label">REAGENDADOS BOT</div>
                <div className="metric-value">2</div>
                <div className="metric-subtext">por manual</div>
              </div>

              <div className="metric-box">
                <div className="metric-label">CANCELACIONES BOT</div>
                <div className="metric-value">1</div>
                <div className="metric-subtext">vía chat</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
              <ProgressBar
                title="Ahorro de Tiempo Estimado"
                value={48}
                total={100}
                color="#3B82F6"
              />
              <div className="time-label">48h / mes</div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>
            © 2024 DENTALFLOW CLINICAL MANAGEMENT. TODOS LOS DERECHOS
            RESERVADOS.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
