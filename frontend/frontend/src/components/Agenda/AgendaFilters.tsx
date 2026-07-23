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
  <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-5 mb-8 flex flex-wrap lg:flex-nowrap items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
    <div className="flex-1 relative group min-w-[250px]">
      <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
        <span className="material-symbols-outlined text-[20px]">search</span>
      </span>
      <input
        type="text"
        placeholder="Buscar por nombre del paciente..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-5 py-3.5 text-sm bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300"
      />
    </div>

    <div className="flex-1 relative group min-w-[200px]">
      <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
        <span className="material-symbols-outlined text-[20px]">category</span>
      </span>
      <select
        onChange={(e) => onTratamientoChange(e.target.value)}
        className="w-full pl-12 pr-10 py-3.5 text-sm bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer font-medium text-slate-600"
      >
        <option value="">Especialidad / Tratamiento</option>
        {servicios.map((s) => (
          <option key={s.idServicio} value={s.idServicio}>
            {s.nombre}
          </option>
        ))}
      </select>
      <span className="absolute inset-y-0 right-4 flex items-center text-slate-300 pointer-events-none">
        <span className="material-symbols-outlined">expand_more</span>
      </span>
    </div>

    <button
      onClick={onClear}
      className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs px-5 py-3.5 rounded-xl transition-all hover:bg-red-50"
    >
      <span className="material-symbols-outlined text-[18px]">
        filter_alt_off
      </span>
      Limpiar
    </button>
  </div>
);

export default AgendaFilters;
