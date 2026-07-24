import React, { useEffect, useState } from "react";
import {
  getPacientes,
  getEstadisticasPacientes,
  eliminarCliente,
} from "../../services/FichaCliente/pacienteServices";
import { PatientHeader } from "../../components/FichaCliente/HeaderPaciente";
import { PatientSearch } from "../../components/FichaCliente/BuscarPaciente";
import {
  PatientTable,
  type Paciente,
} from "../../components/FichaCliente/ListaCliente";
import { RegistrarPacienteForm } from "../../components/FichaCliente/RegistrarPacienteFrom";
import { VerHistorialPaciente } from "../../components/FichaCliente/VerHistorialPaciente";
import { EditarPacienteModal } from "../../components/FichaCliente/EditarPacienteModal";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface ResponsePaginada {
  totalPacientes: number;
  paginaActual: number;
  paginasTotales: number;
  pacientes: Paciente[];
}

export const PacientesListPage = () => {
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [data, setData] = useState<ResponsePaginada>({
    totalPacientes: 0,
    paginaActual: 1,
    paginasTotales: 1,
    pacientes: [],
  });

  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"lista" | "nuevo" | "ficha">(
    "lista",
  );

  // Usamos el tipo Paciente de ListaCliente para evitar incompatibilidad de interfaces
  const [pacienteSeleccionado, setPacienteSeleccionado] =
    useState<Paciente | null>(null);

  // ID del paciente que se está editando (null = modal cerrado)
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const fetchEstadisticas = async () => {
    try {
      const res = await getEstadisticasPacientes();
      setTotalPacientes(res.totalPacientes);
    } catch (err: any) {
      console.error("Error al obtener estadísticas:", err);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPacientes(pagina, 5, busqueda);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Error al cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "lista") {
      fetchData();
    }
  }, [pagina, busqueda, activeTab]);

  const handleSearch = (text: string) => {
    setBusqueda(text);
    setPagina(1);
  };

  const handleSuccessGuardar = () => {
    fetchEstadisticas();
    setActiveTab("lista");
  };

  // Ver ficha: busca el paciente en la lista actual
  const handleVerFichaPorId = (id: number) => {
    const pacienteEncontrado = data.pacientes.find((p) => p.idCliente === id);
    if (pacienteEncontrado) {
      setPacienteSeleccionado(pacienteEncontrado);
      setActiveTab("ficha");
    } else {
      console.warn("No se encontró el paciente con ID:", id);
    }
  };

  // Editar: abre el modal con los datos recargados del API
  const handleEditarPaciente = (id: number) => {
    setEditandoId(id);
  };

  // Callback al guardar exitosamente la edición
  const handleSuccessEditar = () => {
    setEditandoId(null);
    fetchData();          // Recarga la lista sin recargar la página
    fetchEstadisticas();
  };

  // Eliminar (soft-delete): actualiza la lista de forma optimista
  const handleEliminarPaciente = async (id: number) => {
    await eliminarCliente(id);
    // Actualización optimista: cambiar estado a "Inactivo" en la lista local
    setData((prev) => ({
      ...prev,
      pacientes: prev.pacientes.map((p) =>
        p.idCliente === id ? { ...p, estado: "Inactivo" } : p,
      ),
    }));
    fetchEstadisticas();
  };

  return (
    <div style={{ backgroundColor: '#F5F9FC', minHeight: '100vh', padding: '32px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Estilos inyectados para soportar toda la UI premium sin Tailwind CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-custom {
          animation: spin 1s linear infinite;
        }
        
        /* Estilos de Componentes */
        .fc-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .fc-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);
        }
        
        .fc-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          font-size: 14px;
          color: #1A252C;
          background-color: #FFFFFF;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .fc-input:focus {
          border-color: #009688;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.15);
        }
        
        .fc-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #009688;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-btn-primary:hover {
          background-color: #00796B;
        }
        .fc-btn-primary:active {
          transform: scale(0.97);
        }
        
        .fc-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #FFFFFF;
          color: #009688;
          border: 1px solid #009688;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-btn-outline:hover {
          background-color: #F8FAFC;
        }
        .fc-btn-outline:active {
          transform: scale(0.97);
        }
        
        .fc-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #FFFFFF;
          color: #64748B;
          border: 1px solid #E2E8F0;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-btn-ghost:hover {
          background-color: #F8FAFC;
          color: #009688;
          border-color: #009688;
        }
        
        .fc-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .fc-th {
          background-color: #F8FAFC;
          padding: 16px 24px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748B;
          border-bottom: 1px solid #E2E8F0;
          letter-spacing: 0.05em;
        }
        .fc-td {
          padding: 16px 24px;
          font-size: 14px;
          color: #1A252C;
          border-bottom: 1px solid #E2E8F0;
        }
        .fc-tr {
          transition: background-color 0.15s ease;
        }
        .fc-tr:hover {
          background-color: rgba(248, 250, 252, 0.6);
        }
        
        .fc-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .fc-badge-activo {
          background-color: #DCFCE7;
          color: #15803D;
          border: 1px solid #bbf7d0;
        }
        .fc-badge-finalizado {
          background-color: #F1F5F9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .fc-badge-en-clinica {
          background-color: #E0F2F1;
          color: #00796B;
          border: 1px solid #b2dfdb;
        }
        .fc-badge-urgencia {
          background-color: #FEE2E2;
          color: #B91C1C;
          border: 1px solid #fecaca;
        }
        
        .fc-link-btn:hover {
          text-decoration: underline;
        }
        .fc-btn-action:hover {
          background-color: #00796B !important;
          color: #FFFFFF !important;
        }
        
        @media (max-width: 640px) {
          .sm-hidden-text {
            display: block !important;
          }
        }
      `}</style>

      {/* ── Modal de Edición (se superpone a todo) ── */}
      {editandoId !== null && (
        <EditarPacienteModal
          idCliente={editandoId}
          onCancelar={() => setEditandoId(null)}
          onSuccess={handleSuccessEditar}
        />
      )}

      {/* VISTA 1: LISTA MAESTRA */}
      {activeTab === "lista" && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PatientHeader
            totalPacientes={totalPacientes}
            onNuevoPacienteClick={() => setActiveTab("nuevo")}
          />

          <PatientSearch busqueda={busqueda} onSearchChange={handleSearch} />

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '80px 0', color: '#64748B', width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin-custom" size={32} style={{ color: '#009688' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Cargando pacientes...</span>
            </div>
          )}
          
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '16px', fontSize: '14px', fontWeight: 500 }} className="animate-fade-in">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <PatientTable
                pacientes={data.pacientes}
                onVerFicha={handleVerFichaPorId}
                onEditar={handleEditarPaciente}
                onEliminar={handleEliminarPaciente}
              />

              {/* Paginación Responsiva */}
              <div 
                className="fc-card animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                  Mostrando <span style={{ fontWeight: 'bold', color: '#1A252C' }}>{data.pacientes.length > 0 ? ((pagina - 1) * 5) + 1 : 0}</span>-
                  <span style={{ fontWeight: 'bold', color: '#1A252C' }}>{Math.min(pagina * 5, data.totalPacientes)}</span> de{" "}
                  <span style={{ fontWeight: 'bold', color: '#1A252C' }}>{data.totalPacientes}</span> pacientes
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    disabled={pagina <= 1}
                    onClick={() => setPagina((prev) => prev - 1)}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      cursor: pagina <= 1 ? 'not-allowed' : 'pointer',
                      opacity: pagina <= 1 ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Anterior"
                  >
                    <ChevronLeft size={16} style={{ color: '#64748B' }} />
                  </button>
                  
                  {Array.from({ length: data.paginasTotales }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.paginasTotales || Math.abs(p - pagina) <= 1)
                    .map((p, idx, arr) => {
                      const isPrevElipsis = idx > 0 && arr[idx - 1] !== p - 1;
                      return (
                        <React.Fragment key={p}>
                          {isPrevElipsis && <span style={{ padding: '0 8px', color: '#94A3B8' }}>...</span>}
                          <button
                            onClick={() => setPagina(p)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              border: p === pagina ? 'none' : '1px solid #E2E8F0',
                              backgroundColor: p === pagina ? '#009688' : '#FFFFFF',
                              color: p === pagina ? '#FFFFFF' : '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    disabled={pagina >= data.paginasTotales}
                    onClick={() => setPagina((prev) => prev + 1)}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      cursor: pagina >= data.paginasTotales ? 'not-allowed' : 'pointer',
                      opacity: pagina >= data.paginasTotales ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Siguiente"
                  >
                    <ChevronRight size={16} style={{ color: '#64748B' }} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: NUEVO REGISTRO */}
      {activeTab === "nuevo" && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <RegistrarPacienteForm
            onCancelar={() => setActiveTab("lista")}
            onSuccess={handleSuccessGuardar}
          />
        </div>
      )}

      {/* VISTA 3: FICHA DE PACIENTE */}
      {activeTab === "ficha" && pacienteSeleccionado && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <VerHistorialPaciente
            paciente={pacienteSeleccionado as any}
            onVolver={() => {
              setActiveTab("lista");
              setPacienteSeleccionado(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PacientesListPage;


