import React from "react";
import type { DbCita, Cliente, Servicio } from "../../services/api";
import { MessageCircle, AlertCircle, CheckCircle } from "lucide-react";

interface RecentReservationsProps {
  citas: DbCita[];
  clientes: Cliente[];
  servicios: Servicio[];
}

export const RecentReservations: React.FC<RecentReservationsProps> = ({
  citas,
  clientes,
  servicios,
}) => {
  const getClientName = (idCliente: number): string => {
    const cliente = clientes.find((c) => c.idCliente === idCliente);
    return cliente
      ? `${cliente.nombre} ${cliente.apellidoPaterno}`
      : "Cliente desconocido";
  };

  const getServiceName = (idCita: number): string => {
    const cita = citas.find((c) => c.idCita === idCita);
    return cita?.serviceName || "Servicio";
  };

  const getStatusIcon = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "CONFIRMADA":
        return <MessageCircle size={20} style={{ color: "#10B981" }} />;
      case "CANCELADA":
        return <AlertCircle size={20} style={{ color: "#F59E0B" }} />;
      case "COMPLETADA":
        return <CheckCircle size={20} style={{ color: "#10B981" }} />;
      default:
        return <MessageCircle size={20} style={{ color: "#6B7280" }} />;
    }
  };

  return (
    <div className="recent-reservations-container">
      <div className="reservations-header">
        <h2>Reservas Recientes</h2>
      </div>

      <div className="reservations-list">
        {citas.slice(0, 4).map((cita) => (
          <div key={cita.idCita} className="reservation-item">
            <div className="reservation-icon">
              {getStatusIcon(cita.estadoCita)}
            </div>

            <div className="reservation-info">
              <p className="reservation-name">
                {getClientName(cita.idCliente)}
              </p>
              <p className="reservation-service">{cita.serviceName}</p>
            </div>

            <div className="reservation-time">
              <span className="time">{cita.hora}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="reservations-footer">
        <a href="#" className="view-all">
          Ver todas las citas →
        </a>
      </div>
    </div>
  );
};
