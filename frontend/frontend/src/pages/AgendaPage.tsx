import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importante para la redirección

import AgendaHeader from "../components/Agenda/AgendaHeader";
import AgendaFilters from "../components/Agenda/AgendaFilters";
import CalendarGrid from "../components/Agenda/CalendarGrid";
import DailyTimeline from "../components/Agenda/DailyTimeline";
import AgendaStats from "../components/Agenda/AgendaStats";
import { useCitas } from "../hooks/useCitas";

// ... tus otros imports (AgendaHeader, AgendaFilters, etc)

const AgendaPage: React.FC = () => {
  const navigate = useNavigate(); // Hook para navegar
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServicio, setFilterServicio] = useState("");

  const { citas, servicios, stats, loading } = useCitas(selectedDate);

  const changeMonth = (offset: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1,
    );
    setViewDate(newDate);
    setSelectedDate(newDate.toISOString().split("T")[0]);
  };

  const citasFiltradasYOrdenadas = citas
    .filter((cita) => {
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
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-primary font-bold">
        Cargando agenda...
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background print:p-0">
      <AgendaHeader
        viewDate={viewDate}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
        onToday={() => {
          const now = new Date();
          setViewDate(now);
          setSelectedDate(now.toISOString().split("T")[0]);
        }}
      />

      <div className="print:hidden">
        <AgendaFilters
          servicios={servicios}
          onSearchChange={setSearchTerm}
          onTratamientoChange={setFilterServicio}
          onClear={() => {
            setSearchTerm("");
            setFilterServicio("");
          }}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 print:hidden">
          <CalendarGrid
            citas={citas}
            viewDate={viewDate}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>
        <div className="col-span-4 max-lg:col-span-12 print:col-span-12 flex flex-col gap-6">
          <DailyTimeline
            citas={citasFiltradasYOrdenadas}
            selectedDate={selectedDate}
          />
          <div className="print:hidden">
            <AgendaStats stats={stats} />
          </div>
        </div>
      </div>

      {/* BOTÓN FLOTANTE (FAB) CORREGIDO */}
      <button
        onClick={() => navigate("/gestion-citas")} // Redirección HU-AGE-02
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#009688] text-white rounded-full shadow-[0_8px_30px_rgb(0,150,136,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group print:hidden border-2 border-white/20"
      >
        <span className="material-symbols-outlined text-[32px] font-bold">
          add
        </span>
        <div className="absolute right-20 bg-on-surface text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-sm font-bold shadow-xl">
          Nueva Cita
        </div>
      </button>
    </div>
  );
};

export default AgendaPage;
