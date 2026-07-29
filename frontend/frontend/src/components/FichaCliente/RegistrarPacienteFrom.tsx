import React, { useState, useEffect } from "react";
import {
  crearCliente,
  obtenerAlergias,
  type Alergia,
} from "../../services/FichaCliente/pacienteServices";
import { Save, X, User, Heart, ChevronDown } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

interface Props {
  onCancelar: () => void;
  onSuccess: () => void;
}

export const RegistrarPacienteForm: React.FC<Props> = ({
  onCancelar,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();

  // Estados de datos
  const [formData, setFormData] = useState({
    ci: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    tipoSangre: "",
    telefono: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({
    ci: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
  });

  const [alergiasCatalogo, setAlergiasCatalogo] = useState<Alergia[]>([]);
  const [alergiasSeleccionadas, setAlergiasSeleccionadas] = useState<Alergia[]>(
    [],
  );
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerAlergias()
      .then((data) => setAlergiasCatalogo(data))
      .catch((err) => console.error(err));
  }, []);

  const validarCampo = (name: string, value: string): string => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    const onlyDigits = /^\d*$/;

    if (name === "ci") {
      if (value.trim() === "") {
        return "El CI es requerido.";
      }
      if (!onlyDigits.test(value)) {
        return "El CI debe contener únicamente números.";
      }
    }

    if (name === "nombre") {
      if (value.trim() === "") {
        return "El nombre es requerido.";
      }
      if (!nameRegex.test(value)) {
        return "El nombre debe contener únicamente letras y espacios.";
      }
    }

    if (name === "apellidoPaterno") {
      if (value.trim() === "") {
        return "El apellido paterno es requerido.";
      }
      if (!nameRegex.test(value)) {
        return "El apellido paterno debe contener únicamente letras y espacios.";
      }
    }

    if (name === "apellidoMaterno") {
      if (value.trim() !== "" && !nameRegex.test(value)) {
        return "El apellido materno debe contener únicamente letras y espacios.";
      }
    }

    if (name === "telefono") {
      if (value.trim() !== "") {
        if (!onlyDigits.test(value)) {
          return "El teléfono debe contener únicamente números.";
        }
        if (!/^[67]/.test(value)) {
          return "El teléfono debe empezar con 6 o 7.";
        }
        if (value.length !== 8) {
          return "El teléfono debe tener exactamente 8 dígitos.";
        }
      }
    }

    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const errorMsg = validarCampo(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
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

    const nuevosErrores = {
      ci: validarCampo("ci", formData.ci),
      nombre: validarCampo("nombre", formData.nombre),
      apellidoPaterno: validarCampo("apellidoPaterno", formData.apellidoPaterno),
      apellidoMaterno: validarCampo("apellidoMaterno", formData.apellidoMaterno),
      telefono: validarCampo("telefono", formData.telefono),
    };

    setErrors(nuevosErrores);

    if (Object.values(nuevosErrores).some((err) => err !== "")) {
      showError("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        estado: "Activo",
        alergiaClientes: alergiasSeleccionadas.map((a) => ({
          idAlergia: a.idAlergia,
        })),
      };

      await crearCliente(payload);
      showSuccess("Paciente registrado correctamente.");
      showSuccess("Ficha clínica registrada correctamente.");
      onSuccess();
    } catch (error) {
      showError("Error al guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  const alergiasDisponibles = alergiasCatalogo.filter(
    (a) => !alergiasSeleccionadas.some((s) => s.idAlergia === a.idAlergia),
  );

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
    >
      <style>{`
        .fc-form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .fc-form-grid {
            grid-template-columns: 1fr;
          }
        }
        .fc-personal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .fc-personal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Cabecera / Breadcrumb */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', display: 'block', marginBottom: '4px' }}>
            Pacientes &gt; Registro de Ficha
          </span>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1A252C', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User className="text-[#009688]" size={24} />
            Ficha del Paciente
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancelar}
            className="fc-btn-ghost"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="fc-btn-primary"
          >
            <Save size={16} />
            {loading ? "Guardando..." : "Guardar Registro"}
          </button>
        </div>
      </div>

      {/* Formulario 2 Columnas estilo la imagen */}
      <div className="fc-form-grid">
        {/* Datos Personales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#004D40', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} />
              Información Personal
            </h3>

            <div className="fc-personal-grid">
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>CI / Documento</label>
                <input
                  type="text"
                  name="ci"
                  placeholder="Ej: 1234567"
                  value={formData.ci}
                  onChange={handleChange}
                  required
                  className="fc-input"
                />
                {errors.ci && <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.ci}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del paciente"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="fc-input"
                />
                {errors.nombre && <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.nombre}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Apellido Paterno</label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  placeholder="Apellido paterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                  className="fc-input"
                />
                {errors.apellidoPaterno && <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.apellidoPaterno}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Apellido Materno</label>
                <input
                  type="text"
                  name="apellidoMaterno"
                  placeholder="Apellido materno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  className="fc-input"
                />
                {errors.apellidoMaterno && <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.apellidoMaterno}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Fecha Nacimiento
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                  className="fc-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Tipo de Sangre
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="tipoSangre"
                    value={formData.tipoSangre}
                    onChange={handleChange}
                    className="fc-input"
                    style={{ appearance: 'none', paddingRight: '36px' }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="O+">O+ (O Positivo)</option>
                    <option value="O-">O- (O Negativo)</option>
                    <option value="A+">A+ (A Positivo)</option>
                    <option value="A-">A- (A Negativo)</option>
                    <option value="B+">B+ (B Positivo)</option>
                    <option value="B-">B- (B Negativo)</option>
                    <option value="AB+">AB+ (AB Positivo)</option>
                    <option value="AB-">AB-(AB Negativo)</option>
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Teléfono / Celular</label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Ej: 71234567"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="fc-input"
                />
                {errors.telefono && <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.telefono}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Alergias */}
        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#004D40', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart className="text-red-500" size={18} />
            Alergias Registradas
          </h3>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px dashed #009688',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#009688',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>+ Seleccionar Alergias</span>
              <ChevronDown size={16} />
            </button>

            {mostrarDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  zIndex: 20
                }}
              >
                {alergiasDisponibles.length > 0 ? (
                  alergiasDisponibles.map((a) => (
                    <div
                      key={a.idAlergia}
                      onClick={() => handleSeleccionarAlergia(a)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#1A252C',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <span>{a.nombre}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                    Sin opciones restantes
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', overflowY: 'auto', maxHeight: '240px', flexGrow: 1 }}>
            {alergiasSeleccionadas.length === 0 ? (
              <div style={{ width: '100%', padding: '32px 16px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', border: '1px dashed #E2E8F0', borderRadius: '12px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}>
                <Heart size={20} style={{ color: '#CBD5E1' }} />
                <span>No se han seleccionado alergias</span>
              </div>
            ) : (
              alergiasSeleccionadas.map((a) => (
                <span
                  key={a.idAlergia}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '1px solid #FCA5A5'
                  }}
                >
                  {a.nombre}
                  <button
                    type="button"
                    onClick={() => handleRemoverAlergia(a.idAlergia)}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#B91C1C'
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
    </div>
  );
};


