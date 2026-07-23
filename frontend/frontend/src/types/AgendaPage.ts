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
  fecha: string;
  hora: string;
  estadoCita: string;
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

export interface CitaEnriquecida extends Cita {
  nombrePaciente?: string;
  nombreServicio?: string;
}
