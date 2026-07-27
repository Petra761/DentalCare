import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Cliente, Servicio, Categoria, DbCita, NuevaCitaDto } from '../services/api';
import { Modal } from '../components/Modal';
import { ApptForm } from '../components/ApptForm';
import { useNotification } from '../context/NotificationContext';

const C = {
  primary:     '#009688',
  primaryHov:  '#00796B',
  primaryLight:'#E0F2F1',
  primaryDark: '#115e59',
  bgPage:      '#F5F9FC',
  bgCard:      '#FFFFFF',
  bgHov:       '#E0F2F1',
  border:      '#E2E8F0',
  textMain:    '#1A252C',
  textMuted:   '#64748B',
  textLight:   '#94A3B8',
  bgDanger:    '#FEE2E2',
  bgNeutral:   '#F1F5F9',
  bgInfo:      '#E0F2FE',
  shadowSm:    '0 1px 3px rgba(0,0,0,0.05)',
  shadowMd:    '0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03)',
  shadowLg:    '0 10px 15px -3px rgba(0,0,0,0.07),0 4px 6px -2px rgba(0,0,0,0.03)',
  shadowModal: '0 25px 50px -12px rgba(0,0,0,0.25)',
};

const STATUS_STYLES: Record<string, {bg:string; color:string; border:string}> = {
  pendiente:  { bg:'#F1F5F9', color:'#475569', border:'#cbd5e1' },
  confirmada: { bg:'#DCFCE7', color:'#15803D', border:'#bbf7d0' },
  cancelada:  { bg:'#FEE2E2', color:'#B91C1C', border:'#fecaca' },
  completada: { bg:'#E0F2F1', color:'#00796B', border:'#b2dfdb' },
  reagendado: { bg:'#FEF3C7', color:'#B45309', border:'#fde68a' },
};

