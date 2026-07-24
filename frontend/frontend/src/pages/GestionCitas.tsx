import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Cliente, Servicio, Categoria, DbCita, NuevaCitaDto } from '../services/api';
import { Modal } from '../components/Modal';
import { ApptForm } from '../components/ApptForm';

const C = {
  primary:     '#009688',
  primaryHov:  '#00796B',
  primaryLight:'#E0F2F1',
  primaryDark: '#004D40',
  bgPage:      '#F5F9FC',
  bgCard:      '#FFFFFF',
  bgHov:       '#F8FAFC',
  border:      '#E2E8F0',
  textMain:    '#1A252C',
  textMuted:   '#64748B',
  textLight:   '#94A3B8',
  shadowSm:    '0 1px 3px rgba(0,0,0,0.05)',
  shadowMd:    '0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03)',
  shadowLg:    '0 10px 15px -3px rgba(0,0,0,0.07),0 4px 6px -2px rgba(0,0,0,0.03)',
  shadowModal: '0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)',
};

const STATUS_STYLES: Record<string, {bg:string; color:string}> = {
  pendiente:  { bg:'#E2E8F0', color:'#475569' },
  confirmada: { bg:'#E0F2F1', color:'#00796B' },
  cancelada:  { bg:'#FFEBEE', color:'#C62828' },
  completada: { bg:'#E0F2F1', color:'#004D40' },
  reagendado: { bg:'#FFF3E0', color:'#E65100' },
};

const StatusPill: React.FC<{status:string}> = ({ status }) => {
  const s = STATUS_STYLES[status.toLowerCase()] ?? { bg:'#F1F5F9', color:'#64748B' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'4px 12px', borderRadius:20,
      fontSize:12, fontWeight:600,
      backgroundColor: s.bg, color: s.color,
    }}>
      {status}
    </span>
  );
};

const AVATAR_COLORS = ['#009688','#00796B','#004D40','#0288D1','#7B1FA2','#E64A19','#388E3C','#F57C00'];
const pickColor = (s:string) => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];

const Avatar: React.FC<{initials:string}> = ({ initials }) => (
  <div style={{
    width:36, height:36, borderRadius:'50%',
    backgroundColor: pickColor(initials),
    color:'#fff', display:'flex', alignItems:'center',
    justifyContent:'center', fontWeight:600,
    fontSize:13, textTransform:'uppercase', flexShrink:0,
  }}>
    {initials.slice(0,2)}
  </div>
);

