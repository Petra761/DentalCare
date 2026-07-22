import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Cita } from '../services/api';
import { Phone, Mail, MapPin, Calendar, Clock, User, Check, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  const location = useLocation();
  const state = location.state as { treatment?: string } | null;

  // Appointment Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [dentista, setDentista] = useState('Dr. Alejandro García (General)');
  const [tratamiento, setTratamiento] = useState('Limpieza y Prevención');
  const [notas, setNotas] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Contact Message Form state
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);

  useEffect(() => {
    if (state?.treatment) {
      setTratamiento(state.treatment);
      // Preselect dentist based on treatment
      if (state.treatment.includes('Ortodoncia')) {
        setDentista('Dra. Patricia Martínez (Ortodoncia)');
      } else if (state.treatment.includes('Odontopediatría')) {
        setDentista('Dr. Roberto López (Odontopediatría)');
      } else {
        setDentista('Dr. Alejandro García (General)');
      }
    }
  }, [state]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload: Omit<Cita, 'id'> = {
        nombrePaciente: nombre,
        emailPaciente: email,
        telefonoPaciente: telefono,
        fecha,
        hora,
        dentistaId: dentista,
        tratamiento,
        notas,
        estado: 'PENDIENTE'
      };

      await apiService.createCita(payload);
      setSuccess(true);
      // Clear form
      setNombre('');
      setEmail('');
      setTelefono('');
      setFecha('');
      setHora('');
      setNotas('');
    } catch (err: any) {
      setError(err.message || 'Error al agendar la cita. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess(true);
    setMsgName('');
    setMsgEmail('');
    setMsgText('');
    setTimeout(() => setMsgSuccess(false), 5000);
  };

  return (
    <div style={styles.page}>
      {/* Banner */}
      <section style={styles.banner}>
        <div className="container">
          <h1 style={styles.bannerTitle}>Contacto y Reservas</h1>
          <p style={styles.bannerSubtitle}>Escríbenos tus dudas o agenda una cita directamente usando nuestro formulario web automatizado.</p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section">
        <div className="container grid grid-2" style={styles.contactGrid}>
          {/* Left Column: Contact details + Message Form */}
          <div style={styles.leftCol}>
            <h2 style={styles.sectionHeading}>Información de Contacto</h2>
            <p style={styles.desc}>Estamos aquí para ayudarte. Ponte en contacto a través de cualquiera de nuestros canales oficiales.</p>
            
            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <div style={styles.iconCircle}><Phone size={20} color="var(--primary-600)" /></div>
                <div>
                  <h4 style={styles.itemTitle}>Teléfono / WhatsApp</h4>
                  <p style={styles.itemVal}>+1 (809) 555-0199</p>
                </div>
              </div>

              <div style={styles.contactItem}>
                <div style={styles.iconCircle}><Mail size={20} color="var(--primary-600)" /></div>
                <div>
                  <h4 style={styles.itemTitle}>Correo Electrónico</h4>
                  <p style={styles.itemVal}>contacto@dentacare.com.do</p>
                </div>
              </div>

              <div style={styles.contactItem}>
                <div style={styles.iconCircle}><MapPin size={20} color="var(--primary-600)" /></div>
                <div>
                  <h4 style={styles.itemTitle}>Ubicación de la Clínica</h4>
                  <p style={styles.itemVal}>Av. Principal #123, Zona Dental, Santo Domingo</p>
                </div>
              </div>
            </div>

            {/* Message Form */}
            <div className="card" style={styles.msgCard}>
              <h3 style={styles.cardHeading}>Envíanos un Mensaje</h3>
              <p style={styles.cardSub}>Responderemos a tus consultas generales en menos de 24 horas hábiles.</p>
              
              {msgSuccess && (
                <div style={styles.successMessage}>
                  <Check size={18} />
                  <span>Mensaje enviado correctamente. ¡Gracias por escribirnos!</span>
                </div>
              )}

              <form onSubmit={handleMessageSubmit} style={{ marginTop: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input 
                    type="text" 
                    required 
                    value={msgName}
                    onChange={(e) => setMsgName(e.target.value)}
                    className="form-control" 
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    value={msgEmail}
                    onChange={(e) => setMsgEmail(e.target.value)}
                    className="form-control" 
                    placeholder="ejemplo@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mensaje o Consulta</label>
                  <textarea 
                    required 
                    rows={4}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="form-control" 
                    placeholder="Escribe tu mensaje aquí..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                  <Send size={16} />
                  Enviar Consulta
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Reservation Form */}
          <div style={styles.rightCol}>
            <div className="card" style={styles.reservationCard}>
              <div style={styles.cardBadge}>
                <Calendar size={14} color="var(--primary-600)" />
                <span>Agendar Cita en Línea</span>
              </div>
              <h2 style={styles.cardTitle}>Reserva tu Consulta</h2>
              <p style={styles.cardDesc}>Completa el formulario y selecciona tu horario preferido. Un asistente de la clínica confirmará tu cita vía telefónica o WhatsApp.</p>

              {success && (
                <div style={styles.successMessage}>
                  <Check size={20} />
                  <div>
                    <strong style={{ display: 'block' }}>¡Cita Solicitada Exitosamente!</strong>
                    <span>Tu cita ha sido registrada como PENDIENTE. Nos comunicaremos contigo a la brevedad. Podrás consultar el estado de tu cita iniciando sesión.</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={styles.errorMessage}>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Nombre Completo</label>
                    <div style={styles.inputWithIcon}>
                      <User size={16} style={styles.inputIcon} />
                      <input 
                        type="text" 
                        required 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="form-control" 
                        style={{ paddingLeft: '2.5rem' }} 
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGrid2}>
                  <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control" 
                      placeholder="juan@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input 
                      type="tel" 
                      required 
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="form-control" 
                      placeholder="809-555-1234"
                    />
                  </div>
                </div>

                <div style={styles.formGrid2}>
                  <div className="form-group">
                    <label className="form-label">Fecha Preferida</label>
                    <div style={styles.inputWithIcon}>
                      <Calendar size={16} style={styles.inputIcon} />
                      <input 
                        type="date" 
                        required 
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="form-control" 
                        style={{ paddingLeft: '2.5rem' }} 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora Preferida</label>
                    <div style={styles.inputWithIcon}>
                      <Clock size={16} style={styles.inputIcon} />
                      <select 
                        required
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        className="form-control" 
                        style={{ paddingLeft: '2.5rem' }}
                      >
                        <option value="">Selecciona hora</option>
                        <option value="08:00">08:00 AM</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tratamiento Deseado</label>
                  <select 
                    value={tratamiento}
                    onChange={(e) => {
                      setTratamiento(e.target.value);
                      // Update dentist automatically
                      if (e.target.value.includes('Ortodoncia')) {
                        setDentista('Dra. Patricia Martínez (Ortodoncia)');
                      } else if (e.target.value.includes('Odontopediatría')) {
                        setDentista('Dr. Roberto López (Odontopediatría)');
                      } else {
                        setDentista('Dr. Alejandro García (General)');
                      }
                    }}
                    className="form-control"
                  >
                    <option value="Limpieza y Prevención">Odontología General y Limpieza</option>
                    <option value="Ortodoncia / Brackets">Ortodoncia (Brackets / Invisalign)</option>
                    <option value="Implantes Dentales">Implantes y Prótesis Dentales</option>
                    <option value="Blanqueamiento / Carillas">Estética Dental (Blanqueamiento)</option>
                    <option value="Odontopediatría">Odontopediatría (Infantil)</option>
                    <option value="Endodoncia / Cirugía">Endodoncia y Tratamiento de Conducto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Especialista Asignado (Basado en Tratamiento)</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={dentista} 
                    className="form-control"
                    style={{ backgroundColor: 'var(--bg-secondary)', fontWeight: 600 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notas Adicionales (Opcional)</label>
                  <textarea 
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="form-control" 
                    placeholder="Detalles sobre tu dolor, urgencia o condiciones de salud..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                >
                  {loading ? 'Procesando...' : 'Solicitar Reserva'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
  },
  banner: {
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(99, 102, 241, 0.03) 100%)',
    padding: '4rem 0',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  bannerTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  bannerSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    maxWidth: '700px',
    margin: '0 auto',
  },
  contactGrid: {
    alignItems: 'start',
    gap: '3rem',
  },
  leftCol: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeading: {
    fontSize: '2rem',
    fontWeight: 700,
  },
  desc: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    margin: '1rem 0',
  },
  contactItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  iconCircle: {
    width: '2.75rem',
    height: '2.75rem',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.15rem',
  },
  itemVal: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  msgCard: {
    padding: '2rem',
    marginTop: '1.5rem',
  },
  cardHeading: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  cardSub: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  successMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--success)',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    marginBottom: '1rem',
    textAlign: 'left',
  },
  rightCol: {
    display: 'flex',
    justifyContent: 'stretch',
  },
  reservationCard: {
    padding: '3rem 2.5rem',
    width: '100%',
    textAlign: 'left',
  },
  cardBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--primary-50)',
    color: 'var(--primary-700)',
    padding: '0.3rem 0.8rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  inputWithIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  }
};
