import React, { useState, useEffect } from "react";
import {
  obtenerAlergias,
  actualizarCliente,
  getClientePorId,
  type Alergia,
} from "../../services/FichaCliente/pacienteServices";
import { Save, X, User, Heart, ChevronDown, Loader2 } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

interface Props {
  idCliente: number;
  onCancelar: () => void;
  onSuccess: () => void;
}

export const EditarPacienteModal: React.FC<Props> = ({
  idCliente,
  onCancelar,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    ci: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    tipoSangre: "",
    telefono: "",
    estado: "Activo",
  });

  const [alergiasCatalogo, setAlergiasCatalogo] = useState<Alergia[]>([]);
  const [alergiasSeleccionadas, setAlergiasSeleccionadas] = useState<Alergia[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar catálogo de alergias y datos del paciente
  useEffect(() => {
    const fetchTodo = async () => {
      setLoadingDatos(true);
      try {
        const [paciente, alergias] = await Promise.all([
          getClientePorId(idCliente),
          obtenerAlergias(),
        ]);

        // Mapear fechaNacimiento: el backend puede devolver "2000-01-15T00:00:00"
        const fechaRaw: string = (paciente as any).fechaNacimiento ?? "";
        const fechaFormateada = fechaRaw ? fechaRaw.substring(0, 10) : "";

        setFormData({
          ci: String((paciente as any).ci ?? ""),
          nombre: (paciente as any).nombre ?? "",
          apellidoPaterno: (paciente as any).apellidoPaterno ?? "",
          apellidoMaterno: (paciente as any).apellidoMaterno ?? "",
          fechaNacimiento: fechaFormateada,
          tipoSangre: (paciente as any).tipoSangre ?? "",
          telefono: (paciente as any).telefono ?? "",
          estado: (paciente as any).estado ?? "Activo",
        });

        setAlergiasCatalogo(alergias);

        // Pre-cargar alergias ya asignadas al paciente
        const alergiasDelPaciente: { idAlergia: number }[] =
          (paciente as any).alergiaClientes ?? [];
        const alergiasIniciales = alergias.filter((a) =>
          alergiasDelPaciente.some((pa) => pa.idAlergia === a.idAlergia),
        );
        setAlergiasSeleccionadas(alergiasIniciales);
      } catch (err: any) {
        setErrorMsg("Error al cargar los datos del paciente.");
      } finally {
        setLoadingDatos(false);
      }
    };

    fetchTodo();
  }, [idCliente]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSeleccionarAlergia = (alergia: Alergia) => {
    setAlergiasSeleccionadas([...alergiasSeleccionadas, alergia]);
    setMostrarDropdown(false);
  };

  const handleRemoverAlergia = (idAlergia: number) => {
    setAlergiasSeleccionadas(
      alergiasSeleccionadas.filter((a) => a.idAlergia !== idAlergia),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setLoadingGuardar(true);
      const payload = {
        idCliente,
        ...formData,
        alergiaClientes: alergiasSeleccionadas.map((a) => ({
          idAlergia: a.idAlergia,
          idCliente,
        })),
      };
      await actualizarCliente(idCliente, payload);
      showSuccess("Datos actualizados correctamente.");
      onSuccess();
    } catch (error: any) {
      showError("Error al guardar la información.");
      setErrorMsg(error.message || "Error al actualizar el registro.");
    } finally {
      setLoadingGuardar(false);
    }
  };

  const alergiasDisponibles = alergiasCatalogo.filter(
    (a) => !alergiasSeleccionadas.some((s) => s.idAlergia === a.idAlergia),
  );

  return (
    /* Overlay */
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: "24px",
      }}
      onClick={onCancelar}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: "880px",
          maxHeight: "92vh",
          overflowY: "auto",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <style>{`
          .ep-form-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
          }
          @media (max-width: 768px) {
            .ep-form-grid { grid-template-columns: 1fr; }
          }
          .ep-field-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          @media (max-width: 560px) {
            .ep-field-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        {/* ── Cabecera ──────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            borderBottom: "1px solid #E2E8F0",
            paddingBottom: "18px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#64748B",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Pacientes › Editar Ficha
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "800",
                color: "#1A252C",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User size={22} style={{ color: "#009688" }} />
              Editar Paciente
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onCancelar}
              className="fc-btn-ghost"
              disabled={loadingGuardar}
            >
              <X size={15} />
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loadingGuardar || loadingDatos}
              className="fc-btn-primary"
            >
              {loadingGuardar ? (
                <Loader2 size={15} className="animate-spin-custom" />
              ) : (
                <Save size={15} />
              )}
              {loadingGuardar ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>

        {/* ── Error ─────────────────────────────────── */}
        {errorMsg && (
          <div
            className="animate-fade-in"
            style={{
              padding: "12px 16px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#B91C1C",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* ── Skeleton de carga ─────────────────────── */}
        {loadingDatos ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "60px 0",
              color: "#64748B",
            }}
          >
            <Loader2
              size={32}
              className="animate-spin-custom"
              style={{ color: "#009688" }}
            />
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              Cargando datos del paciente...
            </span>
          </div>
        ) : (
          /* ── Formulario ─────────────────────────── */
          <div className="ep-form-grid">
            {/* Columna izquierda: Datos personales */}
            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "15px",
                  fontWeight: "bold",
                  color: "#004D40",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <User size={17} />
                Información Personal
              </h3>

              <div className="ep-field-grid">
                {/* CI */}
                <div>
                  <label style={labelStyle}>CI / Documento</label>
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleChange}
                    required
                    className="fc-input"
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="fc-input"
                  />
                </div>

                {/* Apellido Paterno */}
                <div>
                  <label style={labelStyle}>Apellido Paterno</label>
                  <input
                    type="text"
                    name="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={handleChange}
                    required
                    className="fc-input"
                  />
                </div>

                {/* Apellido Materno */}
                <div>
                  <label style={labelStyle}>Apellido Materno</label>
                  <input
                    type="text"
                    name="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={handleChange}
                    className="fc-input"
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div>
                  <label style={labelStyle}>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                    className="fc-input"
                  />
                </div>

                {/* Tipo Sangre */}
                <div>
                  <label style={labelStyle}>Tipo de Sangre</label>
                  <div style={{ position: "relative" }}>
                    <select
                      name="tipoSangre"
                      value={formData.tipoSangre}
                      onChange={handleChange}
                      className="fc-input"
                      style={{ appearance: "none", paddingRight: "36px" }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                    <ChevronDown
                      size={15}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748B",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Teléfono (full width) */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Teléfono / Celular</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Ej: +598 99 123 456"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="fc-input"
                  />
                </div>

                {/* Estado */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Estado del paciente</label>
                  <div style={{ position: "relative" }}>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="fc-input"
                      style={{ appearance: "none", paddingRight: "36px" }}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                    <ChevronDown
                      size={15}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748B",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Alergias */}
            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "15px",
                  fontWeight: "bold",
                  color: "#004D40",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Heart size={17} style={{ color: "#EF4444" }} />
                Alergias Registradas
              </h3>

              {/* Dropdown de selección */}
              <div style={{ position: "relative", marginBottom: "14px" }}>
                <button
                  type="button"
                  onClick={() => setMostrarDropdown(!mostrarDropdown)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "#FFFFFF",
                    border: "1px dashed #009688",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#009688",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>+ Seleccionar Alergias</span>
                  <ChevronDown
                    size={15}
                    style={{
                      transform: mostrarDropdown ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {mostrarDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "6px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 30,
                    }}
                  >
                    {alergiasDisponibles.length > 0 ? (
                      alergiasDisponibles.map((a) => (
                        <div
                          key={a.idAlergia}
                          onClick={() => handleSeleccionarAlergia(a)}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#1A252C",
                            borderBottom: "1px solid #F1F5F9",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#F8FAFC")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#FFFFFF")
                          }
                        >
                          {a.nombre}
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "14px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "#94A3B8",
                          fontStyle: "italic",
                        }}
                      >
                        Sin opciones restantes
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags de alergias seleccionadas */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  overflowY: "auto",
                  maxHeight: "240px",
                  flexGrow: 1,
                }}
              >
                {alergiasSeleccionadas.length === 0 ? (
                  <div
                    style={{
                      width: "100%",
                      padding: "28px 14px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#94A3B8",
                      border: "1px dashed #E2E8F0",
                      borderRadius: "12px",
                      backgroundColor: "#FFFFFF",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxSizing: "border-box",
                    }}
                  >
                    <Heart size={20} style={{ color: "#CBD5E1" }} />
                    <span>No hay alergias registradas</span>
                  </div>
                ) : (
                  alergiasSeleccionadas.map((a) => (
                    <span
                      key={a.idAlergia}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 10px",
                        backgroundColor: "#FEE2E2",
                        color: "#B91C1C",
                        fontSize: "12px",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1px solid #FCA5A5",
                      }}
                    >
                      {a.nombre}
                      <button
                        type="button"
                        onClick={() => handleRemoverAlergia(a.idAlergia)}
                        style={{
                          border: "none",
                          background: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: "#B91C1C",
                        }}
                        title="Remover"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Helper ──────────────────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: "bold",
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "6px",
};
