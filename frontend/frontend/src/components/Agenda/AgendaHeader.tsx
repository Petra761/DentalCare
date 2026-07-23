import React from "react";

interface Props {
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const AgendaHeader: React.FC<Props> = ({ viewDate, onPrevMonth, onNextMonth, onToday }) => {
  const monthLabel = viewDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
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
          <button onClick={onPrevMonth} className="p-1 hover:bg-surface-container rounded transition-all">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="px-4 text-sm font-bold min-w-[140px] text-center capitalize">
            {monthLabel}
          </span>
          <button onClick={onNextMonth} className="p-1 hover:bg-surface-container rounded transition-all">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <button onClick={onToday} className="ml-2 px-3 py-1 bg-surface-container text-on-surface text-[11px] font-bold rounded">
            HOY
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgendaHeader;