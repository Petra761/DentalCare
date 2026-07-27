import React, { useState, useEffect, useRef } from 'react';
import type { Cliente, Servicio, Categoria } from '../services/api';

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

const Lbl: React.FC<{children:React.ReactNode}> = ({children}) => (
  <label style={{display:'block',fontSize:13,fontWeight:600,color:C.textMain,marginBottom:8}}>
    {children}
  </label>
);

const inputSt: React.CSSProperties = {
  width:'100%', padding:'12px 14px', fontFamily:'inherit',
  fontSize:14, border:`1px solid ${C.border}`, borderRadius:8,
  backgroundColor:'#F8FAFC', color:C.textMain, boxSizing:'border-box',
  outline:'none', transition:'all 0.15s ease',
};

const inputRO: React.CSSProperties = {
  ...inputSt, backgroundColor:'#F1F5F9',
  color:C.textMuted, cursor:'not-allowed',
};

const errSt: React.CSSProperties = {
  display:'block', fontSize:12, color:'#C62828', marginTop:4,
};

const ESTADOS = ['Pendiente','Confirmada','Cancelada','Completada'];
const MEDIOS  = ['Recepción','Teléfono'];

const getSlots = (service: Servicio | null) => {
  let durMin = 30;
  if (service?.duracion) {
    const [h,m] = service.duracion.split(':').map(Number);
    durMin = h*60 + m;
  }
  const slots: string[] = [];
  const max = 18*60 - durMin;
  for (let t=8*60; t<=max; t+=30) {
    const hh = Math.floor(t/60).toString().padStart(2,'0');
    const mm = (t%60).toString().padStart(2,'0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
};

interface ApptFormProps {
  clientes:   Cliente[];
  categorias: Categoria[];
  servicios:  Servicio[];
  initial?: {
    client:   Cliente | null;
    service:  Servicio | null;
    fecha:    string;
    hora:     string;
    medio:    string;
    estado:   string;
  };
  onCancel: () => void;
  onSubmit: (data:{
    client:  Cliente;
    service: Servicio;
    fecha:   string;
    hora:    string;
    medio:   string;
    estado:  string;
  }) => Promise<void>;
  submitLabel: string;
  showEstado:  boolean;
}

export const ApptForm: React.FC<ApptFormProps> = ({
  clientes, categorias, servicios, initial, onCancel, onSubmit, submitLabel, showEstado,
}) => {
  const [search,        setSearch]        = useState(initial?.client
    ? `${initial.client.nombre} ${initial.client.apellidoPaterno} ${initial.client.apellidoMaterno} (CI: ${initial.client.ci})`
    : '');
  const [selectedClient,  setSelectedClient]  = useState<Cliente|null>(initial?.client ?? null);
  const [suggestions,     setSuggestions]     = useState<Cliente[]>([]);
  const [showSugg,        setShowSugg]        = useState(false);
  const [selectedService, setSelectedService] = useState<Servicio|null>(initial?.service ?? null);
  const [fecha,           setFecha]           = useState(initial?.fecha ?? new Date().toISOString().split('T')[0]);
  const [hora,            setHora]            = useState(initial?.hora ? initial.hora.slice(0,5) : '');
  const [medio,           setMedio]           = useState(initial?.medio ?? 'WhatsApp');
  const [estado,          setEstado]          = useState(initial?.estado ?? 'Pendiente');
  const [fechaErr,        setFechaErr]        = useState('');
  const [saving,          setSaving]          = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e:MouseEvent) => {
      if(ref.current && !ref.current.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e:React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v); setSelectedClient(null);
    if(v.trim().length < 2){ setSuggestions([]); setShowSugg(false); return; }
    const q = v.toLowerCase().trim();
    setSuggestions(
      clientes.filter(c => {
        const full = `${c.nombre} ${c.apellidoPaterno} ${c.apellidoMaterno}`.toLowerCase();
        return c.ci.toString().includes(q) || full.includes(q);
      }).slice(0,6)
    );
    setShowSugg(true);
  };

  const pickClient = (c:Cliente) => {
    setSelectedClient(c);
    setSearch(`${c.nombre} ${c.apellidoPaterno} ${c.apellidoMaterno} (CI: ${c.ci})`);
    setShowSugg(false);
  };

  const handleDate = (e:React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
    const today = new Date().toISOString().split('T')[0];
    setFechaErr(e.target.value < today ? 'La fecha no puede ser anterior al día actual.' : '');
  };

  const handleSvc = (e:React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(servicios.find(s => s.idServicio === parseInt(e.target.value,10)) || null);
    setHora('');
  };

  const slots = getSlots(selectedService);
  const valid = selectedClient && selectedService && fecha && !fechaErr && hora && medio && estado;

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!valid) return;
    setSaving(true);
    try {
      await onSubmit({ client:selectedClient!, service:selectedService!, fecha, hora, medio, estado });
    } catch(err:any){
      alert(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{padding:'28px', display:'flex', flexDirection:'column', gap:20}}>
      {/* Search patient */}
      <div ref={ref} style={{position:'relative'}}>
        <Lbl>Buscar Paciente / CI</Lbl>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:C.textLight,fontSize:14}}>
            🔍
          </span>
          <input
            type="text" value={search} onChange={handleSearch}
            placeholder="Ej: 17263544 o Juan Pérez"
            style={{...inputSt, paddingLeft:40}}
          />
        </div>
        {showSugg && (
          <ul style={{
            position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
            backgroundColor:'#fff', border:`1px solid ${C.border}`, borderRadius:8,
            boxShadow:C.shadowLg, zIndex:1010, maxHeight:200, overflowY:'auto',
            listStyle:'none', margin:'0', padding:0,
          }}>
            {suggestions.length===0
              ? <li style={{padding:'10px 14px',fontSize:13,color:C.textMuted,fontStyle:'italic'}}>Paciente no encontrado.</li>
              : suggestions.map(c => (
                <li key={c.idCliente} onClick={()=>pickClient(c)} style={{
                  padding:'10px 14px', fontSize:13, cursor:'pointer',
                  borderBottom:`1px solid #F1F5F9`, color:C.textMain,
                }}>
                  <strong>{c.nombre} {c.apellidoPaterno} {c.apellidoMaterno}</strong>
                  <span style={{color:C.textMuted,marginLeft:6}}> · CI: {c.ci}</span>
                </li>
              ))
            }
          </ul>
        )}
        {!selectedClient && search.trim().length>=2 && suggestions.length===0 && (
          <span style={errSt}>Paciente no encontrado.</span>
        )}
      </div>

      {/* Full name readonly */}
      <div>
        <Lbl>Nombre Completo</Lbl>
        <input type="text" readOnly
          value={selectedClient ? `${selectedClient.nombre} ${selectedClient.apellidoPaterno} ${selectedClient.apellidoMaterno}` : ''}
          placeholder="Se llena automáticamente al seleccionar un paciente"
          style={inputRO}
        />
      </div>

      {/* Service */}
      <div>
        <Lbl>Seleccionar Servicio</Lbl>
        <select value={selectedService?.idServicio ?? ''} onChange={handleSvc} required style={inputSt}>
          <option value="" disabled>Elegir especialidad...</option>
          {(() => {
            const grouped = new Map<string, Servicio[]>();
            servicios.forEach(s => {
              const cat = categorias.find(c => c.idCategoria === s.idCategoria);
              const catName = cat?.nombre ?? 'Sin categoría';
              if (!grouped.has(catName)) grouped.set(catName, []);
              grouped.get(catName)!.push(s);
            });
            const opts: React.ReactNode[] = [];
            grouped.forEach((svcs, catName) => {
              opts.push(
                <optgroup key={catName} label={catName}>
                  {svcs.map(s => (
                    <option key={s.idServicio} value={s.idServicio}>
                      {s.nombre} ({s.duracion.slice(0,5)})
                    </option>
                  ))}
                </optgroup>
              );
            });
            return opts;
          })()}
        </select>
      </div>

      {/* Date + Time row */}
      <div style={{display:'flex', gap:16}}>
        <div style={{flex:1}}>
          <Lbl>Fecha</Lbl>
          <input type="date" value={fecha} onChange={handleDate} required style={inputSt} />
          {fechaErr && <span style={errSt}>{fechaErr}</span>}
        </div>
        <div style={{flex:1}}>
          <Lbl>Hora</Lbl>
          <select
            value={hora}
            onChange={e=>setHora(e.target.value)}
            required
            disabled={!selectedClient || !selectedService}
            style={{
              ...inputSt,
              ...(!selectedClient || !selectedService ? {
                backgroundColor:'#F1F5F9',
                color: C.textLight,
                cursor:'not-allowed',
                borderStyle:'dashed',
              } : {}),
            }}
          >
            <option value="" disabled>Elegir hora...</option>
            {slots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {!selectedClient && (
            <span style={{
              display:'flex', alignItems:'center', gap:4,
              fontSize:12, color:'#00796B', marginTop:5, fontWeight:500,
            }}>
              ⬆ Primero selecciona al paciente
            </span>
          )}
          {selectedClient && !selectedService && (
            <span style={{
              display:'flex', alignItems:'center', gap:4,
              fontSize:12, color:'#00796B', marginTop:5, fontWeight:500,
            }}>
              ⬆ Luego selecciona el tratamiento
            </span>
          )}
          {selectedClient && selectedService && slots.length === 0 && (
            <span style={errSt}>Sin horarios disponibles para esta duración.</span>
          )}
        </div>
      </div>

      {/* Communication medium */}
      <div>
        <Lbl>Medio de Comunicación</Lbl>
        <select value={medio} onChange={e=>setMedio(e.target.value)} required style={inputSt}>
          {MEDIOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Status */}
      {showEstado ? (
        <div>
          <Lbl>Estado de la Cita</Lbl>
          <select value={estado} onChange={e=>setEstado(e.target.value)} required style={inputSt}>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <Lbl>Estado de la Cita</Lbl>
          <input type="text" readOnly value="Pendiente" style={inputRO} />
        </div>
      )}

      {/* Footer buttons */}
      <div style={{display:'flex', justifyContent:'flex-end', gap:12, marginTop:8}}>
        <button type="button" onClick={onCancel} disabled={saving} style={{
          display:'inline-flex', alignItems:'center', gap:8,
          fontSize:14, fontWeight:600, padding:'10px 20px',
          borderRadius:8, border:`1px solid ${C.border}`,
          backgroundColor:'#fff', color:C.textMuted,
          cursor:'pointer',
        }}>
          Cancelar
        </button>
        <button type="submit" disabled={!valid || saving} style={{
          display:'inline-flex', alignItems:'center', gap:8,
          fontSize:14, fontWeight:600, padding:'10px 20px',
          borderRadius:8, border:'1px solid transparent',
          backgroundColor: (valid && !saving) ? C.primaryDark : C.textLight,
          color:'#fff',
          cursor: (valid && !saving) ? 'pointer' : 'not-allowed',
          transition:'all 0.2s ease',
        }}>
          ✓ {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
