const BASE_URL = 'http://localhost:5020/api';

export interface Rol {
  id: number;
  nombre: string;
  estado: string;
}

export interface Usuario {
  id?: number;
  idRol: number;
  codigo: string;
  nombreUsuario: string;
  contrasena: string;
  estado: string;
  rol?: string; // Derived or included
}

export interface Cita {
  id: string;
  nombrePaciente: string;
  emailPaciente: string;
  telefonoPaciente: string;
  fecha: string;
  hora: string;
  dentistaId: string;
  tratamiento: string;
  notas?: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
}

export interface Cliente {
  idCliente: number;
  ci: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoSangre: string;
  telefono: string;
  fechaNacimiento: string;
  estado: string;
}

export interface Categoria {
  idCategoria: number;
  codigo: string;
  nombre: string;
  estado: string;
}

export interface Servicio {
  idServicio: number;
  idCategoria: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  estadoServicio: string;
  estado: string;
}

export interface DbCita {
  idCita: number;
  idCliente: number;
  idUsuario: number;
  codigo: string;
  medioComunicacion: string;
  fecha: string;
  hora: string;
  estadoCita: string;
  estado: string;
  clientName?: string;
  clientCi?: string;
  clientFirstChar?: string;
  serviceName?: string;
}

export interface DetalleCita {
  idDetalleCita: number;
  idCita: number;
  idServicio: number;
}

export interface NuevaCitaDto {
  idCliente: number;
  idUsuario: number;
  medioComunicacion: string;
  fecha: string;
  hora: string;
  idServicio: number;
  /** Estado inicial: Pendiente | Confirmada | Cancelada | Completada */
  estadoCita?: string;
}


// Initial Mock Data
const MOCK_ROLES: Rol[] = [
  { id: 1, nombre: 'Administrador', estado: 'ACTIVO' },
  { id: 2, nombre: 'Dentista', estado: 'ACTIVO' },
  { id: 3, nombre: 'Paciente', estado: 'ACTIVO' }
];

const MOCK_USUARIOS: Usuario[] = [
  { id: 1, idRol: 1, codigo: 'ADM001', nombreUsuario: 'admin', contrasena: 'admin123', estado: 'ACTIVO', rol: 'Administrador' },
  { id: 2, idRol: 2, codigo: 'DEN001', nombreUsuario: 'dr.garcia', contrasena: 'dentista123', estado: 'ACTIVO', rol: 'Dentista' },
  { id: 3, idRol: 3, codigo: 'PAC001', nombreUsuario: 'paciente1', contrasena: 'paciente123', estado: 'ACTIVO', rol: 'Paciente' }
];

const MOCK_CITAS: Cita[] = [
  {
    id: '1',
    nombrePaciente: 'Juan Pérez',
    emailPaciente: 'juan.perez@email.com',
    telefonoPaciente: '555-1234',
    fecha: '2026-07-20',
    hora: '09:00',
    dentistaId: 'Dr. García (Odontología General)',
    tratamiento: 'Limpieza y Prevención',
    notas: 'Paciente con sensibilidad dental',
    estado: 'CONFIRMADA'
  },
  {
    id: '2',
    nombrePaciente: 'María López',
    emailPaciente: 'maria.lopez@email.com',
    telefonoPaciente: '555-5678',
    fecha: '2026-07-20',
    hora: '11:30',
    dentistaId: 'Dra. Martínez (Ortodoncia)',
    tratamiento: 'Ortodoncia / Brackets',
    notas: 'Ajuste mensual de brackets',
    estado: 'PENDIENTE'
  }
];

// Helper to determine if we are in mock mode
let isMockMode = false;

