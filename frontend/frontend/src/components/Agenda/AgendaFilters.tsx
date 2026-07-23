import { type Servicio } from "../../types/AgendaPage";

import React from "react";

interface Props {
  servicios: any[];
  onSearchChange: (val: string) => void;
  onTratamientoChange: (val: string) => void;
  onClear: () => void;
}

const AgendaFilters: React.FC<Props> = ({
  servicios,
  onSearchChange,
  onTratamientoChange,
  onClear,
}) => (
  <div className="bg-white border border-outline-variant rounded-xl p-4 mb-6 flex items-center gap-4 shadow-sm">
    {/* Filtro Paciente */}
    <div className="flex-[2] relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
        <span className="material-symbols-outlined text-[20px]">person</span>
      </span>
      <input
        type="text"
        placeholder="Buscar paciente..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 text-sm bg-surface-container-low border border-transparent rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
      />
    </div>

    {/* Filtro Tratamiento */}
    <div className="flex-[2] relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
        <span className="material-symbols-outlined text-[20px]">
          medical_services
        </span>
      </span>
      <select
        onChange={(e) => onTratamientoChange(e.target.value)}
        className="w-full pl-11 pr-10 py-2.5 text-sm bg-surface-container-low border border-transparent rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer"
      >
        <option value="">Todos los Tratamientos</option>
        {servicios.map((s) => (
          <option key={s.idServicio} value={s.idServicio}>
            {s.nombre}
          </option>
        ))}
      </select>
      <span className="absolute inset-y-0 right-3 flex items-center text-outline pointer-events-none">
        <span className="material-symbols-outlined text-[18px]">
          expand_more
        </span>
      </span>
    </div>

    {/* Botón Limpiar */}
    <button
      onClick={onClear}
      className="flex items-center gap-2 text-error text-xs font-bold hover:bg-error/5 px-4 py-2.5 rounded-lg transition-all border border-transparent hover:border-error/20"
    >
      <span className="material-symbols-outlined text-[18px]">close</span>
      Limpiar Filtros
    </button>
  </div>
);

export default AgendaFilters;
