import React from "react";
import AgendaHeader from "../components/Agenda/AgendaHeader";
import AgendaFilters from "../components/Agenda/AgendaFilters";
import CalendarGrid from "../components/Agenda/CalendarGrid";
import DailyTimeline from "../components/Agenda/DailyTimeline";
import AgendaStats from "../components/Agenda/AgendaStats";

const AgendaPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <AgendaHeader />
      <AgendaFilters />

      <div className="grid grid-cols-12 gap-6">
        {/* Columna Izquierda: Calendario */}
        <div className="col-span-8">
          <CalendarGrid />
        </div>

        {/* Columna Derecha: Agenda del día y Stats */}
        <div className="col-span-4 flex flex-col gap-6">
          <DailyTimeline />
          <AgendaStats />
        </div>
      </div>

      {/* FAB - Botón Flotante */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group">
        <span className="material-symbols-outlined text-[28px]">add</span>
        <div className="absolute right-16 bg-on-surface text-on-primary px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-xs font-bold shadow-lg">
          Nueva Cita
        </div>
      </button>
    </div>
  );
};

export default AgendaPage;
