export interface DetalleCita {
  idDetalleCita: number;
  idCita: number;
  idServicio: number;
}

export interface Cita {
  idCita: number;
  idCliente: number;
  idUsuario: number;
  codigo: string;
  medioComunicacion: string;
  fecha: string; // "2026-07-23"
  hora: string; // "08:00"
  estadoCita: string; // "Confirmada", "Pendiente", etc.
  estado: string;
  detalleCitas: DetalleCita[];
  nombrePaciente?: string;
  nombreServicio?: string;
}

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
}

export interface Servicio {
  idServicio: number;
  nombre: string;
  codigo: string;
}

// Extendemos la Cita para que la UI sea fácil de pintar
export interface CitaEnriquecida extends Cita {
  nombrePaciente?: string;
  nombreServicio?: string;
}
