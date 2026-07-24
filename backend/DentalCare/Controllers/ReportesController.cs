using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DentalCare.Data;
using DentalCare.Clases;

namespace DentalCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly DentalCareContext _context;

        public ReportesController(DentalCareContext context)
        {
            _context = context;
        }

        // GET: api/Reportes/agenda
        [HttpGet("agenda")]
        public async Task<IActionResult> GetAgenda([FromQuery] DateOnly? fecha)
        {
            var query = _context.Cita
                .Include(c => c.Cliente)
                .Include(c => c.DetalleCitas)
                    .ThenInclude(dc => dc.Servicio)
                .Where(c => c.Estado == "Activo" && c.Cliente != null && c.Cliente.Estado == "Activo")
                .AsQueryable();

            if (fecha.HasValue)
            {
                query = query.Where(c => c.Fecha == fecha.Value);
            }

            var citas = await query
                .OrderBy(c => c.Fecha).ThenBy(c => c.Hora)
                .Select(c => new
                {
                    c.IdCita,
                    c.Codigo,
                    Fecha = c.Fecha.ToString("yyyy-MM-dd"),
                    Hora = c.Hora.ToString("hh:mm tt"), // Formato 12 hrs AM/PM
                    EstadoCita = c.EstadoCita,
                    Cliente = c.Cliente != null ? (c.Cliente.Nombre + " " + c.Cliente.ApellidoPaterno + " " + c.Cliente.ApellidoMaterno).Trim() : "",
                    Tratamiento = c.DetalleCitas.Select(dc => dc.Servicio != null ? dc.Servicio.Nombre : "Consulta General").FirstOrDefault() ?? "Consulta General"
                })
                .ToListAsync();

            return Ok(citas);
        }

        // GET: api/Reportes/agenda-mensual
        [HttpGet("agenda-mensual")]
        public async Task<IActionResult> GetAgendaMensual([FromQuery] DateOnly fechaInicio, [FromQuery] DateOnly fechaFin)
        {
            var citasMes = await _context.Cita
                .Include(c => c.DetalleCitas)
                    .ThenInclude(dc => dc.Servicio)
                .Where(c => c.Estado == "Activo" && c.Fecha >= fechaInicio && c.Fecha <= fechaFin)
                .ToListAsync();

            var totalCitas = citasMes.Count;
            var confirmadas = citasMes.Count(c => c.EstadoCita.ToLower() == "confirmada" || c.EstadoCita.ToLower() == "completada");
            var asistencia = totalCitas > 0 ? (confirmadas * 100.0 / totalCitas) : 0;
            var totalTratamientos = citasMes.SelectMany(c => c.DetalleCitas).Count();

            // Tratamientos frecuentes
            var tratamientos = citasMes.SelectMany(c => c.DetalleCitas)
                                       .Where(dc => dc.Servicio != null)
                                       .GroupBy(dc => dc.Servicio!.Nombre)
                                       .Select(g => new { Nombre = g.Key, Cantidad = g.Count() })
                                       .OrderByDescending(t => t.Cantidad)
                                       .Take(3)
                                       .Select(t => new {
                                            Nombre = t.Nombre,
                                            Porcentaje = totalTratamientos > 0 ? (int)(t.Cantidad * 100.0 / totalTratamientos) : 0
                                       })
                                       .ToList();

            var dias = citasMes.GroupBy(c => c.Fecha)
                               .Select(g => new {
                                   Fecha = g.Key.ToString("yyyy-MM-dd"),
                                   Total = g.Count(),
                                   Confirmadas = g.Count(c => c.EstadoCita.ToLower() == "confirmada" || c.EstadoCita.ToLower() == "completada")
                               })
                               .ToList();

            return Ok(new {
                Metricas = new {
                    TotalCitas = totalCitas,
                    Asistencia = Math.Round(asistencia, 1),
                    TotalTratamientos = totalTratamientos
                },
                TratamientosFrecuentes = tratamientos,
                Dias = dias
            });
        }

        // GET: api/Reportes/pacientes
        [HttpGet("pacientes")]
        public async Task<IActionResult> GetPacientes()
        {
            var pacientesQuery = await _context.Cliente
                .Where(c => c.Estado == "Activo")
                .Select(c => new
                {
                    c.IdCliente,
                    c.Ci,
                    NombreCompleto = (c.Nombre + " " + c.ApellidoPaterno + " " + c.ApellidoMaterno).Trim(),
                    c.Telefono,
                    c.Estado,
                    UltimaCita = _context.Cita
                        .Where(cita => cita.IdCliente == c.IdCliente)
                        .OrderByDescending(cita => cita.Fecha)
                        .Select(cita => (DateOnly?)cita.Fecha)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var totalPacientes = pacientesQuery.Count;
            // Simulamos métricas de "activos este mes" o nuevos ingresos basándonos en fechas si las tuvieramos
            // Como no hay fecha de registro, usaremos valores simulados para las métricas o calcularemos en base a citas
            var activosEsteMes = pacientesQuery.Count(p => p.UltimaCita.HasValue && p.UltimaCita.Value.Month == DateTime.Now.Month && p.UltimaCita.Value.Year == DateTime.Now.Year);
            var nuevosIngresos = 28; // Hardcodeado por el momento ya que no hay fecha de registro

            return Ok(new {
                Metricas = new {
                    TotalPacientes = totalPacientes,
                    ActivosEsteMes = activosEsteMes,
                    NuevosIngresos = nuevosIngresos
                },
                Pacientes = pacientesQuery.Select(p => new {
                    Ci = p.Ci,
                    NombreCompleto = p.NombreCompleto,
                    UltimaVisita = p.UltimaCita.HasValue ? p.UltimaCita.Value.ToString("dd/MM/yyyy") : "Sin visitas",
                    Estado = p.Estado,
                    Telefono = p.Telefono
                }).ToList()
            });
        }

        // GET: api/Reportes/tratamientos
        [HttpGet("tratamientos")]
        public async Task<IActionResult> GetTratamientos()
        {
            var tratamientos = await _context.Servicio
                .Include(s => s.Categoria)
                .Where(s => s.Estado == "Activo")
                .OrderBy(s => s.Categoria != null ? s.Categoria.Nombre : "")
                .ThenBy(s => s.IdServicio)
                .Select(s => new
                {
                    s.Codigo,
                    s.Nombre,
                    s.Descripcion,
                    Duracion = s.Duracion.ToString("HH:mm:ss"),
                    Categoria = s.Categoria != null ? s.Categoria.Nombre : "Sin Categoría"
                })
                .ToListAsync();

            return Ok(tratamientos);
        }
    }
}
