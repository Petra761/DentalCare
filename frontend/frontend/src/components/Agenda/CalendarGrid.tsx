const CalendarGrid = () => {
  const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  // Ejemplo de días (esto normalmente vendría de una librería como date-fns o dayjs)
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
        {/* Aquí mapearías los días del mes. Ejemplo estático basado en tu HTML: */}
        {[...Array(31)].map((_, i) => (
          <div
            key={i}
            className="h-24 p-2 border-r border-b border-outline-variant text-on-surface text-xs font-bold relative last:border-r-0 hover:bg-surface-container/30 transition-colors"
          >
            {i + 1}
            {i === 9 && ( // Ejemplo de día con eventos (Día 10)
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
