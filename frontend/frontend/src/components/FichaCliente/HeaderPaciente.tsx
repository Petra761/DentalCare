import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Download, Users, BarChart3 } from "lucide-react";

interface PatientHeaderProps {
  totalPacientes: number;
  onNuevoPacienteClick?: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  totalPacientes,
  onNuevoPacienteClick,
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="animate-fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}
    >
      {/* Tarjeta Izquierda: Mensaje y Acciones */}
      <div 
        className="fc-card"
        style={{
          gridColumn: 'span 2',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background silhouette/decoration */}
        <div 
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-20px',
            color: '#E2E8F0',
            opacity: 0.25,
            pointerEvents: 'none'
          }}
        >
          <Users size={160} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#004D40' }}>
            Listado Maestro
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B', maxWidth: '480px', lineHeight: '1.5' }}>
            Administre su base de datos de pacientes, consulte historias
            clínicas y programe citas desde un solo lugar.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={
              onNuevoPacienteClick || (() => navigate("/pacientes/nuevo"))
            }
            className="fc-btn-primary"
          >
            <UserPlus size={16} />
            Nuevo Paciente
          </button>
          
          <button
            type="button"
            className="fc-btn-outline"
          >
            <Download size={16} />
            Exportar Listado
          </button>
        </div>
      </div>

      {/* Tarjeta Derecha: Total de Pacientes */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #009688, #004D40)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 10px 15px -3px rgba(0, 77, 64, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            <BarChart3 size={20} />
          </div>
          <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
            +12% este mes
          </span>
        </div>

        <div style={{ marginTop: '24px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
            Total de Pacientes
          </p>
          <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', lineHeight: 1 }}>
            {totalPacientes.toLocaleString()}
          </h1>
        </div>
      </div>
    </div>
  );
};
