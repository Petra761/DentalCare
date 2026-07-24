import React from 'react';

// --- COMPONENTES COMPARTIDOS (Header de la página del PDF) ---
const PdfHeader = ({ title, date, adminName = "Administrador" }: { title: string, date: string, adminName?: string }) => (
  <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#009688] rounded-lg flex items-center justify-center text-white font-bold text-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
      </div>
      <div>
        <h2 className="text-[#009688] font-bold text-xl leading-none">DentalCare</h2>
        <span className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase">GESTIÓN CLÍNICA</span>
      </div>
    </div>
    <div className="text-right">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">{title}</h1>
      <div className="text-xs text-slate-500 space-y-0.5">
        <div className="flex items-center justify-end gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {date}
        </div>
        <div className="flex items-center justify-end gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Admin: {adminName}
        </div>
      </div>
    </div>
  </div>
);

// --- 1. PREVIEW AGENDA DIARIA ---
export const PreviewAgendaDiaria = ({ data, fecha }: { data: any[], fecha: string }) => {
  return (
    <div className="p-10">
      <PdfHeader title="Agenda Diaria" date={fecha} />
      
      <table className="w-full text-sm text-left">
        <thead className="bg-[#e6f3f5] text-[#009688] text-xs uppercase font-bold">
          <tr>
            <th className="px-4 py-3 rounded-l-lg">Hora</th>
            <th className="px-4 py-3">Paciente</th>
            <th className="px-4 py-3">Servicio (Tratamiento)</th>
            <th className="px-4 py-3 rounded-r-lg">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-slate-500">No hay citas programadas para este día.</td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-4 font-bold text-[#009688]">
                  {item.hora.split(' ')[0]}<br/>
                  <span className="text-[10px] text-slate-500">{item.hora.split(' ')[1]}</span>
                </td>
                <td className="px-4 py-4 font-medium text-slate-700 w-1/3">{item.cliente}</td>
                <td className="px-4 py-4 text-slate-600">{item.tratamiento}</td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.estadoCita?.toLowerCase() === 'confirmada' || item.estadoCita?.toLowerCase() === 'completada' 
                      ? 'bg-[#009688] text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.estadoCita?.toUpperCase() || 'PENDIENTE'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- 2. PREVIEW AGENDA MENSUAL ---
export const PreviewAgendaMensual = ({ data, mesAnio }: { data: any, mesAnio: string }) => {
  if (!data) return null;
  const diasSemanas = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  
  // Calcular prefijo YYYY-MM para comparar las fechas dinámicamente
  const today = new Date();
  const arrDias = data.Dias || data.dias || [];
  const yearMonth = arrDias.length > 0 
    ? (arrDias[0].Fecha || arrDias[0].fecha).substring(0, 7) 
    : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const renderCalendarBoxes = () => {
    let boxes = [];
    // Obtenemos los días reales del mes para no pintar 31 siempre
    const [y, m] = yearMonth.split('-');
    const maxDays = new Date(parseInt(y), parseInt(m), 0).getDate();

    for(let i=1; i<=maxDays; i++) {
      const fechaStr = `${yearMonth}-${i.toString().padStart(2, '0')}`;
      const diaData = arrDias.find((d: any) => (d.Fecha || d.fecha) === fechaStr);
      const totalCitas = diaData ? (diaData.Total || diaData.total) : 0;
      
      boxes.push(
        <div key={i} className="border border-slate-200 p-2 min-h-[80px] bg-white flex flex-col items-center">
          <span className={`text-sm font-bold ${totalCitas > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{i}</span>
          
          {totalCitas > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {Array.from({ length: Math.min(totalCitas, 5) }).map((_, idx) => (
                <div key={idx} className="w-2 h-2 rounded-full bg-[#009688]"></div>
              ))}
              {totalCitas > 5 && (
                <span className="text-[9px] text-[#009688] font-bold leading-none self-center">+</span>
              )}
            </div>
          )}
        </div>
      );
    }
    return boxes;
  };

  return (
    <div className="p-10 flex flex-col h-full">
      <PdfHeader title="Agenda Mensual" date={mesAnio} />
      
      <div className="flex gap-6 flex-1">
        {/* Calendario (75%) */}
        <div className="flex-1">
          <div className="grid grid-cols-7 border-t border-l border-slate-200">
            {diasSemanas.map(d => (
              <div key={d} className="bg-[#e6f3f5] text-[#009688] text-[10px] font-bold text-center py-2 border-r border-b border-slate-200">
                {d}
              </div>
            ))}
            {/* Rellenamos días vacios para empezar el mes (ej: empieza en viernes) */}
            <div className="border-r border-b border-slate-200 min-h-[80px] bg-slate-50"></div>
            <div className="border-r border-b border-slate-200 min-h-[80px] bg-slate-50"></div>
            <div className="border-r border-b border-slate-200 min-h-[80px] bg-slate-50"></div>
            <div className="border-r border-b border-slate-200 min-h-[80px] bg-slate-50"></div>
            {renderCalendarBoxes()}
          </div>
        </div>

        {/* Panel Lateral (25%) */}
        <div className="w-1/4 flex flex-col gap-4">
          <div className="bg-[#e6f3f5] rounded-xl p-5">
            <h4 className="text-[#009688] text-[10px] font-bold uppercase mb-4 tracking-wider">Métricas del Mes</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Citas Totales</span>
                <span className="font-bold text-slate-800 text-base">{(data.Metricas || data.metricas)?.TotalCitas ?? (data.Metricas || data.metricas)?.totalCitas ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Asistencia</span>
                <span className="font-bold text-slate-800 text-base">{(data.Metricas || data.metricas)?.Asistencia ?? (data.Metricas || data.metricas)?.asistencia ?? 0}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tratamientos</span>
                <span className="font-bold text-slate-800 text-base">{(data.Metricas || data.metricas)?.TotalTratamientos ?? (data.Metricas || data.metricas)?.totalTratamientos ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <h4 className="text-[#009688] text-[10px] font-bold uppercase mb-4 tracking-wider">Tratamientos Frecuentes</h4>
            <div className="space-y-3 text-xs text-slate-600 font-medium">
              {(data.TratamientosFrecuentes || data.tratamientosFrecuentes || []).map((t: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="truncate pr-2">{t.Nombre || t.nombre}</span>
                    <span className="font-bold text-slate-800">{t.Porcentaje ?? t.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-[#009688] h-1.5 rounded-full" style={{width: `${t.Porcentaje ?? t.porcentaje}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. PREVIEW PACIENTES ---
export const PreviewPacientes = ({ data, date }: { data: any, date: string }) => {
  if (!data) return null;
  return (
    <div className="p-10">
      <PdfHeader title="Reporte: Listado Maestro de Pacientes" date={date} />
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#e6f3f5] p-4 rounded-xl border border-[#bce6df]">
          <h4 className="text-[#009688] text-[10px] font-bold uppercase tracking-wider mb-1">Total Pacientes</h4>
          <span className="text-3xl font-bold text-[#009688]">{(data.Metricas || data.metricas)?.TotalPacientes ?? (data.Metricas || data.metricas)?.totalPacientes ?? 0}</span>
        </div>
        <div className="bg-[#e6f3f5] p-4 rounded-xl border border-[#bce6df]">
          <h4 className="text-[#009688] text-[10px] font-bold uppercase tracking-wider mb-1">Activos este Mes</h4>
          <span className="text-3xl font-bold text-[#009688]">{(data.Metricas || data.metricas)?.ActivosEsteMes ?? (data.Metricas || data.metricas)?.activosEsteMes ?? 0}</span>
        </div>
        <div className="bg-[#e6f3f5] p-4 rounded-xl border border-[#bce6df]">
          <h4 className="text-[#009688] text-[10px] font-bold uppercase tracking-wider mb-1">Nuevos Ingresos</h4>
          <span className="text-3xl font-bold text-[#009688]">{(data.Metricas || data.metricas)?.NuevosIngresos ?? (data.Metricas || data.metricas)?.nuevosIngresos ?? 0}</span>
        </div>
      </div>

      <table className="w-full text-sm text-left">
        <thead className="bg-[#e6f3f5] text-[#009688] text-[10px] uppercase font-bold tracking-wider">
          <tr>
            <th className="px-4 py-3 rounded-l-lg">CI / Documento</th>
            <th className="px-4 py-3">Nombre Completo</th>
            <th className="px-4 py-3">Última Visita</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 rounded-r-lg">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {(data.Pacientes || data.pacientes || []).map((p: any, i: number) => (
            <tr key={i} className={`border-b border-slate-100 ${i%2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <td className="px-4 py-4 font-medium text-slate-600">{p.ci || p.Ci}</td>
              <td className="px-4 py-4 font-bold text-slate-800">{p.nombreCompleto || p.NombreCompleto}</td>
              <td className="px-4 py-4 text-slate-600">{p.ultimaVisita || p.UltimaVisita || 'Sin visitas'}</td>
              <td className="px-4 py-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  (p.estado || p.Estado)?.toLowerCase() === 'activo' ? 'bg-[#bce6df] text-[#009688]' : 
                  (p.estado || p.Estado)?.toLowerCase() === 'finalizado' ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-600'
                }`}>
                  {(p.estado || p.Estado)?.toUpperCase() || 'ACTIVO'}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-600">{p.telefono || p.Telefono || 'Sin registro'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- 4. PREVIEW SERVICIOS (TRATAMIENTOS) ---
export const PreviewServicios = ({ data, date }: { data: any[], date: string }) => {
  // Agrupar por categoría
  const agrupado = data.reduce((acc: any, curr: any) => {
    const cat = curr.categoria || 'Sin Categoría';
    if(!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  return (
    <div className="p-10">
      <PdfHeader title="Catálogo de Servicios" date={`Edición ${date.split('/')[2]}`} />
      
      <div className="space-y-8">
        {Object.keys(agrupado).map((categoria, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-6 bg-[#009688] rounded-full"></div>
              <h3 className="text-xl font-bold text-[#009688]">{categoria}</h3>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead className="bg-[#e6f3f5] text-[#009688] text-xs font-bold">
                <tr>
                  <th className="px-4 py-2 w-24">Código</th>
                  <th className="px-4 py-2 w-1/4">Servicio</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 w-24">Duración</th>
                </tr>
              </thead>
              <tbody>
                {agrupado[categoria].map((s: any, i: number) => (
                  <tr key={i} className={`border-b border-slate-100 ${i%2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-4 py-4 font-bold text-[#009688] text-xs">{s.codigo}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{s.nombre}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs leading-relaxed">{s.descripcion}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs text-center">{s.duracion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
