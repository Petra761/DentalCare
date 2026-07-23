import React from "react";

interface Props {
  citas: any[];
  selectedDate: string;
  viewDate: Date;
  onDateSelect: (date: string) => void;
}

const CalendarGrid: React.FC<Props> = ({
  citas,
  selectedDate,
  viewDate,
  onDateSelect,
}) => {
  const daysHeader = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const todayStr = new Date().toISOString().split("T")[0];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant">
        {daysHeader.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-[10px] font-bold text-outline"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          if (day === null)
            return (
              <div
                key={`empty-${i}`}
                className="h-24 border-r border-b border-outline-variant bg-surface-container-low/20"
              />
            );

          const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          // Filtrar citas para este día
          const dayCitas = citas.filter(
            (c) => c.fecha && c.fecha.startsWith(dateStr),
          );

          return (
            <div
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`h-24 p-2 border-r border-b border-outline-variant cursor-pointer transition-all relative flex flex-col
                ${isSelected ? "bg-primary/10" : "bg-white hover:bg-surface-container-low"}`}
            >
              <span
                className={`text-xs font-bold z-20 w-7 h-7 flex items-center justify-center rounded-full transition-colors
                ${isSelected ? "bg-primary text-white shadow-md" : isToday ? "bg-secondary text-white shadow-sm" : "text-on-surface hover:bg-surface-container"}`}
              >
                {day}
              </span>

              {/* CONTENEDOR DE PUNTOS: Aseguramos visibilidad */}
              <div className="mt-auto mb-1 flex flex-wrap justify-center gap-1 z-20 min-h-[8px]">
                {dayCitas.length > 0 &&
                  dayCitas.map((_, idx) => (
                    <span
                      key={idx}
                      className="w-2 h-2 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: "#009688", opacity: 1 }} // Verde Primary sólido
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
