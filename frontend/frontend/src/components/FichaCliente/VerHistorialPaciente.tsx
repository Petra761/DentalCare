import React, { useState, useEffect } from "react";
import {
  getHistorialCliente,
  getClientePorId,
  obtenerAlergias,
  type HistorialCita,
  type Paciente,
  type Alergia,
} from "../../services/FichaCliente/pacienteServices";
import {
  ArrowLeft,
  User,
  Phone,
  Droplet,
  Calendar,
  ShieldCheck,
  Activity,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Props {
  paciente: Paciente;
  onVolver: () => void;
}

export const VerHistorialPaciente: React.FC<Props> = ({
  paciente,
  onVolver,
}) => {
  const [infoPaciente, setInfoPaciente] = useState<Paciente>(paciente);
  const [historial, setHistorial] = useState<HistorialCita[]>([]);
  const [alergiasCatalogo, setAlergiasCatalogo] = useState<Alergia[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  useEffect(() => {
    if (paciente?.idCliente) {
      setLoading(true);
      setErrorHistorial(null);
      Promise.all([
        getClientePorId(paciente.idCliente),
        getHistorialCliente(paciente.idCliente),
        obtenerAlergias(),
      ])
        .then(([datosDetallados, datosHistorial, catalogoAlergias]) => {
          setInfoPaciente(datosDetallados);
          setHistorial(datosHistorial);
          setAlergiasCatalogo(catalogoAlergias);
        })
        .catch((err) =>
          setErrorHistorial(err.message || "Error al cargar datos del paciente"),
        )
        .finally(() => setLoading(false));
    }
  }, [paciente?.idCliente]);

  const fullName = infoPaciente.nombre
    ? `${infoPaciente.nombre} ${infoPaciente.apellidoPaterno} ${infoPaciente.apellidoMaterno || ""}`
    : (infoPaciente as any).nombreCompleto;

  const initials = (infoPaciente.nombre?.[0] ?? "") + (infoPaciente.apellidoPaterno?.[0] ?? "");

  const getEstadoBadgeStyle = (estado: string) => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      border: "1px solid",
    };
    if (estado === "Completada" || estado === "Completado") {
      return { ...base, backgroundColor: "#DCFCE7", color: "#15803D", borderColor: "#86EFAC" };
    }
    if (estado === "Cancelada" || estado === "Cancelado") {
      return { ...base, backgroundColor: "#FEE2E2", color: "#B91C1C", borderColor: "#FCA5A5" };
    }
    return { ...base, backgroundColor: "#FEF3C7", color: "#B45309", borderColor: "#FCD34D" };
  };

  return (
    <>
      <style>{`
        @keyframes vhp-fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vhp-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes vhp-slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes vhp-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes vhp-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vhp-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .vhp-card {
          animation: vhp-fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .vhp-avatar-ring {
          background: linear-gradient(135deg, #009688 0%, #004D40 100%);
          border-radius: 50%;
          padding: 3px;
          display: inline-flex;
        }
        .vhp-avatar-ring-inner {
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          font-size: 22px;
          font-weight: 800;
          color: #009688;
          letter-spacing: -1px;
        }
        .vhp-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .vhp-btn-ghost:hover {
          background: #E0F2F1;
          color: #009688;
          border-color: #009688;
          box-shadow: 0 0 0 3px rgba(0,150,136,0.1);
          transform: translateX(-2px);
        }
        .vhp-btn-ghost:active { transform: scale(0.97); }

        .vhp-info-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
          animation: vhp-fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .vhp-info-item:hover {
          box-shadow: 0 4px 16px rgba(0,150,136,0.1);
          transform: translateY(-2px);
          border-color: #B2DFDB;
        }
        .vhp-info-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vhp-info-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94A3B8;
          margin-bottom: 3px;
        }
        .vhp-info-value {
          font-size: 14px;
          font-weight: 700;
          color: #1A252C;
        }

        .vhp-table { width: 100%; border-collapse: collapse; }
        .vhp-th {
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #64748B;
          text-align: left;
          background: #F8FAFC;
          border-bottom: 2px solid #E2E8F0;
          white-space: nowrap;
        }
        .vhp-td {
          padding: 16px 20px;
          font-size: 13px;
          color: #1A252C;
          border-bottom: 1px solid #F1F5F9;
          vertical-align: middle;
        }
        .vhp-tr {
          transition: background 0.18s;
          animation: vhp-fadeIn 0.3s ease both;
        }
        .vhp-tr:hover { background: #F0FDF9; }
        .vhp-tr:last-child td { border-bottom: none; }

        .vhp-tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: #E0F2FE;
          color: #0369A1;
          border: 1px solid #BAE6FD;
          transition: background 0.15s;
        }
        .vhp-tag:hover { background: #BAE6FD; }

        .vhp-spinner {
          width: 36px; height: 36px;
          border: 3px solid #E0F2F1;
          border-top-color: #009688;
          border-radius: 50%;
          animation: vhp-spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }
        .vhp-skeleton {
          background: linear-gradient(90deg, #F1F5F9 25%, #E8F0F4 50%, #F1F5F9 75%);
          background-size: 400px 100%;
          animation: vhp-shimmer 1.2s infinite;
          border-radius: 6px;
        }
        .vhp-pulse-dot {
          width: 8px; height: 8px;
          background: #009688;
          border-radius: 50%;
          animation: vhp-pulse-dot 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        className="vhp-card"
        style={{
          backgroundColor: "#F5F9FC",
          minHeight: "100vh",
          padding: "24px 20px",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* ═══════════════════════════════════════════════
            CABECERA HERO
        ═══════════════════════════════════════════════ */}
        <div
          style={{
            background: "linear-gradient(135deg, #004D40 0%, #009688 60%, #26A69A 100%)",
            borderRadius: "20px",
            padding: "28px 28px 80px",
            position: "relative",
            overflow: "hidden",
            marginBottom: "0",
            boxShadow: "0 8px 32px rgba(0,150,136,0.25)",
            animation: "vhp-fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Decoración de fondo */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />

          {/* Breadcrumb + Volver */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px", position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Pacientes &gt; Ficha Clínica
            </span>
            <button type="button" onClick={onVolver} className="vhp-btn-ghost">
              <ArrowLeft size={15} />
              Volver a la Lista
            </button>
          </div>

          {/* Nombre e identificación */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", position: "relative", zIndex: 1 }}>
            <div className="vhp-avatar-ring">
              <div className="vhp-avatar-ring-inner">
                {initials || <User size={26} />}
              </div>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "clamp(20px,4vw,28px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                {fullName}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                <div className="vhp-pulse-dot" />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                  {infoPaciente.estado || "Activo"} · CI {infoPaciente.ci}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            TARJETAS INFO (superpuestas sobre el hero)
        ═══════════════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: "14px",
            margin: "-52px 12px 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* CI */}
          <div className="vhp-info-item" style={{ animationDelay: "0.05s" }}>
            <div className="vhp-info-icon" style={{ background: "#E0F2F1", color: "#009688" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="vhp-info-label">Documento / CI</span>
              <span className="vhp-info-value">{infoPaciente.ci}</span>
            </div>
          </div>

          {/* Teléfono */}
          <div className="vhp-info-item" style={{ animationDelay: "0.1s" }}>
            <div className="vhp-info-icon" style={{ background: "#E0F2F1", color: "#009688" }}>
              <Phone size={20} />
            </div>
            <div>
              <span className="vhp-info-label">Teléfono</span>
              <span className="vhp-info-value">{infoPaciente.telefono || "No registrado"}</span>
            </div>
          </div>

          {/* Tipo de sangre */}
          <div className="vhp-info-item" style={{ animationDelay: "0.15s" }}>
            <div className="vhp-info-icon" style={{ background: "#E0F2F1", color: "#009688" }}>
              <Droplet size={20} />
            </div>
            <div>
              <span className="vhp-info-label">Tipo de Sangre</span>
              <span className="vhp-info-value">
                {infoPaciente.tipoSangre || (infoPaciente as any).grupoSanguineo || "N/A"}
              </span>
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className="vhp-info-item" style={{ animationDelay: "0.2s" }}>
            <div className="vhp-info-icon" style={{ background: "#E0F2F1", color: "#009688" }}>
              <Calendar size={20} />
            </div>
            <div>
              <span className="vhp-info-label">Fecha de Nacimiento</span>
              <span className="vhp-info-value">
                {infoPaciente.fechaNacimiento || (infoPaciente as any).fechaNac || "No registrada"}
              </span>
            </div>
          </div>

          {/* Estado ficha */}
          <div className="vhp-info-item" style={{ animationDelay: "0.25s" }}>
            <div className="vhp-info-icon" style={{ background: "#E0F2F1", color: "#009688" }}>
              <Activity size={20} />
            </div>
            <div>
              <span className="vhp-info-label">Estado Ficha</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "3px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: "#DCFCE7",
                  color: "#15803D",
                  border: "1px solid #86EFAC",
                }}
              >
                <CheckCircle2 size={12} />
                {infoPaciente.estado || "Activo"}
              </span>
            </div>
          </div>
        </div>

        {/* Banner de Alergias */}
        {alergiasCatalogo.filter((a) =>
          (infoPaciente as any).alergiaClientes?.some((pa: any) => pa.idAlergia === a.idAlergia)
        ).length > 0 ? (
          <div
            className="vhp-card"
            style={{
              margin: "0 12px 24px",
              padding: "16px 20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              animationDelay: "0.3s"
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#E0F2F1",
                color: "#009688",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid #B2DFDB"
              }}
            >
              <AlertCircle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#94A3B8",
                  marginBottom: "6px"
                }}
              >
                Atención - Alergias del Paciente
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {alergiasCatalogo
                  .filter((a) =>
                    (infoPaciente as any).alergiaClientes?.some((pa: any) => pa.idAlergia === a.idAlergia)
                  )
                  .map((a) => (
                    <span
                      key={a.idAlergia}
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: "#E0F2F1",
                        color: "#00796B",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        border: "1px solid #B2DFDB",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                      }}
                    >
                      {a.nombre}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="vhp-card"
            style={{
              margin: "0 12px 24px",
              padding: "14px 20px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              animationDelay: "0.3s"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#E2E8F0",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <AlertCircle size={18} />
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748B",
                  marginBottom: "2px"
                }}
              >
                Alergias
              </span>
              <span style={{ fontSize: "13px", color: "#64748B", fontStyle: "italic" }}>
                Sin alergias registradas o conocidas para este paciente.
              </span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SECCIÓN HISTORIAL
        ═══════════════════════════════════════════════ */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "18px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            overflow: "hidden",
            animation: "vhp-fadeInUp 0.5s 0.2s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Header sección */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid #E2E8F0",
              background: "linear-gradient(90deg, #F0FDF9 0%, #F5F9FC 100%)",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#004D40", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: "#E0F2F1", borderRadius: "10px", padding: "6px 8px", display: "flex", alignItems: "center" }}>
                <ClipboardList size={18} color="#009688" />
              </span>
              Historial de Citas y Servicios
            </h3>
            {!loading && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#009688",
                  backgroundColor: "#E0F2F1",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "1px solid #B2DFDB",
                }}
              >
                {historial.length} {historial.length === 1 ? "registro" : "registros"}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div className="vhp-spinner" />
              <p style={{ margin: 0, fontSize: "14px", color: "#94A3B8", fontStyle: "italic" }}>
                Cargando historial del paciente...
              </p>
              {/* Skeleton rows */}
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "0 8px" }}>
                    <div className="vhp-skeleton" style={{ height: "16px", width: "80px" }} />
                    <div className="vhp-skeleton" style={{ height: "16px", flex: 1 }} />
                    <div className="vhp-skeleton" style={{ height: "16px", width: "100px" }} />
                    <div className="vhp-skeleton" style={{ height: "16px", width: "80px" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {errorHistorial && (
            <div style={{ margin: "20px 24px", padding: "16px 20px", backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: "12px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={18} />
              {errorHistorial}
            </div>
          )}

          {/* Tabla */}
          {!loading && !errorHistorial && (
            <div style={{ overflowX: "auto" }}>
              <table className="vhp-table">
                <thead>
                  <tr>
                    <th className="vhp-th">#</th>
                    <th className="vhp-th">Código Cita</th>
                    <th className="vhp-th">Fecha y Hora</th>
                    <th className="vhp-th">Servicios / Tratamientos</th>
                    <th className="vhp-th">Estado</th>
                    <th className="vhp-th">Atendido por</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length > 0 ? (
                    historial.map((cita, idx) => (
                      <tr
                        key={cita.idCita}
                        className="vhp-tr"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {/* # */}
                        <td className="vhp-td">
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "28px",
                              height: "28px",
                              background: "#F1F5F9",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#64748B",
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        {/* Código */}
                        <td className="vhp-td">
                          <span
                            style={{
                              fontWeight: 800,
                              color: "#009688",
                              fontSize: "13px",
                              fontFamily: "monospace",
                              background: "#E0F2F1",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {cita.codigo}
                          </span>
                        </td>
                        {/* Fecha y hora */}
                        <td className="vhp-td">
                          <div style={{ fontWeight: 700, color: "#1A252C", fontSize: "13px" }}>
                            {cita.fecha}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#94A3B8",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "3px",
                            }}
                          >
                            <Clock size={11} />
                            {cita.hora}
                          </div>
                        </td>
                        {/* Servicios */}
                        <td className="vhp-td">
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {cita.servicios && cita.servicios.length > 0 ? (
                              cita.servicios.map((s) => (
                                <span key={s.idServicio} className="vhp-tag">
                                  {s.nombreServicio}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: "#94A3B8", fontSize: "12px", fontStyle: "italic" }}>
                                Sin servicios
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Estado */}
                        <td className="vhp-td">
                          <span style={getEstadoBadgeStyle(cita.estadoCita)}>
                            {cita.estadoCita === "Completada" || cita.estadoCita === "Completado"
                              ? <CheckCircle2 size={11} />
                              : null}
                            {cita.estadoCita}
                          </span>
                        </td>
                        {/* Atendido */}
                        <td className="vhp-td" style={{ fontWeight: 600, color: "#64748B" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#009688,#004D40)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {cita.usuarioAtendio?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            {cita.usuarioAtendio}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "56px 24px",
                          textAlign: "center",
                        }}
                      >
                        <ClipboardList
                          size={40}
                          style={{ margin: "0 auto 12px", color: "#CBD5E1", display: "block" }}
                        />
                        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#94A3B8", fontSize: "15px" }}>
                          Sin historial registrado
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#CBD5E1" }}>
                          Este paciente aún no registra citas ni tratamientos en el sistema.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