const fmtDate = (d:string) => {
  if(!d) return '';
  const [y,m,day] = d.split('-');
  const mo = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${day} ${mo[Number(m)-1]} ${y}`;
};
const fmtTime = (t:string) => {
  if(!t) return '';
  const [h,min] = t.split(':');
  const hr = parseInt(h,10);
  return `${hr.toString().padStart(2,'0')}:${min} ${hr>=12?'PM':'AM'}`;
};

const isOverdue = (fecha:string, hora:string, estadoCita:string): boolean => {
  if (estadoCita !== 'Pendiente' && estadoCita !== 'Confirmada') return false;
  const apptDate = new Date(`${fecha}T${hora}`);
  return apptDate < new Date();
};

type Filter = 'Todas'|'Pendiente'|'Confirmada'|'Cancelada'|'Completada';
type DateFilter = 'Todas' | 'Hoy' | 'Semana' | 'Mes';
type Tab = 'agenda' | 'historial';

export const GestionCitas: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if(!isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);

  const [appointments, setAppointments] = useState<DbCita[]>([]);
  const [clients,      setClients]      = useState<Cliente[]>([]);
  const [categories,   setCategories]   = useState<Categoria[]>([]);
  const [services,     setServices]     = useState<Servicio[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<Tab>('agenda');
  const [filter,       setFilter]       = useState<Filter>('Todas');
  const [dateFilter,   setDateFilter]   = useState<DateFilter>('Todas');
  const [query,        setQuery]        = useState('');

  const [showNew,      setShowNew]      = useState(false);
  const [editCita,     setEditCita]     = useState<DbCita|null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cli, cat, srv] = await Promise.all([
        apiService.getClientes(),
        apiService.getCategorias(),
        apiService.getServicios(),
      ]);
      setClients(cli);
      setCategories(cat);
      setServices(srv);
      await loadCitas(cli, srv);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadCitas = async (cli:Cliente[], srv:Servicio[]) => {
    const [raw, historialRaw, detalles] = await Promise.all([
      apiService.getDbCitas(),
      apiService.getHistorial(),
      apiService.getDetallesCita(),
    ]);

    const autoCompleted: number[] = [];
    for (const c of raw) {
      if (c.estadoCita === 'Confirmada' && isOverdue(c.fecha, c.hora, c.estadoCita)) {
        const client = cli.find(x => x.idCliente === c.idCliente);
        const datosCompletos = client && client.nombre && client.apellidoPaterno && client.telefono;
        if (!datosCompletos) continue;
        try {
          await fetch(`http://localhost:5020/api/Citas/${c.idCita}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ estadoCita: 'Completada' }),
          });
          autoCompleted.push(c.idCita);
        } catch {}
      }
    }

    if (autoCompleted.length > 0) {
      const [raw2, historial2] = await Promise.all([
        apiService.getDbCitas(),
        apiService.getHistorial(),
      ]);
      const rawMapped2 = (c: DbCita) => {
        const client  = cli.find(x => x.idCliente === c.idCliente);
        const datosCompletos = client && client.nombre && client.apellidoPaterno && client.telefono;
        const detail  = detalles.find(d => d.idCita === c.idCita);
        const service = detail ? srv.find(s => s.idServicio === detail.idServicio) : null;
        return {
          ...c,
          clientDataComplete: !!datosCompletos,
          clientName:    client ? `${client.nombre} ${client.apellidoPaterno} ${client.apellidoMaterno}`.trim() : 'Desconocido',
          clientCi:      client ? client.ci.toString() : 'N/A',
          clientFirstChar: client ? `${client.nombre[0]}${client.apellidoPaterno[0]}` : 'NA',
          serviceName:   service ? service.nombre : 'No asignado',
          _clientObj:    client  ?? null,
          _serviceObj:   service ?? null,
          _hora:         c.hora,
} as DbCita & { _clientObj:Cliente|null; _serviceObj:Servicio|null; _hora:string; clientDataComplete:boolean };
      };
      const mapped2 = [...raw2, ...historial2].map(rawMapped2);
      mapped2.sort((a,b) => new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime());
      setAppointments(mapped2 as DbCita[]);
      return;
    }

    const rawMapped = (c: DbCita) => {
      const client  = cli.find(x => x.idCliente === c.idCliente);
      const datosCompletos = client && client.nombre && client.apellidoPaterno && client.telefono;
      const detail  = detalles.find(d => d.idCita === c.idCita);
      const service = detail ? srv.find(s => s.idServicio === detail.idServicio) : null;
      return {
        ...c,
        clientDataComplete: !!datosCompletos,
        clientName:    client ? `${client.nombre} ${client.apellidoPaterno} ${client.apellidoMaterno}`.trim() : 'Desconocido',
        clientCi:      client ? client.ci.toString() : 'N/A',
        clientFirstChar: client ? `${client.nombre[0]}${client.apellidoPaterno[0]}` : 'NA',
        serviceName:   service ? service.nombre : 'No asignado',
        _clientObj:    client  ?? null,
        _serviceObj:   service ?? null,
        _hora:         c.hora,
      } as DbCita & { _clientObj:Cliente|null; _serviceObj:Servicio|null; _hora:string; clientDataComplete:boolean };
    };
    const mapped = [...raw, ...historialRaw].map(rawMapped);
    mapped.sort((a,b) => new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime());
    setAppointments(mapped as DbCita[]);
  };

  const handleNew = async (data:{client:Cliente;service:Servicio;fecha:string;hora:string;medio:string;estado:string}) => {
    const session = localStorage.getItem('dental_session');
    let userId = 1;
    try { if(session) userId = JSON.parse(session).id || 1; } catch{}

    const dto: NuevaCitaDto = {
      idCliente:         data.client.idCliente,
      idUsuario:         userId,
      medioComunicacion: data.medio,
      fecha:             data.fecha,
      hora:              `${data.hora}:00`,
      idServicio:        data.service.idServicio,
      estadoCita:        data.estado,
    };
    await apiService.crearNuevaCita(dto);
    setShowNew(false);
    await loadCitas(clients, services);
  };

  const handleEdit = async (data:{client:Cliente;service:Servicio;fecha:string;hora:string;medio:string;estado:string}) => {
    if(!editCita) return;

    if(apiService.isMock()) {
      const dbCitas = await apiService.getDbCitas();
      const dbDetalles = await apiService.getDetallesCita();
      const dbServicios = await apiService.getServicios();

      const [nH, nM] = data.hora.split(':').map(Number);
      const newStart = nH * 60 + nM;
      const [dH, dM] = data.service.duracion.split(':').map(Number);
      const newEnd = newStart + dH * 60 + dM;

      for (const c of dbCitas) {
        if (c.idCita === editCita.idCita) continue;
        if (c.estadoCita === 'Cancelada' || c.estadoCita === 'Completada') continue;
        if (c.fecha !== data.fecha) continue;

        const dDet = dbDetalles.find(d => d.idCita === c.idCita);
        if (!dDet) continue;
        const dSrv = dbServicios.find(s => s.idServicio === dDet.idServicio);
        if (!dSrv) continue;

        const [eH, eM] = c.hora.split(':').map(Number);
        const exStart = eH * 60 + eM;
        const [edH, edM] = dSrv.duracion.split(':').map(Number);
        const exEnd = exStart + edH * 60 + edM;

        if (newStart < exEnd && exStart < newEnd) {
          const isPatient = c.idCliente === data.client.idCliente;
          const isDentist = c.idUsuario === editCita.idUsuario;
          if (!isPatient && !isDentist) continue;

          const fmt = (m: number) => `${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}`;
          throw new Error(isPatient
            ? `El paciente ya tiene una cita (${c.codigo}: ${dSrv.nombre} de ${fmt(exStart)} a ${fmt(exEnd)}) que se solapa con el horario solicitado.`
            : `El horario solicitado se solapa con la cita ${c.codigo} (${dSrv.nombre} de ${fmt(exStart)} a ${fmt(exEnd)}).`);
        }
      }

      const citas = dbCitas;
      const idx   = citas.findIndex(c => c.idCita === editCita.idCita);
      if(idx !== -1) {
        citas[idx] = {
          ...citas[idx],
          idCliente:        data.client.idCliente,
          medioComunicacion:data.medio,
          fecha:            data.fecha,
          hora:             `${data.hora}:00`,
          estadoCita:       data.estado,
        };
        localStorage.setItem('dental_db_citas', JSON.stringify(citas));

        const detalles = dbDetalles;
        const detIdx   = detalles.findIndex(d => d.idCita === editCita.idCita);
        if(detIdx !== -1) {
          detalles[detIdx] = { ...detalles[detIdx], idServicio: data.service.idServicio };
          localStorage.setItem('dental_db_detalles', JSON.stringify(detalles));
        }
      }
    } else {
      const res = await fetch(`http://localhost:5020/api/Citas/${editCita.idCita}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          idCita:           editCita.idCita,
          idCliente:        data.client.idCliente,
          idUsuario:        editCita.idUsuario,
          codigo:           editCita.codigo,
          medioComunicacion:data.medio,
          fecha:            data.fecha,
          hora:             `${data.hora}:00`,
          estadoCita:       data.estado,
          estado:           editCita.estado,
          idServicio:       data.service.idServicio,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ mensaje: 'Error al guardar los cambios.' }));
        throw new Error(errData.mensaje || 'Error al guardar los cambios.');
      }
    }

    setEditCita(null);
    await loadCitas(clients, services);
  };

  const agendaCitas = appointments.filter(c =>
    c.estadoCita === 'Pendiente' || c.estadoCita === 'Confirmada'
  );
  const historialCitas = appointments.filter(c =>
    c.estadoCita === 'Completada' || c.estadoCita === 'Cancelada'
  );

  const currentPool = tab === 'agenda' ? agendaCitas : historialCitas;

  const todayStr = new Date().toISOString().split('T')[0];
  const matchDate = (fecha: string): boolean => {
    if (dateFilter === 'Todas') return true;
    if (dateFilter === 'Hoy') return fecha === todayStr;
    const d = new Date(fecha + 'T00:00:00');
    const now = new Date();
    if (dateFilter === 'Semana') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return d >= weekStart && d <= weekEnd;
    }
    if (dateFilter === 'Mes') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filtered = currentPool.filter(c => {
    const matchF = filter === 'Todas' || c.estadoCita === filter;
    const matchD = matchDate(c.fecha);
    const q      = query.toLowerCase().trim();
    const matchQ = !q || (c.clientName||'').toLowerCase().includes(q) || (c.clientCi||'').includes(q);
    return matchF && matchD && matchQ;
  });

  const AGENDA_FILTERS: {label:string; value:Filter}[] = [
    {label:'Todos',      value:'Todas'},
    {label:'Pendiente',  value:'Pendiente'},
    {label:'Confirmada', value:'Confirmada'},
  ];

  const HISTORIAL_FILTERS: {label:string; value:Filter}[] = [
    {label:'Todos',      value:'Todas'},
    {label:'Completada', value:'Completada'},
    {label:'Cancelada',  value:'Cancelada'},
  ];

  const DATE_FILTERS: {label:string; value:DateFilter}[] = [
    {label:'Todas', value:'Todas'},
    {label:'Hoy',   value:'Hoy'},
    {label:'Semana',value:'Semana'},
    {label:'Mes',   value:'Mes'},
  ];

  const editInitial = editCita ? (() => {
    const any = editCita as any;
    return {
      client:  any._clientObj  as Cliente|null,
      service: any._serviceObj as Servicio|null,
      fecha:   editCita.fecha,
      hora:    editCita.hora ? editCita.hora.slice(0,5) : '',
      medio:   editCita.medioComunicacion,
      estado:  editCita.estadoCita,
    };
  })() : undefined;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .appt-row:hover { background-color: #F8FAFC !important; }
        .btn-manage:hover { background-color: #E0F2F1 !important; }
        .filter-opt:hover { color:#1A252C; background-color:#F8FAFC; }
        .sugg-item:hover { background-color:#E0F2F1 !important; color:#004D40 !important; font-weight:500; }
        input:focus, select:focus {
          outline:none;
          border-color:#009688 !important;
          background-color:#fff !important;
          box-shadow: 0 0 0 3px rgba(0,150,136,0.15) !important;
        }
      `}</style>

      <div style={{
        fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        backgroundColor:C.bgPage, minHeight:'100vh', color:C.textMain,
        lineHeight:1.5, WebkitFontSmoothing:'antialiased',
      }}>

        <div style={{
          maxWidth:1200, margin:'0 auto', padding:'0 24px',
          animation:'fadeIn 0.4s ease-out',
        }}>
          {/* Header */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
            <div>
              <h1 style={{fontSize:28, fontWeight:700, color:C.textMain, marginBottom:6}}>
                Gesti&oacute;n de Citas
              </h1>
              <p style={{fontSize:15, color:C.textMuted}}>
                Administra y organiza el flujo de pacientes del d&iacute;a.
              </p>
            </div>
            {tab === 'agenda' && (
              <button onClick={()=>setShowNew(true)} style={{
                display:'inline-flex', alignItems:'center', gap:8,
                fontSize:14, fontWeight:600, padding:'10px 20px',
                borderRadius:8, border:'1px solid transparent',
                backgroundColor:C.primaryDark, color:'#fff', cursor:'pointer',
                boxShadow:`0 2px 8px rgba(0,77,64,0.2)`,
                transition:'all 0.2s ease',
              }}>
                + Nueva Cita
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={{
            display:'flex', gap:0, marginBottom:24,
            borderBottom:`2px solid ${C.border}`,
          }}>
            {([['agenda','Agenda',agendaCitas.length],['historial','Historial',historialCitas.length]] as const).map(([val,lbl,count]) => (
              <button
                key={val}
                onClick={() => { setTab(val); setFilter('Todas'); setDateFilter('Todas'); setQuery(''); }}
                style={{
                  fontFamily:'inherit', fontSize:14, fontWeight:600,
                  padding:'10px 22px', border:'none', background:'none',
                  cursor:'pointer', transition:'all 0.2s ease',
                  color: tab===val ? C.primaryDark : C.textMuted,
                  borderBottom: tab===val ? `2px solid ${C.primaryDark}` : '2px solid transparent',
                  marginBottom:-2,
                  display:'flex', alignItems:'center', gap:7,
                }}
              >
                {lbl}
                <span style={{
                  fontSize:11, fontWeight:700,
                  backgroundColor: tab===val ? C.primaryLight : '#F1F5F9',
                  color: tab===val ? C.primaryDark : C.textMuted,
                  padding:'1px 7px', borderRadius:99,
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            gap:20, marginBottom:24,
            backgroundColor:C.bgCard, padding:'16px 24px',
            borderRadius:12, boxShadow:C.shadowSm,
            border:`1px solid ${C.border}`,
          }}>
            {/* Search */}
            <div style={{position:'relative', flexGrow:1, maxWidth:360}}>
              <span style={{
                position:'absolute', left:16, top:'50%',
                transform:'translateY(-50%)', color:C.textLight, fontSize:16,
              }}>&#x1F50D;</span>
              <input
                type="text"
                placeholder={tab === 'agenda' ? 'Buscar por Nombre o CI...' : 'Buscar en historial...'}
                value={query}
                onChange={e=>setQuery(e.target.value)}
                style={{
                  width:'100%', padding:'12px 16px 12px 48px', fontFamily:'inherit',
                  fontSize:14, border:`1px solid ${C.border}`, borderRadius:30,
                  backgroundColor:'#F1F5F9', color:C.textMain, boxSizing:'border-box',
                  transition:'all 0.2s ease', outline:'none',
                }}
              />
            </div>

            {/* Date filter */}
            <div style={{display:'flex', gap:6, alignItems:'center'}}>
              <span style={{fontSize:13, color:C.textMuted, fontWeight:500, marginRight:4}}>Fecha:</span>
              {DATE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={()=>setDateFilter(f.value)}
                  className="filter-opt"
                  style={{
                    fontFamily:'inherit', fontSize:13, fontWeight: dateFilter===f.value?600:500,
                    padding:'6px 14px', borderRadius:30,
                    border:'1px solid transparent',
                    backgroundColor: dateFilter===f.value ? C.primaryLight : 'transparent',
                    color: dateFilter===f.value ? C.primaryHov : C.textMuted,
                    cursor:'pointer', transition:'all 0.2s ease',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div style={{display:'flex', gap:6}}>
              {(tab === 'agenda' ? AGENDA_FILTERS : HISTORIAL_FILTERS).map(f => (
                <button
                  key={f.value}
                  onClick={()=>setFilter(f.value)}
                  className="filter-opt"
                  style={{
                    fontFamily:'inherit', fontSize:13, fontWeight: filter===f.value?600:500,
                    padding:'6px 14px', borderRadius:30,
                    border:'1px solid transparent',
                    backgroundColor: filter===f.value ? C.primaryLight : 'transparent',
                    color: filter===f.value ? C.primaryHov : C.textMuted,
                    cursor:'pointer', transition:'all 0.2s ease',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{
            backgroundColor:C.bgCard, borderRadius:12,
            boxShadow:C.shadowMd, border:`1px solid ${C.border}`, overflow:'hidden',
          }}>
            <table style={{width:'100%', borderCollapse:'collapse', textAlign:'left'}}>
              <thead>
                <tr>
                  {['Cliente','Fecha & Hora','Tratamiento','Estado','Acciones'].map((h,i) => (
                    <th key={h} style={{
                      backgroundColor:'#F8FAFC', padding:'16px 24px',
                      fontSize:12, fontWeight:600, textTransform:'uppercase',
                      letterSpacing:'0.05em', color:C.textMuted,
                      borderBottom:`1px solid ${C.border}`,
                      textAlign: i===4 ? 'right' : 'left',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{padding:40, textAlign:'center', color:C.textMuted, fontStyle:'italic'}}>
                      Cargando citas...
                    </td>
                  </tr>
                ) : filtered.length===0 ? (
                  <tr>
                    <td colSpan={5} style={{padding:40, textAlign:'center', color:C.textMuted}}>
                      No se encontraron citas.
                    </td>
                  </tr>
                ) : filtered.map(cita => (
                  <tr key={cita.idCita} className="appt-row" style={{
                    borderBottom:`1px solid ${C.border}`, transition:'background-color 0.15s ease',
                  }}>
                    <td style={{padding:'16px 24px', verticalAlign:'middle', fontSize:14}}>
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        <Avatar initials={cita.clientFirstChar||'NA'} />
                        <div>
                          <div style={{fontWeight:600, color:C.textMain}}>{cita.clientName}</div>
                          <div style={{fontSize:12, color:C.textMuted, marginTop:2}}>CI: {cita.clientCi}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'16px 24px', verticalAlign:'middle', fontSize:14}}>
                      <div style={{color:C.textMuted}}>{fmtDate(cita.fecha)}</div>
                      <div style={{fontWeight:600, color:C.primaryHov, marginTop:2, display:'flex', alignItems:'center', gap:6}}>
                        {fmtTime(cita.hora)}
                        {isOverdue(cita.fecha, cita.hora, cita.estadoCita) && (
                          <span title="Esta cita ya pasó su horario y aún no fue cerrada." style={{
                            fontSize:10, fontWeight:700, color:'#C62828',
                            backgroundColor:'#FFEBEE', padding:'2px 6px',
                            borderRadius:99, letterSpacing:'0.03em',
                          }}>
                            Vencida
                          </span>
                        )}
                        {(cita as any).clientDataComplete === false && cita.estadoCita === 'Confirmada' && (
                          <span title="El cliente tiene datos incompletos. Complete nombre, apellido y teléfono." style={{
                            fontSize:10, fontWeight:700, color:'#E65100',
                            backgroundColor:'#FFF3E0', padding:'2px 6px',
                            borderRadius:99, letterSpacing:'0.03em',
                          }}>
                            Datos incompletos
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{padding:'16px 24px', verticalAlign:'middle', fontSize:14}}>
                      <span style={{
                        display:'inline-block', padding:'6px 12px', borderRadius:6,
                        backgroundColor:'#F1F5F9', color:C.textMuted, fontSize:13, fontWeight:500,
                      }}>
                        {cita.serviceName}
                      </span>
                    </td>
                    <td style={{padding:'16px 24px', verticalAlign:'middle'}}>
                      <StatusPill status={cita.estadoCita} />
                    </td>
                    <td style={{padding:'16px 24px', verticalAlign:'middle', textAlign:'right'}}>
                      <button
                        className="btn-manage"
                        onClick={()=>setEditCita(cita)}
                        style={{
                          color:C.primaryHov, background:'none', border:'none',
                          fontFamily:'inherit', fontWeight:600, fontSize:14,
                          cursor:'pointer', padding:'4px 8px', borderRadius:4,
                          transition:'background-color 0.15s ease',
                        }}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nueva Cita Modal */}
        {showNew && (
          <Modal
            title="Nueva Cita - Modal"
            subtitle="Ingrese los datos para agendar la sesión."
            onClose={()=>setShowNew(false)}
          >
            <ApptForm
              clientes={clients}
              categorias={categories}
              servicios={services}
              onCancel={()=>setShowNew(false)}
              onSubmit={handleNew}
              submitLabel="Agendar Cita"
              showEstado={true}
            />
          </Modal>
        )}

        {/* Gestionar (Edit) Modal */}
        {editCita && (
          <Modal
            title="Gestionar Cita"
            subtitle={`Código: ${editCita.codigo} · Modifica los datos o cambia el estado de la cita.`}
            onClose={()=>setEditCita(null)}
          >
            <ApptForm
              clientes={clients}
              categorias={categories}
              servicios={services}
              initial={editInitial}
              onCancel={()=>setEditCita(null)}
              onSubmit={handleEdit}
              submitLabel="Guardar Cambios"
              showEstado={true}
            />
          </Modal>
        )}
      </div>
    </>
  );
};