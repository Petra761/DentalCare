import { type Cita, type Servicio, type Cliente } from "../../types/AgendaPage";

const API_BASE_URL = "http://localhost:5020/api";

export const citasService = {
  getCitas: async (): Promise<Cita[]> => {
    const res = await fetch(`${API_BASE_URL}/Citas`);
    return res.json();
  },
  getServicios: async (): Promise<Servicio[]> => {
    const res = await fetch(`${API_BASE_URL}/Servicios`);
    return res.json();
  },
  getCliente: async (id: number): Promise<Cliente> => {
    const res = await fetch(`${API_BASE_URL}/Clientes/${id}`);
    return res.json();
  },
};
