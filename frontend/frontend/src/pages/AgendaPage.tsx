import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AgendaHeader from "../components/Agenda/AgendaHeader";
import AgendaFilters from "../components/Agenda/AgendaFilters";
import CalendarGrid from "../components/Agenda/CalendarGrid";
import DailyTimeline from "../components/Agenda/DailyTimeline";
import AgendaStats from "../components/Agenda/AgendaStats";
import { useCitas } from "../hooks/useCitas";

const AgendaPage: React.FC = () => {
  const navigate = useNavigate();
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

  const citasFiltradasYOrdenadas = useMemo(() => {
    return citas
      .filter((cita) => {
        const cumpleFecha = cita.fecha?.startsWith(selectedDate);
        const cumpleNombre = cita.nombrePaciente
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        const cumpleServicio =
          filterServicio === "" ||
          cita.idServicio?.toString() === filterServicio;

        return cumpleFecha && cumpleNombre && cumpleServicio;
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citas, selectedDate, searchTerm, filterServicio]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-bold animate-pulse">
            Cargando agenda clínica...
          </p>
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#f8f9ff] print:p-0"
    >
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

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 print:hidden">
          <CalendarGrid
            citas={citas}
            viewDate={viewDate}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>
        <div className="col-span-12 xl:col-span-4 print:col-span-12 flex flex-col gap-8">
          <DailyTimeline
            citas={citasFiltradasYOrdenadas}
            selectedDate={selectedDate}
          />
          <div className="print:hidden">
            <AgendaStats stats={stats} />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/gestion-citas")}
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,150,136,0.5)] flex items-center justify-center z-[60] group print:hidden border-b-4 border-secondary"
      >
        <span className="material-symbols-outlined text-[32px] font-bold">
          add
        </span>
        <div className="absolute right-20 bg-on-surface text-white px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap text-sm font-bold shadow-xl translate-x-4 group-hover:translate-x-0">
          Nueva Cita
        </div>
      </motion.button>
    </motion.div>
  );
};

export default AgendaPage;
