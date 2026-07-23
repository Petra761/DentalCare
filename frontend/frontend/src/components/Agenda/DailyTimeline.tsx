import React from "react";

interface Props {
  citas: any[]; // Idealmente usa una Interface CitaEnriquecida
  selectedDate: string;
}

const DailyTimeline: React.FC<Props> = ({ citas, selectedDate }) => {
  // Formatear fecha: "Domingo, 5 de Julio"
  const dateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="bg-[#f0f9fa] border border-primary/10 rounded-xl p-6 flex-1 shadow-sm min-h-[400px]">
      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">
          AGENDA DEL DÍA
        </p>
        <h3 className="text-xl font-bold text-secondary capitalize">
          {formattedDate}
        </h3>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-[7px] top-4 bottom-4 w-px bg-primary/20 border-l border-dashed border-primary/40"></div>

        {citas.length === 0 ? (
          <p className="text-sm text-outline pl-8">
            No hay citas para este día.
          </p>
        ) : (
          citas.map((cita) => (
            <div key={cita.idCita} className="relative pl-8">
              <div className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2 border-white bg-primary"></div>
              <div className="bg-white p-4 rounded-lg border border-outline-variant shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-primary">
                    {cita.hora}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase">
                    {cita.estadoCita}
                  </span>
                </div>
                {/* CAMBIO: Ahora usamos nombrePaciente */}
                <p className="font-bold text-sm text-on-surface">
                  {cita.nombrePaciente}
                </p>

                <p className="text-[11px] text-outline flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">
                    dentistry
                  </span>
                  {/* CAMBIO: Ahora usamos nombreServicio */}
                  {cita.nombreServicio}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default DailyTimeline;
