import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, AlertTriangle, X, Loader2, CalendarPlus } from 'lucide-react';

export interface Paciente {
  idCliente: number;
  ci: number;
  nombreCompleto: string;
  telefono: string;
  estado: string;
}

interface PatientTableProps {
  pacientes: Paciente[];
  onVerFicha?: (id: number) => void;
  onNuevaCita?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => Promise<void>;
}

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const getAvatarStyle = (initials: string) => {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  const palettes = [
    { bg: '#E0F2F1', text: '#00796B' },
    { bg: '#E0F2FE', text: '#0369A1' },
    { bg: '#F1F5F9', text: '#475569' },
    { bg: '#DCFCE7', text: '#15803D' },
    { bg: '#FEE2E2', text: '#B91C1C' },
    { bg: '#FEF3C7', text: '#B45309' },
  ];
  return palettes[code % palettes.length];
};

const getEstadoBadgeClass = (estado: string) => {
  const est = (estado || '').toLowerCase().trim();
  switch (est) {
    case 'activo':
      return 'fc-badge-activo';
    case 'finalizado':
      return 'fc-badge-finalizado';
    case 'en clínica':
    case 'en clinica':
      return 'fc-badge-en-clinica';
    case 'urgencia':
      return 'fc-badge-urgencia';
    default:
      return 'fc-badge-finalizado';
  }
};

export const PatientTable: React.FC<PatientTableProps> = ({
  pacientes,
  onVerFicha,
  onEditar,
  onEliminar,
}) => {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleConfirmarEliminar = async (id: number) => {
    if (!onEliminar) return;
    setDeletingId(id);
    try {
      await onEliminar(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleNuevaCita = (idCliente: number) => {
    // Navega a GestionCitas pasando el id del paciente como query param
    navigate(`/gestion-citas?nuevaCita=true&clienteId=${idCliente}`);
  };

  return (
    <>
      {/* ── Modal de confirmación de eliminación ─────────────────────── */}
      {confirmId !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setConfirmId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            {/* Ícono de alerta */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={28} style={{ color: '#B91C1C' }} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#1A252C' }}>
                ¿Desactivar paciente?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                El paciente pasará a estado <strong>Inactivo</strong>. Esta acción puede deshacerse
                editando el registro.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                disabled={deletingId !== null}
                className="fc-btn-ghost"
                style={{ flex: 1 }}
              >
                <X size={15} />
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarEliminar(confirmId!)}
                disabled={deletingId !== null}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: deletingId !== null ? 'wait' : 'pointer',
                  opacity: deletingId !== null ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {deletingId !== null ? (
                  <Loader2 size={15} className="animate-spin-custom" />
                ) : (
                  <Trash2 size={15} />
                )}
                {deletingId !== null ? 'Eliminando...' : 'Sí, desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla de pacientes ────────────────────────────────────────── */}
      <div
        className="fc-card animate-fade-in"
        style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '16px', backgroundColor: '#FFFFFF' }}
      >
        <style>{`
          .fc-icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
            background-color: #FFFFFF;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          .fc-icon-btn-view:hover {
            background-color: #E0F2F1;
            border-color: #009688;
            color: #009688 !important;
          }
          .fc-icon-btn-edit:hover {
            background-color: #EFF6FF;
            border-color: #3B82F6;
            color: #3B82F6 !important;
          }
          .fc-icon-btn-delete:hover {
            background-color: #FEE2E2;
            border-color: #EF4444;
            color: #EF4444 !important;
          }
          .fc-icon-btn:active {
            transform: scale(0.92);
          }
          .fc-nueva-cita-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background-color: #E0F2F1;
            color: #00796B;
            font-weight: 700;
            font-size: 12px;
            padding: 5px 11px;
            border-radius: 8px;
            border: 1px solid #b2dfdb;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }
          .fc-nueva-cita-btn:hover {
            background-color: #009688;
            color: #FFFFFF;
            border-color: #009688;
          }
          .fc-nueva-cita-btn:active {
            transform: scale(0.96);
          }
        `}</style>

        <table className="fc-table">
          <thead>
            <tr>
              <th className="fc-th" style={{ borderTopLeftRadius: '16px' }}>CI / IDENTIFICACIÓN</th>
              <th className="fc-th">NOMBRE COMPLETO</th>
              <th className="fc-th">TELÉFONO</th>
              <th className="fc-th">ESTADO</th>
              <th className="fc-th" style={{ textAlign: 'right', borderTopRightRadius: '16px' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="fc-td" style={{ textAlign: 'center', color: '#94A3B8', fontStyle: 'italic', padding: '32px' }}>
                  No se encontraron pacientes.
                </td>
              </tr>
            ) : (
              pacientes.map((p) => {
                const initials = getInitials(p.nombreCompleto);
                const avatarStyle = getAvatarStyle(initials);
                const badgeClass = getEstadoBadgeClass(p.estado);
                return (
                  <tr key={p.idCliente} className="fc-tr">
                    {/* CI */}
                    <td className="fc-td" style={{ fontWeight: 500, color: '#64748B' }}>
                      {p.ci}
                    </td>

                    {/* Nombre Completo & Avatar */}
                    <td className="fc-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            backgroundColor: avatarStyle.bg,
                            color: avatarStyle.text,
                            flexShrink: 0,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#1A252C' }}>
                            {p.nombreCompleto}
                          </div>
                          {p.telefono && (
                            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }} className="sm-hidden-text">
                              {p.telefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="fc-td" style={{ color: '#64748B' }}>
                      {p.telefono || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin teléfono</span>}
                    </td>

                    {/* Estado */}
                    <td className="fc-td">
                      <span className={`fc-badge ${badgeClass}`}>
                        {p.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="fc-td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>

                        {/* Nueva Cita */}
                        <button
                          type="button"
                          onClick={() => handleNuevaCita(p.idCliente)}
                          className="fc-nueva-cita-btn"
                          title="Agendar nueva cita"
                        >
                          <CalendarPlus size={13} />
                          Nueva Cita
                        </button>

                        {/* Separador */}
                        <span style={{ color: '#E2E8F0', fontSize: '18px', userSelect: 'none', margin: '0 2px' }}>|</span>

                        {/* Ver Ficha (ícono ojo) */}
                        <button
                          type="button"
                          onClick={() => onVerFicha?.(p.idCliente)}
                          className="fc-icon-btn fc-icon-btn-view"
                          title="Ver ficha del paciente"
                          style={{ color: '#64748B' }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => onEditar?.(p.idCliente)}
                          className="fc-icon-btn fc-icon-btn-edit"
                          title="Editar paciente"
                          style={{ color: '#64748B' }}
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => setConfirmId(p.idCliente)}
                          className="fc-icon-btn fc-icon-btn-delete"
                          title="Desactivar paciente"
                          style={{ color: '#64748B' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};