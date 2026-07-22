const BASE_URL = 'https://localhost:7241/api';

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

    return await res.json();
  },

  // GET ALL USERS
  async getUsuarios(): Promise<Usuario[]> {
    if (isMockMode) {
      return getLocalUsers();
    }

    const res = await fetch(`${BASE_URL}/Usuarios`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener los usuarios');
    const users: Usuario[] = await res.json();
    // Fetch and append Rol name manually since DB relations might be circular or ignored in JSON
    return users.map(u => ({
      ...u,
      rol: u.idRol === 1 ? 'Administrador' : u.idRol === 2 ? 'Dentista' : 'Paciente'
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
    return await res.json();
  },

  // CREATE USER (REGISTER/ADD)
  async createUsuario(usuario: Usuario): Promise<Usuario> {
    if (isMockMode) {
      const users = getLocalUsers();
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
      body: JSON.stringify(usuario)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Error al crear el usuario');
    }
    return await res.json();
  },

  // UPDATE USER
  async updateUsuario(id: number, usuario: Usuario): Promise<void> {
    if (isMockMode) {
      const users = getLocalUsers();
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
      body: JSON.stringify(usuario)
    });

    if (!res.ok) {
      throw new Error('Error al actualizar el usuario');
    }
  },

  // DELETE USER
  async deleteUsuario(id: number): Promise<void> {
    if (isMockMode) {
      const users = getLocalUsers();
      const filtered = users.filter(u => u.id !== id);
      if (users.length === filtered.length) throw new Error('Usuario no encontrado');
      saveLocalUsers(filtered);
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
  }
};
