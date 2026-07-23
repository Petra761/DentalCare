import React from 'react';

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
    { bg: '#E0F2F1', text: '#00796B' }, // Teal
    { bg: '#E0F2FE', text: '#0369A1' }, // Blue
    { bg: '#F1F5F9', text: '#475569' }, // Gray
    { bg: '#DCFCE7', text: '#15803D' }, // Green
    { bg: '#FEE2E2', text: '#B91C1C' }, // Red
    { bg: '#FEF3C7', text: '#B45309' }, // Yellow/Orange
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
      return '';
  }
};

export const PatientTable: React.FC<PatientTableProps> = ({ pacientes, onVerFicha, onNuevaCita }) => {
  return (
    <div 
      className="fc-card animate-fade-in"
      style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '16px', backgroundColor: '#FFFFFF' }}
    >
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
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => onVerFicha?.(p.idCliente)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#009688',
                          fontWeight: 600,
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        className="fc-link-btn"
                      >
                        Ver Ficha
                      </button>
                      <button
                        type="button"
                        onClick={() => onNuevaCita?.(p.idCliente)}
                        style={{
                          backgroundColor: '#E0F2F1',
                          color: '#00796B',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        className="fc-btn-action"
                      >
                        Nueva Cita
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
  );
};
