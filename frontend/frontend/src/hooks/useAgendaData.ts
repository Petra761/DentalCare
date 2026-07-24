import { useState, useEffect, useMemo } from "react";
import { citasService } from "../services/agenda/citasService";
import {
  type Cita,
  type CitaEnriquecida,
  type Servicio,
  type Cliente,
} from "../types/AgendaPage";

export const useAgendaData = (selectedDate: string) => {
  const [citas, setCitas] = useState<CitaEnriquecida[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citasData, serviciosData] = await Promise.all([
        citasService.getCitas(),
        citasService.getServicios(),
      ]);

      const idClientesUnicos = Array.from(
        new Set(citasData.map((c) => c.idCliente)),
      );

      const clientesData = await Promise.all(
        idClientesUnicos.map((id) => citasService.getCliente(id)),
      );

      const clienteMap = new Map(clientesData.map((c) => [c.idCliente, c]));
      const servicioMap = new Map(serviciosData.map((s) => [s.idServicio, s]));

      const enriquecidas = citasData.map((cita) => {
        const cliente = clienteMap.get(cita.idCliente);
        const servicioId = cita.detalleCitas[0]?.idServicio;
        const servicio = servicioMap.get(servicioId);

        return {
          ...cita,
          nombrePaciente: cliente
            ? `${cliente.nombre} ${cliente.apellidoPaterno}`
            : "Desconocido",
          nombreServicio: servicio ? servicio.nombre : "Sin servicio",
        };
      });

      setCitas(enriquecidas);
      setServicios(serviciosData);
    } catch (error) {
      console.error("Error cargando datos de agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const citasDelDia = useMemo(
    () => citas.filter((c) => c.fecha && c.fecha.startsWith(selectedDate)),
    [citas, selectedDate],
  );

  return { citas, citasDelDia, servicios, loading, refresh: fetchData };
};
