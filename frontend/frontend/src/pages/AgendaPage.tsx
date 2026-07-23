import React, { useState } from "react";
import AgendaHeader from "../components/Agenda/AgendaHeader";
import AgendaFilters from "../components/Agenda/AgendaFilters";
import CalendarGrid from "../components/Agenda/CalendarGrid";
import DailyTimeline from "../components/Agenda/DailyTimeline";
import AgendaStats from "../components/Agenda/AgendaStats";
import { useCitas } from "../hooks/useCitas";

const AgendaPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServicio, setFilterServicio] = useState("");

  const { citas, servicios, stats, loading } = useCitas(selectedDate);

  // LÓGICA DE FILTRADO LOCAL
  const citasFiltradas = citas.filter((cita) => {
    const cumpleFecha = cita.fecha?.startsWith(selectedDate);
    const cumpleNombre = cita.nombrePaciente
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const cumpleServicio =
      filterServicio === "" ||
      cita.detalleCitas.some(
        (d: any) => d.idServicio.toString() === filterServicio,
      );

    return cumpleFecha && cumpleNombre && cumpleServicio;
  });

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-primary font-bold">
        Cargando agenda...
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <AgendaHeader />

      <AgendaFilters
        servicios={servicios}
        onSearchChange={setSearchTerm}
        onTratamientoChange={setFilterServicio}
        onClear={() => {
          setSearchTerm("");
          setFilterServicio("");
        }}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <CalendarGrid
            citas={citas}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>
        <div className="col-span-4 flex flex-col gap-6">
          <DailyTimeline citas={citasFiltradas} selectedDate={selectedDate} />
          <AgendaStats stats={stats} />
        </div>
      </div>

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
