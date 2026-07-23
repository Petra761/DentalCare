const DailyTimeline = () => {
  const appointments = [
    {
      time: "08:00 AM",
      patient: "Juan Pérez",
      service: "Limpieza",
      icon: "dentistry",
      status: "Confirmada",
      color: "primary",
      bg: "bg-primary/10",
    },
    {
      time: "09:30 AM",
      patient: "María López",
      service: "Ortodoncia",
      icon: "circle",
      status: "Pendiente",
      color: "outline",
      bg: "bg-surface-container",
    },
    {
      time: "11:00 AM",
      patient: "Carlos Rodríguez",
      service: "Endodoncia",
      icon: "medical_services",
      status: "Atendida",
      color: "primary",
      bg: "bg-primary-container",
    },
  ];

  return (
    <div className="bg-[#f0f9fa] border border-primary/10 rounded-lg p-5 flex-1 shadow-sm">
      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold text-primary tracking-widest">
          AGENDA DEL DÍA
        </p>
        <h3 className="text-xl font-bold text-secondary">
          Martes, 10 de Octubre
        </h3>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-[7px] top-4 bottom-4 w-px bg-primary/20 border-l border-dashed border-primary/40"></div>

        {appointments.map((app, index) => (
          <div key={index} className="relative pl-8">
            {/* El punto de la línea de tiempo */}
            <div
              className={`absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${app.color === "primary" ? "bg-primary" : "bg-outline"}`}
            ></div>

            <div className="bg-white p-4 rounded-lg border border-outline-variant shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs font-black ${app.color === "primary" ? "text-primary" : "text-outline"}`}
                >
                  {app.time}
                </span>
                <span
                  className={`px-2 py-0.5 ${app.bg} ${app.color === "primary" ? "text-primary" : "text-outline"} text-[9px] font-bold rounded uppercase`}
                >
                  {app.status}
                </span>
              </div>
              <p className="font-bold text-sm text-on-surface">{app.patient}</p>
              <p className="text-[11px] text-outline flex items-center gap-1 mt-1 uppercase font-medium">
                <span className="material-symbols-outlined text-[14px]">
                  {app.icon}
                </span>
                {app.service}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 bg-white border border-outline-variant text-on-surface-variant font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container transition-all">
        <span className="material-symbols-outlined text-[18px]">print</span>
        Imprimir Agenda
      </button>
    </div>
  );
};

export default DailyTimeline;