async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/Usuarios`, {
      method: 'GET',
      signal: AbortSignal.timeout(1000) // 1 second timeout
    });
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  }
}

// Check initial health and set mode
checkApiHealth().then(healthy => {
  isMockMode = !healthy;
  if (isMockMode) {
    console.warn('Backend offline or unreachable. Running in MOCK MODE.');
    // Initialize localStorage with mock data if not present
    if (!localStorage.getItem('dental_users')) {
      localStorage.setItem('dental_users', JSON.stringify(MOCK_USUARIOS));
    }
    if (!localStorage.getItem('dental_citas')) {
      localStorage.setItem('dental_citas', JSON.stringify(MOCK_CITAS));
    }
  } else {
    console.log('Connected to C# Backend API.');
  }
});

// Getter and Setter for mock DB
const getLocalUsers = (): Usuario[] => {
  const data = localStorage.getItem('dental_users');
  return data ? JSON.parse(data) : MOCK_USUARIOS;
};

const saveLocalUsers = (users: Usuario[]) => {
  localStorage.setItem('dental_users', JSON.stringify(users));
};

const getLocalCitas = (): Cita[] => {
  const data = localStorage.getItem('dental_citas');
  return data ? JSON.parse(data) : MOCK_CITAS;
};

const saveLocalCitas = (citas: Cita[]) => {
  localStorage.setItem('dental_citas', JSON.stringify(citas));
};

const getHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { ...extraHeaders };
  if (!isMockMode) {
    const token = localStorage.getItem('dental_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const getJsonHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  return getHeaders({ 'Content-Type': 'application/json', ...extraHeaders });
};

export const apiService = {
  isMock(): boolean {
    return isMockMode;
  },

  setMockMode(val: boolean) {
    isMockMode = val;
    if (val) {
      if (!localStorage.getItem('dental_users')) saveLocalUsers(MOCK_USUARIOS);
      if (!localStorage.getItem('dental_citas')) saveLocalCitas(MOCK_CITAS);
    }
  },

  // GET ALL ROLES
  async getRoles(): Promise<Rol[]> {
    if (isMockMode) {
      return MOCK_ROLES;
    }

    const res = await fetch(`${BASE_URL}/Roles`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener los roles');
    const roles = await res.json();
    return roles.map((r: any) => ({
      id: r.idRol,
      nombre: r.nombre,
      estado: r.estado
    }));
  },

  // LOGIN
  async login(nombreUsuario: string, contrasena: string) {
    if (isMockMode) {
      const users = getLocalUsers();
      const user = users.find(u => u.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase() && u.contrasena === contrasena);
      if (!user) {
        throw new Error('Usuario o contraseña incorrectos.');
      }
      if (user.estado !== 'ACTIVO') {
        throw new Error('El usuario está inactivo.');
      }
      return {
        mensaje: 'Inicio de sesión exitoso (MOCK).',
        token: 'mock-jwt-token-xyz',
        usuario: {
          id: user.id,
          codigo: user.codigo,
          nombreUsuario: user.nombreUsuario,
          idRol: user.idRol,
          rol: user.rol || MOCK_ROLES.find(r => r.id === user.idRol)?.nombre || 'Paciente',
          estado: user.estado
        }
      };
    }

    const res = await fetch(`${BASE_URL}/Usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreUsuario, contrasena })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ mensaje: 'Error al iniciar sesión' }));
      throw new Error(errData.mensaje || 'Error de credenciales');
    }

    const data = await res.json();
    return {
      mensaje: data.mensaje,
      token: data.token,
      usuario: {
        id: data.usuario.idUsuario,
        codigo: data.usuario.codigo,
        nombreUsuario: data.usuario.nombreUsuario,
        idRol: data.usuario.idRol,
        rol: data.usuario.rol,
        estado: data.usuario.estado
      }
    };
  },

  // GET ALL USERS
  async getUsuarios(): Promise<Usuario[]> {
    if (isMockMode) {
      return getLocalUsers().filter(u => u.estado?.toUpperCase() === 'ACTIVO');
    }

    const res = await fetch(`${BASE_URL}/Usuarios`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener los usuarios');
    const users: any[] = await res.json();
    return users.map(u => ({
      id: u.idUsuario,
      idRol: u.idRol,
      codigo: u.codigo,
      nombreUsuario: u.nombreUsuario,
      contrasena: u.contrasena || '',
      estado: u.estado,
      rol: u.rolNombre || (u.idRol === 1 ? 'Administrador' : u.idRol === 2 ? 'Dentista' : 'Paciente')
    }));
  },

  // GET USER BY ID
  async getUsuario(id: number): Promise<Usuario> {
    if (isMockMode) {
      const users = getLocalUsers();
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('Usuario no encontrado');
      return user;
    }

    const res = await fetch(`${BASE_URL}/Usuarios/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener el usuario');
    const u = await res.json();
    return {
      id: u.idUsuario,
      idRol: u.idRol,
      codigo: u.codigo,
      nombreUsuario: u.nombreUsuario,
      contrasena: u.contrasena || '',
      estado: u.estado,
      rol: u.rolNombre || (u.idRol === 1 ? 'Administrador' : u.idRol === 2 ? 'Dentista' : 'Paciente')
    };
  },

  // CREATE USER (REGISTER/ADD)
  async createUsuario(usuario: Usuario): Promise<Usuario> {
    if (isMockMode) {
      const users = getLocalUsers();
      const exists = users.some(u => u.nombreUsuario.toLowerCase() === usuario.nombreUsuario.toLowerCase() && u.estado?.toUpperCase() === 'ACTIVO');
      if (exists) {
        throw new Error('El nombre de usuario ya está registrado.');
      }
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
      const newUsuario = {
        ...usuario,
        id: newId,
        rol: usuario.idRol === 1 ? 'Administrador' : usuario.idRol === 2 ? 'Dentista' : 'Paciente'
      };
      users.push(newUsuario);
      saveLocalUsers(users);
      return newUsuario;
    }

    const res = await fetch(`${BASE_URL}/Usuarios`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify({
        idUsuario: usuario.id || 0,
        idRol: usuario.idRol,
        codigo: usuario.codigo,
        nombreUsuario: usuario.nombreUsuario,
        contrasena: usuario.contrasena,
        estado: usuario.estado
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Error al crear el usuario');
    }
    const u = await res.json();
    return {
      id: u.idUsuario,
      idRol: u.idRol,
      codigo: u.codigo,
      nombreUsuario: u.nombreUsuario,
      contrasena: u.contrasena || '',
      estado: u.estado,
      rol: u.rolNombre || (u.idRol === 1 ? 'Administrador' : u.idRol === 2 ? 'Dentista' : 'Paciente')
    };
  },

  // UPDATE USER
  async updateUsuario(id: number, usuario: Usuario): Promise<void> {
    if (isMockMode) {
      const users = getLocalUsers();
      const exists = users.some(u => u.nombreUsuario.toLowerCase() === usuario.nombreUsuario.toLowerCase() && u.id !== id && u.estado?.toUpperCase() === 'ACTIVO');
      if (exists) {
        throw new Error('El nombre de usuario ya está registrado.');
      }
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('Usuario no encontrado');
      users[idx] = {
        ...usuario,
        id,
        rol: usuario.idRol === 1 ? 'Administrador' : usuario.idRol === 2 ? 'Dentista' : 'Paciente'
      };
      saveLocalUsers(users);
      return;
    }

    const res = await fetch(`${BASE_URL}/Usuarios/${id}`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify({
        idUsuario: id,
        idRol: usuario.idRol,
        codigo: usuario.codigo,
        nombreUsuario: usuario.nombreUsuario,
        contrasena: usuario.contrasena,
        estado: usuario.estado
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Error al actualizar el usuario');
    }
  },

  // DELETE USER
  async deleteUsuario(id: number): Promise<void> {
    if (isMockMode) {
      const users = getLocalUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('Usuario no encontrado');
      users[idx].estado = 'INACTIVO';
      saveLocalUsers(users);
      return;
    }

    const res = await fetch(`${BASE_URL}/Usuarios/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error('Error al eliminar el usuario');
    }
  },

  // --- APPOINTMENTS (CITAS) - CLIENT SIDE OR LOCAL STORAGE DRIVEN ---
  async getCitas(): Promise<Cita[]> {
    return getLocalCitas();
  },

  async createCita(cita: Omit<Cita, 'id'>): Promise<Cita> {
    const citas = getLocalCitas();
    const newId = citas.length > 0 ? (Math.max(...citas.map(c => parseInt(c.id))) + 1).toString() : '1';
    const newCita = { ...cita, id: newId };
    citas.push(newCita);
    saveLocalCitas(citas);
    return newCita;
  },

  async updateCita(id: string, updated: Partial<Cita>): Promise<Cita> {
    const citas = getLocalCitas();
    const idx = citas.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Cita no encontrada');
    citas[idx] = { ...citas[idx], ...updated };
    saveLocalCitas(citas);
    return citas[idx];
  },

  async deleteCita(id: string): Promise<void> {
    const citas = getLocalCitas();
    const filtered = citas.filter(c => c.id !== id);
    saveLocalCitas(filtered);
  },

  // --- DATABASE-BOUND ENDPOINTS FOR PANTALLA GESTIÓN DE CITAS ---
  async getClientes(): Promise<Cliente[]> {
    if (isMockMode) {
      const stored = localStorage.getItem('dental_db_clientes');
      if (stored) return JSON.parse(stored);
      const defaultMock: Cliente[] = [
        { idCliente: 1, ci: 1234567, nombre: 'Ricardo', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Salas', tipoSangre: 'O+', telefono: '77777777', fechaNacimiento: '1990-05-10', estado: 'Activo' },
        { idCliente: 2, ci: 4567890, nombre: 'Lucía', apellidoPaterno: 'González', apellidoMaterno: 'Paz', tipoSangre: 'A+', telefono: '76666666', fechaNacimiento: '1995-08-15', estado: 'Activo' },
        { idCliente: 3, ci: 3221445, nombre: 'Carlos', apellidoPaterno: 'Pereira', apellidoMaterno: 'Luna', tipoSangre: 'B+', telefono: '75555555', fechaNacimiento: '1988-11-20', estado: 'Activo' },
        { idCliente: 4, ci: 1726354, nombre: 'Gael', apellidoPaterno: 'Rodriguez', apellidoMaterno: 'Sanchez', tipoSangre: 'O+', telefono: '74444444', fechaNacimiento: '2000-01-01', estado: 'Activo' }
      ];
      localStorage.setItem('dental_db_clientes', JSON.stringify(defaultMock));
      return defaultMock;
    }
    const res = await fetch(`${BASE_URL}/Clientes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener clientes');
    return await res.json();
  },

  async getCategorias(): Promise<Categoria[]> {
    if (isMockMode) {
      const stored = localStorage.getItem('dental_db_categorias');
      if (stored) return JSON.parse(stored);
      const defaultMock: Categoria[] = [
        { idCategoria: 1, codigo: 'CAT001', nombre: 'General', estado: 'Activo' },
        { idCategoria: 2, codigo: 'CAT002', nombre: 'Ortodoncia', estado: 'Activo' },
        { idCategoria: 3, codigo: 'CAT003', nombre: 'Cirugia', estado: 'Activo' },
      ];
      localStorage.setItem('dental_db_categorias', JSON.stringify(defaultMock));
      return defaultMock;
    }
    const res = await fetch(`${BASE_URL}/Categorias`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener categorías');
    return await res.json();
  },

  async getServicios(): Promise<Servicio[]> {
    if (isMockMode) {
      const stored = localStorage.getItem('dental_db_servicios');
      if (stored) return JSON.parse(stored);
      const defaultMock: Servicio[] = [
        { idServicio: 1, idCategoria: 1, codigo: 'SRV001', nombre: 'Limpieza Profunda', descripcion: 'Limpieza dental profunda', duracion: '01:00:00', estadoServicio: 'Disponible', estado: 'Activo' },
        { idServicio: 2, idCategoria: 2, codigo: 'SRV002', nombre: 'Ortodoncia Control', descripcion: 'Control de brackets', duracion: '00:30:00', estadoServicio: 'Disponible', estado: 'Activo' },
        { idServicio: 3, idCategoria: 3, codigo: 'SRV003', nombre: 'Implante Fase 2', descripcion: 'Fase 2 de implantes', duracion: '01:30:00', estadoServicio: 'Disponible', estado: 'Activo' },
        { idServicio: 4, idCategoria: 3, codigo: 'SRV004', nombre: 'Extracción Molar', descripcion: 'Extracción quirúrgica', duracion: '01:00:00', estadoServicio: 'Disponible', estado: 'Activo' }
      ];
      localStorage.setItem('dental_db_servicios', JSON.stringify(defaultMock));
      return defaultMock;
    }
    const res = await fetch(`${BASE_URL}/Servicios`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener servicios');
    return await res.json();
  },

  async getDbCitas(): Promise<DbCita[]> {
    if (isMockMode) {
      const stored = localStorage.getItem('dental_db_citas');
      if (stored) return JSON.parse(stored);
      const defaultMock: DbCita[] = [];
      localStorage.setItem('dental_db_citas', JSON.stringify(defaultMock));
      return defaultMock;
    }
    const res = await fetch(`${BASE_URL}/Citas`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener citas');
    return await res.json();
  },

  async getDetallesCita(): Promise<DetalleCita[]> {
    if (isMockMode) {
      const stored = localStorage.getItem('dental_db_detalles');
      if (stored) return JSON.parse(stored);
      const defaultMock: DetalleCita[] = [];
      localStorage.setItem('dental_db_detalles', JSON.stringify(defaultMock));
      return defaultMock;
    }
    const res = await fetch(`${BASE_URL}/DetallesCita`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener detalles de cita');
    return await res.json();
  },

  async crearNuevaCita(dto: NuevaCitaDto): Promise<DbCita> {
    if (isMockMode) {
      const clientes = await this.getClientes();
      const servicios = await this.getServicios();
      
      const client = clientes.find(c => c.idCliente === dto.idCliente);
      const service = servicios.find(s => s.idServicio === dto.idServicio);
      
      if (!client) throw new Error('Paciente no encontrado.');
      if (!service) throw new Error('Servicio no encontrado.');
      
      const today = new Date().toISOString().split('T')[0];
      if (dto.fecha < today) {
        throw new Error('La fecha de la cita no puede ser anterior al día actual.');
      }
      
      const [, minutes] = dto.hora.split(':').map(Number);
      if (minutes !== 0 && minutes !== 30) {
        throw new Error('La hora debe ser en intervalos de 30 minutos.');
      }
      
      const dbCitas = await this.getDbCitas();
      const dbDetalles = await this.getDetallesCita();
      const dbServicios = await this.getServicios();

      // Calculate end time for new appointment
      const [newH, newM] = dto.hora.split(':').map(Number);
      const newStartMin = newH * 60 + newM;
      const svc = dbServicios.find(s => s.idServicio === dto.idServicio);
      const durMin = svc ? (() => {
        const [h, m] = svc.duracion.split(':').map(Number);
        return h * 60 + m;
      })() : 30;
      const newEndMin = newStartMin + durMin;

      // Check for overlaps
      for (const cita of dbCitas) {
        if (cita.estadoCita === 'Cancelada' || cita.estadoCita === 'Completada') continue;
        if (cita.fecha !== dto.fecha) continue;

        const detalle = dbDetalles.find(d => d.idCita === cita.idCita);
        if (!detalle) continue;
        const srv = dbServicios.find(s => s.idServicio === detalle.idServicio);
        if (!srv) continue;

        const [eH, eM] = cita.hora.split(':').map(Number);
        const existingStartMin = eH * 60 + eM;
        const [dh, dm] = srv.duracion.split(':').map(Number);
        const existingEndMin = existingStartMin + dh * 60 + dm;

        // Overlap check: newStart < existingEnd AND existingStart < newEnd
        if (newStartMin < existingEndMin && existingStartMin < newEndMin) {
          const isPatient = cita.idCliente === dto.idCliente;
          const isDentist = cita.idUsuario === dto.idUsuario;
          if (!isPatient && !isDentist) continue;

          const fmtTime = (m: number) => `${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}`;
          const msg = isPatient
            ? `El paciente ya tiene una cita (${cita.codigo}: ${srv.nombre} de ${fmtTime(existingStartMin)} a ${fmtTime(existingEndMin)}) que se solapa con el horario solicitado.`
            : `El horario solicitado se solapa con la cita ${cita.codigo} (${srv.nombre} de ${fmtTime(existingStartMin)} a ${fmtTime(existingEndMin)}).`;
          throw new Error(msg);
        }
      }
      
      const randomId = Math.floor(Math.random() * 100000);
      const newCita: DbCita = {
        idCita: randomId,
        idCliente: dto.idCliente,
        idUsuario: dto.idUsuario,
        codigo: `CIT-${Math.floor(10000 + Math.random() * 90000)}`,
        medioComunicacion: dto.medioComunicacion,
        fecha: dto.fecha,
        hora: dto.hora,
        estadoCita: dto.estadoCita ?? 'Pendiente',
        estado: 'Activo'
      };
      
      dbCitas.push(newCita);
      localStorage.setItem('dental_db_citas', JSON.stringify(dbCitas));
      
      const detallesActualizados = await this.getDetallesCita();
      detallesActualizados.push({
        idDetalleCita: Math.floor(Math.random() * 100000),
        idCita: randomId,
        idServicio: dto.idServicio
      });
      localStorage.setItem('dental_db_detalles', JSON.stringify(detallesActualizados));
      
      return newCita;
    }

    const res = await fetch(`${BASE_URL}/Citas/nueva`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(dto)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ mensaje: 'Error al registrar la cita' }));
      throw new Error(errData.mensaje || 'Error al agendar la cita en el servidor');
    }

    return await res.json();
  },

  async actualizarEstadoCita(idCita: number, nuevoEstado: string): Promise<void> {
    if (isMockMode) {
      const citas = await this.getDbCitas();
      const idx = citas.findIndex(c => c.idCita === idCita);
      if (idx === -1) throw new Error('Cita no encontrada.');
      citas[idx] = { ...citas[idx], estadoCita: nuevoEstado };
      localStorage.setItem('dental_db_citas', JSON.stringify(citas));
      return;
    }

    // Use the lightweight PATCH /estado endpoint
    const res = await fetch(`${BASE_URL}/Citas/${idCita}/estado`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ estadoCita: nuevoEstado }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ mensaje: 'Error al actualizar el estado' }));
      throw new Error(errData.mensaje || 'Error al actualizar el estado de la cita');
    }
  }
};