const StatusPill: React.FC<{status:string}> = ({ status }) => {
  const s = STATUS_STYLES[status.toLowerCase()] ?? { bg:'#F1F5F9', color:'#475569', border:'#cbd5e1' };
  return (
    <span className="fc-badge" style={{
      display:'inline-flex', alignItems:'center',
      padding:'4px 12px', borderRadius:9999,
      fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.03em',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  );
};

const getAvatarStyle = (initials: string) => {
  const code = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const palettes = [
    { bg: '#E0F2F1', text: '#00796B' },
    { bg: '#E0F2FE', text: '#0369A1' },
    { bg: '#F1F5F9', text: '#475569' },
    { bg: '#DCFCE7', text: '#15803D' },
    { bg: '#FEE2E2', text: '#B91C1C' },
    { bg: '#FEF3C7', text: '#B45309' },
  ];
  return palettes[code % palettes.length];
};

const Avatar: React.FC<{initials:string}> = ({ initials }) => {
  const style = getAvatarStyle(initials);
  return (
    <div style={{
      width:36, height:36, borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight:'bold', fontSize:13, textTransform:'uppercase',
      backgroundColor: style.bg, color: style.text, flexShrink:0,
      boxShadow:'0 1px 2px rgba(0,0,0,0.05)',
    }}>
      {initials.slice(0,2)}
    </div>
  );
};

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
  const { showSuccess } = useNotification();

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
        const datosCompletos = client && client.nombre && client.apellidoPaterno && client.apellidoMaterno && client.telefono && client.tipoSangre && client.tipoSangre !== 'No especificado' && client.fechaNacimiento && client.fechaNacimiento.slice(0,4) !== '0001' && client.fechaNacimiento.slice(0,4) !== '2000';
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
        const datosCompletos = client && client.nombre && client.apellidoPaterno && client.apellidoMaterno && client.telefono && client.tipoSangre && client.tipoSangre !== 'No especificado' && client.fechaNacimiento && client.fechaNacimiento.slice(0,4) !== '0001' && client.fechaNacimiento.slice(0,4) !== '2000';
        const detail  = detalles.find(d => d.idCita === c.idCita);
        const service = detail ? srv.find(s => s.idServicio === detail.idServicio) : null;
        return {
          ...c,
          clientDataComplete: !!datosCompletos,
          clientName:    client ? (client.nombreCompleto || `${client.nombre} ${client.apellidoPaterno} ${client.apellidoMaterno}`.trim()) : 'Desconocido',
          clientCi:      client ? client.ci.toString() : 'N/A',
          clientFirstChar: client ? `${(client.nombre || client.nombreCompleto || '?')[0]}${(client.apellidoPaterno || (client.nombreCompleto || '').split(' ')[1] || '?')[0]}` : 'NA',
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
      const datosCompletos = client && client.nombre && client.apellidoPaterno && client.apellidoMaterno && client.telefono && client.tipoSangre && client.tipoSangre !== 'No especificado' && client.fechaNacimiento && client.fechaNacimiento.slice(0,4) !== '0001' && client.fechaNacimiento.slice(0,4) !== '2000';
      const detail  = detalles.find(d => d.idCita === c.idCita);
      const service = detail ? srv.find(s => s.idServicio === detail.idServicio) : null;
      return {
        ...c,
        clientDataComplete: !!datosCompletos,
        clientName:    client ? (client.nombreCompleto || `${client.nombre} ${client.apellidoPaterno} ${client.apellidoMaterno}`.trim()) : 'Desconocido',
        clientCi:      client ? client.ci.toString() : 'N/A',
        clientFirstChar: client ? `${(client.nombre || client.nombreCompleto || '?')[0]}${(client.apellidoPaterno || (client.nombreCompleto || '').split(' ')[1] || '?')[0]}` : 'NA',
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
    showSuccess("Cita programada con éxito.");
    setShowNew(false);
    await loadCitas(clients, services);
  };

  const handleEdit = async (data:{client:Cliente;service:Servicio;fecha:string;hora:string;medio:string;estado:string}) => {
    if(!editCita) return;

    if (data.estado === 'Completada' && (editCita.estadoCita === 'Pendiente' || editCita.estadoCita === 'Confirmada')) {
      const datosCompletos = data.client.nombre && data.client.apellidoPaterno && data.client.apellidoMaterno && data.client.telefono && data.client.tipoSangre && data.client.tipoSangre !== 'No especificado' && data.client.fechaNacimiento && data.client.fechaNacimiento.slice(0,4) !== '0001' && data.client.fechaNacimiento.slice(0,4) !== '2000';
      if (!datosCompletos) {
        const ci = data.client.ci?.toString() ?? '';
        await navigator.clipboard.writeText(ci).catch(() => {});
        throw new Error(
          `No puedes cambiar a Completada porque debes completar los datos del paciente.\n` +
          `Se copió el CI (${ci}) al portapapeles para que lo busques en Pacientes.`
        );
      }
    }

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

    showSuccess("Datos actualizados correctamente.");
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fc-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .fc-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);
        }
        .fc-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          font-size: 14px;
          color: #1A252C;
          background-color: #FFFFFF;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .fc-input:focus {
          border-color: #009688;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.15);
        }
        .fc-table { width: 100%; border-collapse: collapse; text-align: left; }
        .fc-th {
          background-color: #F8FAFC;
          padding: 16px 24px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748B;
          border-bottom: 1px solid #E2E8F0;
          letter-spacing: 0.05em;
        }
        .fc-td {
          padding: 16px 24px;
          font-size: 14px;
          color: #1A252C;
          border-bottom: 1px solid #E2E8F0;
        }
        .fc-tr { transition: background-color 0.15s ease; }
        .fc-tr:hover { background-color: #F8FAFC; }
        .fc-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #009688;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-btn-primary:hover { background-color: #00796B; }
        .fc-btn-primary:active { transform: scale(0.97); }
        .fc-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #FFFFFF;
          color: #009688;
          border: 1px solid #009688;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-btn-outline:hover { background-color: #F8FAFC; }
        .fc-btn-outline:active { transform: scale(0.97); }
        .fc-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #FFFFFF;
          color: #64748B;
          border: 1px solid #E2E8F0;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-btn-ghost:hover { background-color: #F8FAFC; color: #009688; border-color: #009688; }
        .filter-opt:hover { color:#00796B; background-color:#E0F2F1; }
        input:focus, select:focus {
          outline:none;
          border-color:#009688 !important;
          box-shadow:0 0 0 3px rgba(0,150,136,0.15) !important;
        }
      `}</style>

      <div style={{
        fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
        backgroundColor:C.bgPage, minHeight:'100vh', color:C.textMain,
        lineHeight:1.5, WebkitFontSmoothing:'antialiased', padding:'32px',
      }}>

        <div style={{
          maxWidth:1100, margin:'0 auto',
          animation:'fadeIn 0.4s ease-out',
          display:'flex', flexDirection:'column', gap:'24px',
        }}>
          {/* Header */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h1 style={{fontSize:28, fontWeight:700, color:C.textMain, marginBottom:6}}>
                Gesti&oacute;n de Citas
              </h1>
              <p style={{fontSize:15, color:C.textMuted}}>
                Administra y organiza el flujo de pacientes del d&iacute;a.
              </p>
            </div>
            {tab === 'agenda' && (
              <button onClick={()=>setShowNew(true)} className="fc-btn-primary" style={{
                display:'inline-flex', alignItems:'center', gap:8,
                fontSize:14, fontWeight:600, padding:'10px 18px',
                borderRadius:12, border:'none',
                backgroundColor:'#009688', color:'#fff', cursor:'pointer',
                transition:'all 0.2s ease',
              }}>
                + Nueva Cita
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={{
            display:'flex', gap:0,
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
                  color: tab===val ? '#009688' : C.textMuted,
                  borderBottom: tab===val ? `2px solid #009688` : '2px solid transparent',
                  marginBottom:-2,
                  display:'flex', alignItems:'center', gap:7,
                }}
              >
                {lbl}
                <span style={{
                  fontSize:11, fontWeight:700,
                  backgroundColor: tab===val ? '#E0F2F1' : '#F1F5F9',
                  color: tab===val ? '#00796B' : C.textMuted,
                  padding:'1px 7px', borderRadius:99,
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="fc-card" style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            gap:20,
            backgroundColor:'#FFFFFF', padding:'16px 24px',
            borderRadius:16, boxShadow:C.shadowSm,
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
                className="fc-input"
                style={{
                  width:'100%', padding:'10px 14px 10px 48px', fontFamily:'inherit',
                  fontSize:14, border:`1px solid ${C.border}`, borderRadius:12,
                  backgroundColor:'#FFFFFF', color:C.textMain, boxSizing:'border-box',
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
                    fontFamily:'inherit', fontSize:13, fontWeight: dateFilter===f.value?700:500,
                    padding:'6px 14px', borderRadius:12,
                    border: dateFilter===f.value ? '1px solid #009688' : '1px solid #E2E8F0',
                    backgroundColor: dateFilter===f.value ? '#E0F2F1' : '#FFFFFF',
                    color: dateFilter===f.value ? '#00796B' : C.textMuted,
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
                    fontFamily:'inherit', fontSize:13, fontWeight: filter===f.value?700:500,
                    padding:'6px 14px', borderRadius:12,
                    border: filter===f.value ? '1px solid #009688' : '1px solid #E2E8F0',
                    backgroundColor: filter===f.value ? '#E0F2F1' : '#FFFFFF',
                    color: filter===f.value ? '#00796B' : C.textMuted,
                    cursor:'pointer', transition:'all 0.2s ease',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="fc-card" style={{
            backgroundColor:'#FFFFFF', borderRadius:16,
            boxShadow:C.shadowSm, border:`1px solid ${C.border}`, overflow:'hidden',
          }}>
            <table className="fc-table" style={{width:'100%', borderCollapse:'collapse', textAlign:'left'}}>
              <thead>
                <tr>
                  {['Cliente','Fecha & Hora','Servicio','Estado','Acciones'].map((h,i) => (
                    <th key={h} className="fc-th" style={{
                      backgroundColor:'#F8FAFC', padding:'16px 24px',
                      fontSize:11, fontWeight:600, textTransform:'uppercase',
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
                    <td colSpan={5} className="fc-td" style={{padding:40, textAlign:'center', color:C.textMuted, fontStyle:'italic'}}>
                      Cargando citas...
                    </td>
                  </tr>
                ) : filtered.length===0 ? (
                  <tr>
                    <td colSpan={5} className="fc-td" style={{padding:40, textAlign:'center', color:C.textMuted}}>
                      No se encontraron citas.
                    </td>
                  </tr>
                ) : filtered.map(cita => (
                  <tr key={cita.idCita} className="fc-tr" style={{
                    borderBottom:`1px solid ${C.border}`, transition:'background-color 0.15s ease',
                  }}>
                    <td className="fc-td" style={{padding:'16px 24px', verticalAlign:'middle', fontSize:14}}>
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        <Avatar initials={cita.clientFirstChar||'NA'} />
                        <div>
                          <div style={{fontWeight:'bold', color:'#1A252C'}}>{cita.clientName}</div>
                          <div style={{fontSize:12, color:C.textMuted, marginTop:2}}>CI: {cita.clientCi}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fc-td" style={{padding:'16px 24px', verticalAlign:'middle', fontSize:14}}>
                      <div style={{color:C.textMuted}}>{fmtDate(cita.fecha)}</div>
                      <div style={{fontWeight:600, color:'#00796B', marginTop:2, display:'flex', alignItems:'center', gap:6}}>
                        {fmtTime(cita.hora)}
                        {isOverdue(cita.fecha, cita.hora, cita.estadoCita) && (
                          <span title="Esta cita ya pasó su horario y aún no fue cerrada." style={{
                            fontSize:10, fontWeight:700, color:'#B91C1C',
                            backgroundColor:'#FEE2E2', padding:'2px 6px',
                            borderRadius:99, letterSpacing:'0.03em', border:'1px solid #fecaca',
                          }}>
                            Vencida
                          </span>
                        )}
                        {(cita as any).clientDataComplete === false && cita.estadoCita !== 'Completada' && cita.estadoCita !== 'Cancelada' && (
                          <span title="El cliente tiene datos incompletos." style={{
                            fontSize:10, fontWeight:700, color:'#B45309',
                            backgroundColor:'#FEF3C7', padding:'2px 6px',
                            borderRadius:99, letterSpacing:'0.03em', border:'1px solid #fde68a',
                          }}>
                            Datos incompletos
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="fc-td" style={{padding:'16px 24px', verticalAlign:'middle', fontSize:14}}>
                      <span style={{
                        display:'inline-block', padding:'6px 12px', borderRadius:8,
                        backgroundColor:'#F1F5F9', color:C.textMuted, fontSize:13, fontWeight:500,
                      }}>
                        {cita.serviceName}
                      </span>
                    </td>
                    <td className="fc-td" style={{padding:'16px 24px', verticalAlign:'middle'}}>
                      <StatusPill status={cita.estadoCita} />
                    </td>
                    <td className="fc-td" style={{padding:'16px 24px', verticalAlign:'middle', textAlign:'right'}}>
                      <button
                        onClick={()=>setEditCita(cita)}
                        className="fc-btn-outline"
                        style={{
                          display:'inline-flex', alignItems:'center',
                          color:'#009688', backgroundColor:'#FFFFFF',
                          border:'1px solid #009688', fontWeight:600,
                          fontSize:13, padding:'8px 14px', borderRadius:12,
                          cursor:'pointer', transition:'all 0.2s ease',
                          fontFamily:'inherit',
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