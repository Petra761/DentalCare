import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  citas: any[];
  selectedDate: string;
}

const DailyTimeline: React.FC<Props> = ({ citas, selectedDate }) => {
  const dateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-outline-variant rounded-3xl p-8 flex-1 shadow-sm min-h-[500px] flex flex-col agenda-container relative overflow-hidden">
      <div className="hidden print:block mb-8 border-b-2 border-primary pb-4">
        <h1 className="text-2xl font-black text-primary uppercase">
          Reporte de Agenda Diaria
        </h1>
        <p className="text-sm text-outline font-bold">Clínica DentalCare</p>
      </div>

      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/[0.03] rounded-full pointer-events-none print:hidden" />

      <div className="mb-8 flex justify-between items-center relative z-10">
        <div>
          <p className="text-[11px] uppercase font-black text-primary tracking-[0.2em] mb-2 opacity-70">
            Agenda Diaria
          </p>
          <h3 className="text-2xl font-black text-on-surface capitalize leading-tight">
            {formattedDate}
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.print()}
          className="print:hidden w-12 h-12 flex items-center justify-center bg-surface-container text-outline hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm border border-outline-variant"
        >
          <span className="material-symbols-outlined text-[22px]">print</span>
        </motion.button>
      </div>

      <div className="space-y-6 relative flex-1 z-10">
        <AnimatePresence mode="popLayout">
          {citas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-outline/30 text-5xl">
                  event_busy
                </span>
              </div>
              <p className="text-lg font-bold text-on-surface">Sin citas</p>
              <p className="text-sm text-outline max-w-[200px]">
                No hay atenciones programadas para este día.
              </p>
            </motion.div>
          ) : (
            citas.map((cita, index) => (
              <motion.div
                key={cita.idCita}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative pl-6 border-l-2 border-outline-variant hover:border-primary transition-all"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white bg-outline-variant group-hover:bg-primary transition-all print:hidden" />

                <div className="bg-white p-5 rounded-2xl border border-outline-variant shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 print:shadow-none print:border-b print:rounded-none">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-primary bg-primary/5 px-3 py-1 rounded-lg tracking-wider">
                      {cita.hora}
                    </span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-tighter border border-outline-variant px-2 py-0.5 rounded-md print:border-primary print:text-primary">
                      {cita.estadoCita}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-on-surface mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">
                    {cita.nombrePaciente}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-outline font-medium italic">
                    <span className="material-symbols-outlined text-[16px] text-primary/60">
                      dentistry
                    </span>
                    <span className="font-bold text-on-surface/70">
                      Tratamiento:
                    </span>{" "}
                    {cita.nombreServicio}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="hidden print:block mt-auto pt-8 text-[10px] text-outline text-center border-t border-outline-variant uppercase tracking-widest font-bold">
        Documento Oficial - Clínica DentalCare - Generado el{" "}
        {new Date().toLocaleDateString()}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .agenda-container, .agenda-container * { visibility: visible; }
          .agenda-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            border: none !important; 
            box-shadow: none !important; 
            background: white !important;
          }
          .print\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default DailyTimeline;
