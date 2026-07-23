import React from "react";
import { motion } from "framer-motion";

interface Props {
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const AgendaHeader: React.FC<Props> = ({
  viewDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const monthLabel = viewDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-[900] text-slate-800 tracking-tight mb-1">
          Calendario de Citas
        </h2>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="text-slate-400">Dashboard</span>
          <span className="text-slate-300 material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          <span className="text-primary">Agenda</span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-center">
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevMonth}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </motion.button>

          <span className="px-6 text-sm font-black text-slate-700 min-w-[160px] text-center capitalize tracking-tight">
            {monthLabel}
          </span>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNextMonth}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToday}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest"
        >
          Hoy
        </motion.button>
      </div>
    </div>
  );
};

export default AgendaHeader;
