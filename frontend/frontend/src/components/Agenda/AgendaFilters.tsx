const AgendaFilters = () => (
  <div className="bg-white border border-outline-variant rounded-lg p-4 mb-6 flex items-center gap-4">
    <div className="flex-1 relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-outline">
        <span className="material-symbols-outlined text-[18px]">person</span>
      </span>
      <input
        type="text"
        placeholder="Paciente"
        className="w-full pl-9 pr-4 py-2 text-sm border-outline-variant rounded-lg focus:ring-primary focus:border-primary"
      />
    </div>
    <div className="flex-1 relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-outline">
        <span className="material-symbols-outlined text-[18px]">
          medical_services
        </span>
      </span>
      <select className="w-full pl-9 pr-4 py-2 text-sm border-outline-variant rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white">
        <option>Tratamiento</option>
        <option>Limpieza</option>
        <option>Ortodoncia</option>
        <option>Endodoncia</option>
      </select>
    </div>
    <button className="flex items-center gap-1 text-error text-xs font-bold hover:underline px-2 transition-all">
      <span className="material-symbols-outlined text-[16px]">close</span>
      Limpiar Filtros
    </button>
  </div>
);

export default AgendaFilters;
