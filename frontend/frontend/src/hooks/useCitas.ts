import { useState, useEffect, useMemo } from "react";
import { citasService } from "../services/agenda/citasService";

export const useCitas = (selectedDate: string) => {
  const [citas, setCitas] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const [citasData, serviciosData, detallesData] = await Promise.all([
        citasService.getCitas(),
        citasService.getServicios(),
        citasService.getAllDetalles(),
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

      const detalleMap = new Map(
        detallesData.map((d: any) => [d.idCita, d.idServicio]),
      );

      const enriquecidas = citasData.map((cita: any) => {
        const cliente = clienteMap.get(cita.idCliente);

        const idServicioAsignado = detalleMap.get(cita.idCita);
        const servicio = idServicioAsignado
          ? servicioMap.get(idServicioAsignado)
          : null;

        return {
          ...cita,
          nombrePaciente: cliente
            ? `${cliente.nombre} ${cliente.apellidoPaterno}`
            : `ID: ${cita.idCliente}`,
          nombreServicio: servicio
            ? servicio.nombre
            : "Tratamiento no asignado",
          idServicio: idServicioAsignado || null,
          codigoServicio: servicio ? servicio.codigo : "N/A",
        };
      });

      setCitas(enriquecidas);
      setServicios(serviciosData);
    } catch (error) {
      console.error("Error al enriquecer datos de agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, []);

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

  return { citas, servicios, stats, loading, refresh: fetchTodo };
};
