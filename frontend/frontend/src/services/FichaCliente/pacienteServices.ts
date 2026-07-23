const API_URL = "http://localhost:5020/api/Clientes";

const API_URL_OTRA = "http://localhost:5020/api";

export interface Alergia {
  idAlergia: number;
  nombre: string;
}

export interface Paciente {
  idCliente: number;
  ci: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  tipoSangre?: string;
  telefono?: string;
  estado?: string;
}

export interface ClientePayload {
  ci: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  tipoSangre?: string;
  telefono?: string;
  estado?: string;
  alergiaClientes: { idAlergia: number }[];
}

export interface ClienteUpdatePayload extends ClientePayload {
  idCliente: number;
  alergiaClientes: { idAlergia: number; idCliente?: number }[];
}
export interface ServicioRealizado {
  idServicio: number;
  nombreServicio: string;
}

export interface HistorialCita {
  idCita: number;
  codigo: string;
  fecha: string;
  hora: string;
  estadoCita: string;
  usuarioAtendio: string;
  servicios: ServicioRealizado[];
}
// 1. Endpoint: GET /api/Clientes (Paginado / Buscador)
export const getPacientes = async (pagina = 1, limite = 5, busqueda = "") => {
  const response = await fetch(
    `${API_URL}?pagina=${pagina}&limite=${limite}&busqueda=${busqueda}`,
  );
  if (!response.ok) throw new Error("Error al obtener la lista de pacientes");
  return await response.json();
};

export const getEstadisticasPacientes = async () => {
  const response = await fetch(
    "http://localhost:5020/api/Clientes/estadisticas",
  );
  if (!response.ok) throw new Error("Error al obtener las estadísticas");
  return await response.json(); // Retorna { totalPacientes: number }
};

// GET: Cargar lista de alergias para el desplegable
export const obtenerAlergias = async (): Promise<Alergia[]> => {
  const res = await fetch(`${API_URL_OTRA}/Alergias`);
  if (!res.ok) throw new Error("Error al obtener alergias");
  return await res.json();
};

// POST: Registrar cliente con sus alergias (El que acabamos de probar)
export const crearCliente = async (cliente: ClientePayload) => {
  const res = await fetch(`${API_URL_OTRA}/Clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });

  if (!res.ok) throw new Error("Error al guardar el paciente");
  return await res.json();
};

export const getHistorialCliente = async (
  idCliente: number,
): Promise<HistorialCita[]> => {
  const res = await fetch(
    `http://localhost:5020/api/Clientes/${idCliente}/historial`,
  );
  if (!res.ok) {
    throw new Error("Error al obtener el historial de citas del cliente");
  }
  return await res.json();
};


export const getClientePorId = async (idCliente: number): Promise<Paciente> => {
  const res = await fetch(`http://localhost:5020/api/Clientes/${idCliente}`);
  if (!res.ok) {
    throw new Error("Error al obtener los detalles del paciente");
  }
  return await res.json();
};

// PUT: Actualizar datos de un cliente
export const actualizarCliente = async (
  idCliente: number,
  cliente: ClienteUpdatePayload,
): Promise<void> => {
  const res = await fetch(`${API_URL}/${idCliente}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.mensaje || "Error al actualizar el paciente");
  }
};

// DELETE: Desactivar un cliente (soft-delete → Estado = 'Inactivo')
export const eliminarCliente = async (idCliente: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${idCliente}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.mensaje || "Error al eliminar el paciente");
  }
};