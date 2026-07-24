const BASE_URL = 'http://localhost:5020/api';

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('dental_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const reportesService = {
  async getAgenda(fecha?: string) {
    let url = `${BASE_URL}/Reportes/agenda`;
    const params = new URLSearchParams();
    if (fecha) params.append('fecha', fecha);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de agenda diaria');
    return await res.json();
  },

  async getAgendaMensual(fechaInicio: string, fechaFin: string) {
    const params = new URLSearchParams({ fechaInicio, fechaFin });
    const res = await fetch(`${BASE_URL}/Reportes/agenda-mensual?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de agenda mensual');
    return await res.json();
  },

  async getPacientes() {
    const res = await fetch(`${BASE_URL}/Reportes/pacientes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de pacientes');
    return await res.json();
  },

  async getTratamientos() {
    const res = await fetch(`${BASE_URL}/Reportes/tratamientos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de tratamientos');
    return await res.json();
  }
};
