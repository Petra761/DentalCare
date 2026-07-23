const AgendaHeader = () => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-2xl font-bold text-on-surface">Gestión de Agenda</h2>
      <nav className="flex text-xs text-outline mt-1 font-medium">
        <span className="hover:text-primary cursor-pointer">Dashboard</span>
        <span className="mx-2">›</span>
        <span className="text-primary font-bold">Agenda</span>
      </nav>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center bg-white border border-outline-variant rounded-lg p-1">
        <button className="p-1 hover:bg-surface-container rounded transition-all">
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
        <span className="px-4 text-sm font-bold min-w-[120px] text-center">
          Octubre 2023
        </span>
        <button className="p-1 hover:bg-surface-container rounded transition-all">
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
        <button className="ml-2 px-3 py-1 bg-surface-container text-on-surface text-[11px] font-bold rounded">
          HOY
        </button>
      </div>
      <div className="flex bg-white border border-outline-variant rounded-lg p-1">
        <button className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold shadow-sm">
          Mes
        </button>
        <button className="px-4 py-1.5 text-on-surface-variant hover:text-primary text-xs font-bold">
          Semana
        </button>
        <button className="px-4 py-1.5 text-on-surface-variant hover:text-primary text-xs font-bold">
          Día
        </button>
      </div>
    </div>
  </div>
);

export default AgendaHeader;
