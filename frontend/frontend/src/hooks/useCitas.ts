import { useState, useEffect, useMemo } from "react";
import { citasService } from "../services/agenda/citasService";

export const useCitas = (selectedDate: string) => {
  const [citas, setCitas] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const [citasData, serviciosData] = await Promise.all([
        citasService.getCitas(),
        citasService.getServicios(),
      ]);

      const idClientesUnicos = Array.from(
        new Set(citasData.map((c: any) => c.idCliente)),
      );
      const clientesData = await Promise.all(
        idClientesUnicos.map((id) => citasService.getCliente(id as number)),
      );

      const clienteMap = new Map(clientesData.map((c) => [c.idCliente, c]));
      const servicioMap = new Map(
        serviciosData.map((s: any) => [s.idServicio, s]),
      );

      const enriquecidas = citasData.map((cita: any) => {
        const cliente = clienteMap.get(cita.idCliente);
        const idServicio = cita.detalleCitas[0]?.idServicio;
        const servicio = servicioMap.get(idServicio);

        return {
          ...cita,
          nombrePaciente: cliente
            ? `${cliente.nombre} ${cliente.apellidoPaterno}`
            : `Cliente ${cita.idCliente}`,
          nombreServicio: servicio
            ? servicio.nombre
            : "Servicio no especificado",
        };
      });

      setCitas(enriquecidas);
      setServicios(serviciosData);
    } catch (error) {
      console.error("Error al cargar agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, []);

  const citasDelDia = useMemo(
    () => citas.filter((c) => c.fecha && c.fecha.startsWith(selectedDate)),
    [citas, selectedDate],
  );

  const stats = useMemo(() => {
    const totales = citas.length;
    const confirmadas = citas.filter(
      (c) => c.estadoCita === "Confirmada",
    ).length;
    return {
      totales,
      porcentaje: totales > 0 ? Math.round((confirmadas / totales) * 100) : 0,
    };
  }, [citas]);

  return { citas, citasDelDia, servicios, stats, loading, refresh: fetchTodo };
};
