import React from "react";
import { type Cita } from "../../types/AgendaPage";
interface Props {
  citas: Cita[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const CalendarGrid: React.FC<Props> = ({
  citas,
  selectedDate,
  onDateSelect,
}) => {
  const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  // Usamos el mes de la fecha seleccionada para construir el calendario
  // Si selectedDate es "2026-07-24", extraeremos "2026-07"
  const yearMonth = selectedDate.substring(0, 7);

  return (
    <div className="bg-white border border-outline-variant rounded-lg overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant">
        {days.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-[10px] font-bold text-outline"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {[...Array(31)].map((_, i) => {
          const dayNum = i + 1;
          const dayDate = `${yearMonth}-${dayNum.toString().padStart(2, "0")}`;

          // COMPARACIÓN ROBUSTA:
          // Usamos .startsWith() por si la fecha de la API viene como "2026-07-24T00:00:00"
          const dayCitas = citas.filter(
            (c) => c.fecha && c.fecha.startsWith(dayDate),
          );

          const isSelected = selectedDate === dayDate;

          return (
            <div
              key={i}
              onClick={() => onDateSelect(dayDate)}
              className={`
                h-24 p-2 border-r border-b border-outline-variant cursor-pointer transition-all relative flex flex-col
                ${isSelected ? "bg-primary/5" : "bg-white hover:bg-surface-container-low"}
              `}
            >
              {/* Indicador de Selección (Borde Interno) */}
              {isSelected && (
                <div className="absolute inset-0 border-2 border-primary pointer-events-none z-10" />
              )}

              <span
                className={`text-xs font-bold z-20 ${isSelected ? "text-primary" : "text-on-surface"}`}
              >
                {dayNum}
              </span>

              {/* CONTENEDOR DE PUNTOS CORREGIDO */}
              <div className="mt-auto mb-1 flex flex-wrap justify-center gap-1 z-20">
                {dayCitas.map((cita, idx) => (
                  <span
                    key={cita.idCita || idx}
                    className="w-2 h-2 rounded-full border border-white shadow-sm"
                    style={{
                      backgroundColor: "#009688", // Forzamos el color Primary de tu config
                      display: "block",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
