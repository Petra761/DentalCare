import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Usuario, Cita } from '../services/api';
import { 
  Users, Calendar, Check, X, Shield, Plus, Edit, Trash2, 
  Clock, UserCheck, RefreshCw 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isDentist, isPatient, isMockMode } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'citas' | 'usuarios'>('citas');

  // State for Users List
  const [users, setUsers] = useState<Usuario[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // State for Appointments List
  const [citas, setCitas] = useState<Cita[]>([]);
  const [citasLoading, setCitasLoading] = useState(false);
  const [citasError, setCitasError] = useState('');

  // User Form Modal / Overlay State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombreUsuario, setFormNombreUsuario] = useState('');
  const [formContrasena, setFormContrasena] = useState('');
  const [formIdRol, setFormIdRol] = useState<number>(3); // Paciente by default
  const [formEstado, setFormEstado] = useState('ACTIVO');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Quick stats
  const [stats, setStats] = useState({
    totalCitas: 0,
    pendientes: 0,
    usuariosActivos: 0
  });

  // Load Data
  const loadData = async () => {
    if (!user) return;
    
    // Load appointments
    setCitasLoading(true);
    try {
      const data = await apiService.getCitas();
      // If patient, filter appointments by their name or email or return all for admin
      if (isPatient) {
        const filtered = data.filter(c => 
          c.nombrePaciente.toLowerCase().includes(user.nombreUsuario.toLowerCase()) || 
          c.emailPaciente.toLowerCase().includes(user.nombreUsuario.toLowerCase())
        );
        setCitas(filtered);
      } else {
        setCitas(data);
      }
      setCitasError('');
    } catch (err) {
      setCitasError('Error al cargar las citas.');
    } finally {
      setCitasLoading(false);
    }

    // Load users if admin/dentist
    if (isAdmin || isDentist) {
      setUsersLoading(true);
      try {
        const data = await apiService.getUsuarios();
        setUsers(data);
        setUsersError('');
      } catch (err) {
        setUsersError('Error al cargar los usuarios del backend.');
      } finally {
        setUsersLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  // Recalculate stats whenever lists change
  useEffect(() => {
    setStats({
      totalCitas: citas.length,
      pendientes: citas.filter(c => c.estado === 'PENDIENTE').length,
      usuariosActivos: users.filter(u => u.estado === 'ACTIVO').length || 3 // default fallback
    });
  }, [citas, users]);

  // Handle appointment status change
  const handleCitaStatus = async (citaId: string, nuevoEstado: Cita['estado']) => {
    try {
      await apiService.updateCita(citaId, { estado: nuevoEstado });
      await loadData();
    } catch (err) {
      alert('Error al actualizar el estado de la cita.');
    }
  };

  // Handle appointment delete
  const handleCitaDelete = async (citaId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva de cita?')) {
      try {
        await apiService.deleteCita(citaId);
        await loadData();
      } catch (err) {
        alert('Error al eliminar la cita.');
      }
    }
  };

  // Open modal to Create User
  const openCreateUserModal = () => {
    setEditingUser(null);
    setFormCodigo('USR' + Math.floor(100 + Math.random() * 900));
    setFormNombreUsuario('');
    setFormContrasena('');
    setFormIdRol(3);
    setFormEstado('ACTIVO');
    setFormError('');
    setFormSuccess('');
    setShowUserModal(true);
  };

  // Open modal to Edit User
  const openEditUserModal = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormCodigo(usuario.codigo);
    setFormNombreUsuario(usuario.nombreUsuario);
    setFormContrasena(usuario.contrasena);
    setFormIdRol(usuario.idRol);
    setFormEstado(usuario.estado);
    setFormError('');
    setFormSuccess('');
    setShowUserModal(true);
  };

  // Handle user submit (Create or Update)
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const payload: Usuario = {
      codigo: formCodigo,
      nombreUsuario: formNombreUsuario,
      contrasena: formContrasena,
      idRol: Number(formIdRol),
      estado: formEstado
    };

    try {
      if (editingUser && editingUser.id !== undefined) {
        await apiService.updateUsuario(editingUser.id, payload);
        setFormSuccess('Usuario actualizado correctamente.');
      } else {
        await apiService.createUsuario(payload);
        setFormSuccess('Usuario creado correctamente.');
      }
      
      // Reload and close modal after a short delay
      await loadData();
      setTimeout(() => setShowUserModal(false), 1500);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el usuario en el backend.');
    }
  };

  // Handle user delete
  const handleUserDelete = async (id?: number) => {
    if (id === undefined) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario del backend?')) {
      try {
        await apiService.deleteUsuario(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el usuario.');
      }
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw className="animate-spin" size={32} color="var(--primary-500)" />
        <p>Cargando panel...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top Banner Dashboard */}
      <section style={styles.dashboardHeader}>
        <div className="container" style={styles.headerFlex}>
          <div style={styles.headerInfo}>
            <div style={styles.roleBadge}>
              <Shield size={14} />
              <span>Panel de {user.rol}</span>
            </div>
            <h1 style={styles.welcomeText}>Bienvenido, {user.nombreUsuario}</h1>
            <p style={styles.codeText}>Código de Identificación: <strong>{user.codigo}</strong></p>
          </div>
          <div style={styles.headerActions}>
            {isMockMode && (
              <span style={styles.mockModeBadge}>Modo Offline (LocalStorage)</span>
            )}
            <button onClick={loadData} className="btn btn-secondary btn-sm" style={styles.refreshBtn}>
              <RefreshCw size={16} />
              Actualizar Datos
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section style={styles.statsSection}>
        <div className="container grid grid-3">
          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIconCircle, backgroundColor: 'var(--primary-100)' }}>
              <Calendar size={20} color="var(--primary-700)" />
            </div>
            <div>
              <span style={styles.statValue}>{stats.totalCitas}</span>
              <p style={styles.statName}>Citas registradas</p>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIconCircle, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Clock size={20} color="var(--warning)" />
            </div>
            <div>
              <span style={styles.statValue}>{stats.pendientes}</span>
              <p style={styles.statName}>Citas Pendientes</p>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIconCircle, backgroundColor: 'var(--secondary-50)' }}>
              <Users size={20} color="var(--secondary-600)" />
            </div>
            <div>
              <span style={styles.statValue}>{stats.usuariosActivos}</span>
              <p style={styles.statName}>Usuarios activos en DB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Selector for Admin/Dentist */}
      {(isAdmin || isDentist) && (
        <section style={styles.tabsSection}>
          <div className="container" style={styles.tabsContainer}>
            <button 
              onClick={() => setActiveTab('citas')} 
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'citas' ? styles.tabBtnActive : {})
              }}
            >
              <Calendar size={18} />
              Gestionar Citas
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')} 
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'usuarios' ? styles.tabBtnActive : {})
              }}
            >
              <Users size={18} />
              Gestionar Usuarios (.NET DB)
            </button>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          {/* TAB: CITAS */}
          {((isAdmin || isDentist) && activeTab === 'citas') || isPatient ? (
            <div className="card" style={styles.contentCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.cardTitle}>Listado de Citas</h3>
                  <p style={styles.cardSub}>
                    {isPatient 
                      ? 'Aquí puedes ver las citas agendadas asociadas a tu cuenta.' 
                      : 'Administra y cambia el estado de las citas solicitadas por los pacientes.'}
                  </p>
                </div>
                {isPatient && (
                  <button onClick={() => navigate('/contacto')} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Agendar Nueva Cita
                  </button>
                )}
              </div>

              {citasLoading ? (
                <div style={styles.tableMessage}>Cargando citas...</div>
              ) : citasError ? (
                <div style={styles.tableMessageError}>{citasError}</div>
              ) : citas.length === 0 ? (
                <div style={styles.tableMessage}>No hay citas registradas en el sistema.</div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={styles.th}>Paciente</th>
                        <th style={styles.th}>Contacto</th>
                        <th style={styles.th}>Fecha / Hora</th>
                        <th style={styles.th}>Especialista y Tratamiento</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map((cita) => (
                        <tr key={cita.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <strong>{cita.nombrePaciente}</strong>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '0.85rem' }}>{cita.emailPaciente}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cita.telefonoPaciente}</div>
                          </td>
                          <td style={styles.td}>
                            <div>{cita.fecha}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cita.hora}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cita.tratamiento}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}>{cita.dentistaId}</div>
                          </td>
                          <td style={styles.td}>
                            <span className={`badge ${
                              cita.estado === 'CONFIRMADA' ? 'badge-success' :
                              cita.estado === 'PENDIENTE' ? 'badge-warning' :
                              cita.estado === 'COMPLETADA' ? 'badge-primary' : 'badge-error'
                            }`}>
                              {cita.estado}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.actionsCell}>
                              {!(isPatient) && (
                                <>
                                  {cita.estado === 'PENDIENTE' && (
                                    <button 
                                      onClick={() => handleCitaStatus(cita.id, 'CONFIRMADA')} 
                                      style={styles.actionBtnConfirm}
                                      title="Confirmar Cita"
                                    >
                                      <Check size={16} />
                                    </button>
                                  )}
                                  {cita.estado === 'CONFIRMADA' && (
                                    <button 
                                      onClick={() => handleCitaStatus(cita.id, 'COMPLETADA')} 
                                      style={styles.actionBtnComplete}
                                      title="Completar Tratamiento"
                                    >
                                      <UserCheck size={16} />
                                    </button>
                                  )}
                                  {cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && (
                                    <button 
                                      onClick={() => handleCitaStatus(cita.id, 'CANCELADA')} 
                                      style={styles.actionBtnCancel}
                                      title="Cancelar Cita"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                </>
                              )}
                              <button 
                                onClick={() => handleCitaDelete(cita.id)} 
                                style={styles.actionBtnDelete}
                                title="Eliminar Cita"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {/* TAB: USUARIOS (.NET Backend Integration) */}
          {(isAdmin || isDentist) && activeTab === 'usuarios' ? (
            <div className="card" style={styles.contentCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.cardTitle}>Gestión de Usuarios</h3>
                  <p style={styles.cardSub}>
                    Crea, edita, elimina y visualiza los usuarios directamente sincronizados en el backend de C#.
                  </p>
                </div>
                <button onClick={openCreateUserModal} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Crear Nuevo Usuario
                </button>
              </div>

              {usersLoading ? (
                <div style={styles.tableMessage}>Cargando usuarios...</div>
              ) : usersError ? (
                <div style={styles.tableMessageError}>{usersError}</div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Código</th>
                        <th style={styles.th}>Nombre de Usuario</th>
                        <th style={styles.th}>Rol Asignado</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.td}>{item.id}</td>
                          <td style={styles.td}><strong>{item.codigo}</strong></td>
                          <td style={styles.td}>{item.nombreUsuario}</td>
                          <td style={styles.td}>
                            <span style={styles.roleLabel}>{item.rol || 'Paciente'}</span>
                          </td>
                          <td style={styles.td}>
                            <span className={`badge ${item.estado === 'ACTIVO' ? 'badge-success' : 'badge-error'}`}>
                              {item.estado}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.actionsCell}>
                              <button 
                                onClick={() => openEditUserModal(item)} 
                                style={styles.actionBtnEdit}
                                title="Editar Usuario"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleUserDelete(item.id)} 
                                style={styles.actionBtnDelete}
                                title="Eliminar Usuario de DB"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* USER FORM MODAL OVERLAY */}
      {showUserModal && (
        <div style={styles.modalOverlay}>
          <div className="card animate-fade-in" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowUserModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={styles.errorMessage}>
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div style={styles.successMessage}>
                <Check size={18} />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código de Usuario</label>
                <input 
                  type="text" 
                  required 
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value)}
                  className="form-control"
                  placeholder="ej. ADM004"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de Usuario</label>
                <input 
                  type="text" 
                  required 
                  value={formNombreUsuario}
                  onChange={(e) => setFormNombreUsuario(e.target.value)}
                  className="form-control"
                  placeholder="ej. carlosodonto"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input 
                  type="text" 
                  required 
                  value={formContrasena}
                  onChange={(e) => setFormContrasena(e.target.value)}
                  className="form-control"
                  placeholder="Clave de acceso"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol del Usuario</label>
                <select 
                  value={formIdRol}
                  onChange={(e) => setFormIdRol(Number(e.target.value))}
                  className="form-control"
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Dentista</option>
                  <option value={3}>Paciente</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select 
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="form-control"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                {editingUser ? 'Guardar Cambios' : 'Registrar en Base de Datos'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'var(--bg-secondary)',
    minHeight: '80vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    height: '60vh',
    fontSize: '1.1rem',
  },
  dashboardHeader: {
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '3rem 0',
  },
  headerFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  headerInfo: {},
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--secondary-50)',
    color: 'var(--secondary-600)',
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
  },
  welcomeText: {
    fontSize: '2rem',
    fontWeight: 800,
  },
  codeText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  mockModeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: 'var(--warning)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  statsSection: {
    padding: '2.5rem 0 1.5rem 0',
  },
  statCard: {
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  statIconCircle: {
    width: '3.25rem',
    height: '3.25rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    lineHeight: '1',
    color: 'var(--text-primary)',
    display: 'block',
    fontFamily: 'var(--font-heading)',
  },
  statName: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginTop: '0.25rem',
  },
  tabsSection: {
    padding: '1rem 0',
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all var(--transition-fast)',
  },
  tabBtnActive: {
    color: 'var(--primary-600)',
    borderBottomColor: 'var(--primary-500)',
  },
  contentCard: {
    padding: '2.5rem',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  cardSub: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '2px solid var(--border-color)',
  },
  th: {
    padding: '1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-fast)',
  },
  td: {
    padding: '1.25rem 1rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  actionsCell: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtnConfirm: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--success)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnComplete: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'var(--primary-50)',
    color: 'var(--primary-700)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnCancel: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEdit: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDelete: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableMessage: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  tableMessageError: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--error)',
    fontSize: '0.95rem',
  },
  roleLabel: {
    fontWeight: 600,
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '1.5rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '460px',
    padding: '2.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: 800,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  successMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--success)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    fontSize: '0.85rem',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    marginBottom: '1rem',
  }
};
