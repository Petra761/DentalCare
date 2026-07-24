import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface PatientSearchProps {
  busqueda: string;
  onSearchChange: (value: string) => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ busqueda, onSearchChange }) => {
  return (
    <div 
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '24px',
      }}
    >
      {/* Contenedor del Buscador */}
      <div style={{ position: 'relative', flex: 1 }}>
        <span 
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: '#94A3B8'
          }}
        >
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre, CI o teléfono..."
          value={busqueda}
          onChange={(e) => onSearchChange(e.target.value)}
          className="fc-input"
          style={{
            paddingLeft: '44px',
            paddingRight: '16px',
            paddingTop: '12px',
            paddingBottom: '12px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  );
};