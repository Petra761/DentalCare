import React from "react";
import { motion } from "framer-motion";

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
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
        {daysHeader.map((d) => (
          <div
            key={d}
            className="py-4 text-center text-[11px] font-extrabold text-slate-400 tracking-widest"
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
                className="h-28 border-r border-b border-slate-50 bg-slate-50/20"
              />
            );

          const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const dayCitas = citas.filter(
            (c) => c.fecha && c.fecha.startsWith(dateStr),
          );

          return (
            <motion.div
              key={dateStr}
              whileHover={{ backgroundColor: "#fcfdff" }}
              onClick={() => onDateSelect(dateStr)}
              className={`h-28 p-3 border-r border-b border-slate-100 cursor-pointer transition-all relative flex flex-col group
                ${isSelected ? "bg-primary/[0.03]" : "bg-white"}`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all
                  ${
                    isSelected
                      ? "bg-[#009688] text-white shadow-lg shadow-primary/30 rotate-3"
                      : isToday
                        ? "bg-amber-100 text-amber-700"
                        : "text-slate-600 group-hover:text-primary"
                  }`}
                >
                  {day}
                </span>
                {isToday && !isSelected && (
                  <span className="text-[10px] font-black text-amber-500 uppercase">
                    Hoy
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-wrap gap-1.5 min-h-[12px]">
                {dayCitas.map((_, idx) => (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={idx}
                    className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-[#009688]"
                  />
                ))}
              </div>
              {isSelected && (
                <motion.div
                  layoutId="activeDay"
                  className="absolute inset-0 border-2 border-[#009688] pointer-events-none rounded-none z-10"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
