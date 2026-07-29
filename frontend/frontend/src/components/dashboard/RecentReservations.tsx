import React from "react";
import type { DbCita, Cliente } from "../../services/api";
import "../../pages/Dashboard/Dashboard.css";

import {
  FaWhatsapp,
  FaPhone,
  FaRobot,
  FaCalendar,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCircle,
} from "react-icons/fa";

interface RecentReservationsProps {
  citas: DbCita[];
  clientes: Cliente[];
}

export const RecentReservations: React.FC<RecentReservationsProps> = ({
  citas,
  clientes,
}) => {
  const getClientName = (idCliente: number): string => {
    const cliente = clientes.find((c) => c.idCliente === idCliente);

    if (!cliente) {
      return "Cliente desconocido";
    }

    return (
      (cliente as any).nombreCompleto ||
      `${cliente.nombre} ${cliente.apellidoPaterno}`
    );
  };

  const getCommunicationIcon = (medio: string) => {
    switch (medio?.toUpperCase()) {
      case "WHATSAPP":
        return <FaWhatsapp size={22} />;

      case "RECEPCION":
      case "RECEPCIÓN":
        return <FaPhone size={20} />;

      case "BOT":
        return <FaRobot size={20} />;

      default:
        return <FaCalendar size={20} />;
    }
  };

  const getStatus = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case "CONFIRMADA":
        return (
          <span className="reservation-status confirmed">
            <FaCheckCircle />
            Confirmada
          </span>
        );

      case "PENDIENTE":
        return (
          <span className="reservation-status pending">
            <FaCircle />
            Pendiente
          </span>
        );

      case "CANCELADA":
        return (
          <span className="reservation-status cancelled">
            <FaTimesCircle />
            Cancelada
          </span>
        );

      case "COMPLETADA":
        return (
          <span className="reservation-status completed">
            <FaCheckCircle />
            Completada
          </span>
        );

      default:
        return <span className="reservation-status">{estado}</span>;
    }
  };

  const citasRecientes = [...citas]
    .filter((cita) => {
      const estado = cita.estadoCita.toUpperCase();

      const esPendienteOConfirmada =
        estado === "PENDIENTE" || estado === "CONFIRMADA";

      const fechaCita = new Date(`${cita.fecha}T${cita.hora.substring(0, 8)}`);

      const hoy = new Date();

      hoy.setHours(0, 0, 0, 0);

      return esPendienteOConfirmada && fechaCita >= hoy;
    })
    .sort((a, b) => {
      const fechaHoraA = `${a.fecha} ${a.hora}`;
      const fechaHoraB = `${b.fecha} ${b.hora}`;

      return fechaHoraA.localeCompare(fechaHoraB);
    })
    .slice(0, 4);

  return (
    <div className="recent-reservations-container">
      <div className="reservations-header">
        <h2>Próximas Citas </h2>
      </div>

      <div className="reservations-list">
        {citasRecientes.map((cita) => (
          <div key={cita.idCita} className="reservation-card">
            <div className="reservation-main">
              <div className="communication-icon">
                {getCommunicationIcon(cita.medioComunicacion)}
              </div>

              <div className="reservation-data">
                <h4>{getClientName(cita.idCliente)}</h4>

                <p>{cita.serviceName || "Servicio no asignado"}</p>
              </div>
            </div>

            <div className="reservation-footer">
              <div className="reservation-hour">
                <FaClock />
                {new Date(`${cita.fecha}T${cita.hora}`).toLocaleDateString(
                  "es-ES",
                  {
                    day: "numeric",
                    month: "short",
                  },
                )}{" "}
                - {cita.hora.substring(0, 5)}
              </div>

              {getStatus(cita.estadoCita)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
