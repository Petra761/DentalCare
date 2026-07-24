using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DentalCare.Clases;
using DentalCare.Data;
using DentalCare.Services;

namespace DentalCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CitasController : ControllerBase
    {
        private readonly DentalCareContext _context;
        private readonly GoogleCalendarService _googleCalendar;

        public CitasController(DentalCareContext context, GoogleCalendarService googleCalendar)
        {
            _context = context;
            _googleCalendar = googleCalendar;
        }

        // ─── GET: api/Citas ────────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cita>>> GetCita()
        {
            return await _context.Cita
                .Where(c => c.Estado == "Activo"
                    && c.EstadoCita != "Reagendado"
                    && c.EstadoCita != "Cancelada"
                    && c.EstadoCita != "Completada")
                .ToListAsync();
        }

        // ─── GET: api/Citas/historial ─────────────────────────────────────────
        [HttpGet("historial")]
        public async Task<ActionResult<IEnumerable<Cita>>> GetHistorial()
        {
            return await _context.Cita
                .Where(c => c.Estado == "Activo"
                    && (c.EstadoCita == "Cancelada"
                        || c.EstadoCita == "Completada"
                        || c.EstadoCita == "Reagendado"))
                .OrderByDescending(c => c.Fecha)
                .ThenByDescending(c => c.Hora)
                .ToListAsync();
        }

        // ─── GET: api/Citas/detalladas ────────────────────────────────────────
        [HttpGet("detalladas")]
        public async Task<ActionResult<IEnumerable<object>>> GetCitasDetalladas()
        {
            var citas = await (
                from c in _context.Cita
                join cli in _context.Cliente on c.IdCliente equals cli.IdCliente
                join usr in _context.Usuario on c.IdUsuario equals usr.IdUsuario
                join d in _context.DetalleCita on c.IdCita equals d.IdCita
                join s in _context.Servicio on d.IdServicio equals s.IdServicio
                where c.Estado == "Activo"
                select new
                {
                    c.IdCita,
                    c.Codigo,
                    Cliente = $"{cli.Nombre} {cli.ApellidoPaterno} {cli.ApellidoMaterno}".Trim(),
                    ClienteTelefono = cli.Telefono,
                    Usuario = usr.NombreUsuario,
                    Servicio = s.Nombre,
                    c.Fecha,
                    c.Hora,
                    c.MedioComunicacion,
                    c.EstadoCita,
                    c.GoogleEventId
                }
            ).ToListAsync();

            return Ok(citas);
        }

        // ─── GET: api/Citas/test-calendar ─────────────────────────────────────
        [HttpGet("test-calendar")]
        public async Task<ActionResult> TestGoogleCalendar()
        {
            try
            {
                var events = await _googleCalendar.GetAllEventsAsync();
                return Ok(new
                {
                    success = true,
                    mensaje = "Conexión exitosa con Google Calendar",
                    eventosEncontrados = events.Count,
                    calendarId = _googleCalendar.GetCalendarId()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al conectar con Google Calendar",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        // ─── POST: api/Citas/sincronizar ──────────────────────────────────────
        [HttpPost("sincronizar")]
        public async Task<ActionResult> SincronizarGoogleCalendar()
        {
            var citasSinSync = await (
                from c in _context.Cita
                join d in _context.DetalleCita on c.IdCita equals d.IdCita
                join s in _context.Servicio on d.IdServicio equals s.IdServicio
                join cli in _context.Cliente on c.IdCliente equals cli.IdCliente
                where c.Estado == "Activo" && c.GoogleEventId == null
                select new { Cita = c, Cliente = cli, Servicio = s }
            ).ToListAsync();

            if (citasSinSync.Count == 0)
                return Ok(new { mensaje = "No hay citas pendientes de sincronizar.", sincronizadas = 0 });

            var exitosas = 0;
            var fallidas = new List<string>();

            foreach (var item in citasSinSync)
            {
                try
                {
                    var clienteNombre = $"{item.Cliente.Nombre} {item.Cliente.ApellidoPaterno} {item.Cliente.ApellidoMaterno}".Trim();
                    var googleId = await _googleCalendar.CreateEventAsync(
                        item.Cita, clienteNombre, item.Cliente.Telefono ?? "", item.Servicio.Nombre, item.Servicio.Duracion);

                    item.Cita.GoogleEventId = googleId;
                    exitosas++;
                }
                catch (Exception ex)
                {
                    fallidas.Add($"Cita {item.Cita.Codigo}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = $"Sincronización completada. {exitosas} exitosas, {fallidas.Count} fallidas.",
                sincronizadas = exitosas,
                fallidas = fallidas.Count > 0 ? fallidas : null
            });
        }

        // ─── GET: api/Citas/5 ─────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<ActionResult<Cita>> GetCita(int id)
        {
            var cita = await _context.Cita.FindAsync(id);
            if (cita == null || cita.Estado != "Activo") return NotFound();
            return cita;
        }

        // ─── PUT: api/Citas/5  (Gestionar: editar todos los datos de la cita) ─
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCita(int id, EditarCitaDto dto)
        {
            if (id != dto.IdCita)
                return BadRequest(new { mensaje = "El id no coincide con la cita." });

            var cita = await _context.Cita.FindAsync(id);
            if (cita == null)
                return NotFound(new { mensaje = "Cita no encontrada." });

            // Validate Estado value
            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada", "Reagendado" };
            if (!estadosValidos.Contains(dto.EstadoCita))
                return BadRequest(new { mensaje = "Estado de cita no válido. Opciones: Pendiente, Confirmada, Cancelada, Completada, Reagendado." });

            // Validate date, time and conflicts (only for active/editable states)
            if (dto.EstadoCita is "Pendiente" or "Confirmada")
            {
                var today = DateOnly.FromDateTime(DateTime.Today);
                if (dto.Fecha < today)
                    return BadRequest(new { mensaje = "La fecha no puede ser anterior al día actual." });

                if (dto.Hora.Minute != 0 && dto.Hora.Minute != 30)
                    return BadRequest(new { mensaje = "La hora debe ser en intervalos de 30 minutos." });

                if (dto.Hora < new TimeOnly(8, 0))
                    return BadRequest(new { mensaje = "La clínica atiende únicamente desde las 08:00." });

                // Get the service (from DTO if provided, otherwise from existing DetalleCita)
                var servicio = await _context.Servicio.FindAsync(dto.IdServicio);
                if (servicio == null)
                    return BadRequest(new { mensaje = "Servicio no encontrado." });

                var endTime = dto.Hora.Add(servicio.Duracion.ToTimeSpan());
                if (endTime > new TimeOnly(18, 0))
                    return BadRequest(new { mensaje = "La cita excede el horario de atención (cierre 18:00). Seleccione una hora más temprana." });

                // Conflict detection (exclude current cita)
                var conflictos = await GetConflictosHorario(dto.Fecha, dto.Hora, endTime, id);

                var conflictoPaciente = conflictos.FirstOrDefault(c => c.IdCliente == dto.IdCliente);
                if (conflictoPaciente != null)
                    return Conflict(new { mensaje = $"El paciente ya tiene una cita ({conflictoPaciente.Codigo}: {conflictoPaciente.ServicioNombre} de {conflictoPaciente.HoraInicio:HH:mm} a {conflictoPaciente.HoraFin:HH:mm}) que se solapa con el horario solicitado." });

                var conflictoOdontologo = conflictos.FirstOrDefault(c => c.IdUsuario == dto.IdUsuario);
                if (conflictoOdontologo != null)
                    return Conflict(new { mensaje = $"El horario solicitado se solapa con la cita {conflictoOdontologo.Codigo} ({conflictoOdontologo.ServicioNombre} de {conflictoOdontologo.HoraInicio:HH:mm} a {conflictoOdontologo.HoraFin:HH:mm})." });
            }

            // Update Cita fields
            cita.IdCliente         = dto.IdCliente;
            cita.IdUsuario         = dto.IdUsuario;
            cita.Codigo            = dto.Codigo;
            cita.MedioComunicacion = dto.MedioComunicacion;
            cita.Fecha             = dto.Fecha;
            cita.Hora              = dto.Hora;
            cita.EstadoCita        = dto.EstadoCita;
            cita.Estado            = dto.Estado;

            // Update DetalleCita if service changed
            var detalleExistente = await _context.DetalleCita.FirstOrDefaultAsync(d => d.IdCita == id);
            if (detalleExistente != null && detalleExistente.IdServicio != dto.IdServicio)
            {
                detalleExistente.IdServicio = dto.IdServicio;
                _context.Entry(detalleExistente).State = EntityState.Modified;
            }
            else if (detalleExistente == null)
            {
                _context.DetalleCita.Add(new DetalleCita
                {
                    IdCita = id,
                    IdServicio = dto.IdServicio,
                });
            }

            _context.Entry(cita).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CitaExists(id)) return NotFound();
                throw;
            }

            // Sincronizar con Google Calendar
            string googleSyncWarning = null;
            try
            {
                var cliente = await _context.Cliente.FindAsync(dto.IdCliente);
                var servicio = await _context.Servicio.FindAsync(dto.IdServicio);
                var clienteNombre = cliente != null
                    ? $"{cliente.Nombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}".Trim()
                    : "Desconocido";

                if (!string.IsNullOrEmpty(cita.GoogleEventId))
                {
                    await _googleCalendar.UpdateEventAsync(
                        cita.GoogleEventId, cita, clienteNombre, servicio?.Nombre ?? "", servicio?.Duracion ?? new TimeOnly(0, 30));
                }
                else
                {
                    var googleId = await _googleCalendar.CreateEventAsync(
                        cita, clienteNombre, cliente?.Telefono ?? "", servicio?.Nombre ?? "", servicio?.Duracion ?? new TimeOnly(0, 30));
                    cita.GoogleEventId = googleId;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                googleSyncWarning = $"Error al sincronizar con Google Calendar: {ex.Message}";
                Console.Error.WriteLine(googleSyncWarning);
            }

            return Ok(new { mensaje = "Cita actualizada correctamente.", advertenciaGoogle = googleSyncWarning });
        }

        // ─── PATCH: api/Citas/5/estado  (sólo cambia EstadoCita) ─────────────
        /// <summary>
        /// Actualiza únicamente el estado de una cita (Pendiente/Confirmada/Cancelada/Completada).
        /// </summary>
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> PatchEstadoCita(int id, [FromBody] CambioEstadoDto dto)
        {
            var cita = await _context.Cita.FindAsync(id);
            if (cita == null)
                return NotFound(new { mensaje = "Cita no encontrada." });

            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada", "Reagendado" };
            if (!estadosValidos.Contains(dto.EstadoCita))
                return BadRequest(new { mensaje = "Estado no válido. Opciones: Pendiente, Confirmada, Cancelada, Completada, Reagendado." });

            cita.EstadoCita = dto.EstadoCita;
            await _context.SaveChangesAsync();

            // Sincronizar cambio de estado con Google Calendar
            if (!string.IsNullOrEmpty(cita.GoogleEventId))
            {
                try
                {
                    await _googleCalendar.CancelEventAsync(cita.GoogleEventId, dto.EstadoCita);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error al sincronizar estado con Google Calendar: {ex.Message}");
                }
            }

            return Ok(new { mensaje = $"Estado actualizado a '{dto.EstadoCita}'.", idCita = id });
        }

        // ─── DTO: NuevaCita ────────────────────────────────────────────────────
        public class NuevaCitaDto
        {
            public int    IdCliente         { get; set; }
            public int    IdUsuario         { get; set; }
            public string MedioComunicacion { get; set; } = string.Empty;
            public DateOnly Fecha           { get; set; }
            public TimeOnly Hora            { get; set; }
            public int    IdServicio        { get; set; }
            /// <summary>Estado inicial. Si no se envía, se usará "Pendiente".</summary>
            public string EstadoCita        { get; set; } = "Pendiente";
        }

        // ─── DTO: CambioEstado ─────────────────────────────────────────────────
        public class CambioEstadoDto
        {
            public string EstadoCita { get; set; } = string.Empty;
        }

        // ─── DTO: EditarCita ────────────────────────────────────────────────────
        public class EditarCitaDto
        {
            public int     IdCita             { get; set; }
            public int     IdCliente          { get; set; }
            public int     IdUsuario          { get; set; }
            public string  Codigo             { get; set; } = string.Empty;
            public string  MedioComunicacion  { get; set; } = string.Empty;
            public DateOnly Fecha             { get; set; }
            public TimeOnly Hora              { get; set; }
            public string  EstadoCita         { get; set; } = string.Empty;
            public string  Estado             { get; set; } = "Activo";
            public int     IdServicio         { get; set; }
        }

        // ─── Helper: detección de solapamiento de horarios ─────────────────────
        private class ConflictoInfo
        {
            public int     IdCita          { get; set; }
            public string  Codigo          { get; set; } = "";
            public int     IdCliente       { get; set; }
            public int     IdUsuario       { get; set; }
            public TimeOnly HoraInicio     { get; set; }
            public TimeOnly HoraFin        { get; set; }
            public string  ServicioNombre  { get; set; } = "";
        }

        private async Task<List<ConflictoInfo>> GetConflictosHorario(
            DateOnly fecha, TimeOnly newStart, TimeOnly newEnd, int? excludeCitaId = null)
        {
            var query = from c in _context.Cita
                        join d in _context.DetalleCita on c.IdCita equals d.IdCita
                        join s in _context.Servicio on d.IdServicio equals s.IdServicio
                        where c.Fecha == fecha
                           && c.Estado == "Activo"
                           && (c.EstadoCita == "Pendiente" || c.EstadoCita == "Confirmada")
                        select new { c, d, s };

            if (excludeCitaId.HasValue)
                query = query.Where(x => x.c.IdCita != excludeCitaId.Value);

            var results = await query.ToListAsync();

            return results
                .Where(x =>
                {
                    var existingEnd = x.c.Hora.Add(x.s.Duracion.ToTimeSpan());
                    return newStart < existingEnd && x.c.Hora < newEnd;
                })
                .Select(x => new ConflictoInfo
                {
                    IdCita         = x.c.IdCita,
                    Codigo         = x.c.Codigo,
                    IdCliente      = x.c.IdCliente,
                    IdUsuario      = x.c.IdUsuario,
                    HoraInicio     = x.c.Hora,
                    HoraFin        = x.c.Hora.Add(x.s.Duracion.ToTimeSpan()),
                    ServicioNombre = x.s.Nombre,
                })
                .ToList();
        }

        // ─── POST: api/Citas/nueva ─────────────────────────────────────────────
        [HttpPost("nueva")]
        public async Task<ActionResult<Cita>> PostNuevaCita(NuevaCitaDto dto)
        {
            // 1. Validate EstadoCita value
            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada", "Reagendado" };
            if (!estadosValidos.Contains(dto.EstadoCita))
                dto.EstadoCita = "Pendiente"; // fallback

            // 2. Cliente existente y activo
            var cliente = await _context.Cliente.FindAsync(dto.IdCliente);
            if (cliente == null || cliente.Estado != "Activo")
                return NotFound(new { mensaje = "Paciente no encontrado o inactivo." });

            // 3. Usuario existente y activo
            var usuario = await _context.Usuario.FindAsync(dto.IdUsuario);
            if (usuario == null || usuario.Estado != "Activo")
                return BadRequest(new { mensaje = "Usuario inválido o inactivo." });

            // 4. Servicio existente, activo y disponible
            var servicio = await _context.Servicio.FindAsync(dto.IdServicio);
            if (servicio == null)
                return BadRequest(new { mensaje = "Servicio no encontrado." });
            if (servicio.Estado != "Activo" || servicio.EstadoServicio != "Disponible")
                return BadRequest(new { mensaje = "El tratamiento seleccionado no está disponible en este momento." });

            // 5. Fecha no pasada
            var today = DateOnly.FromDateTime(DateTime.Today);
            if (dto.Fecha < today)
                return BadRequest(new { mensaje = "La fecha de la cita no puede ser anterior al día actual." });

            // 6. Hora en intervalos exactos de 30 minutos
            if (dto.Hora.Minute != 0 && dto.Hora.Minute != 30)
                return BadRequest(new { mensaje = "La hora debe ser en intervalos de 30 minutos (ej. 08:00, 08:30, 09:00)." });

            // 7. Horario de atención: 08:00 – 18:00, con duración del servicio
            var workStart = new TimeOnly(8, 0);
            var workEnd   = new TimeOnly(18, 0);
            var endTime   = dto.Hora.Add(servicio.Duracion.ToTimeSpan());

            if (dto.Hora < workStart)
                return BadRequest(new { mensaje = "La clínica atiende únicamente desde las 08:00." });
            if (endTime > workEnd)
                return BadRequest(new { mensaje = "La cita excede el horario de cierre (18:00). Seleccione una hora más temprana considerando la duración del tratamiento." });

            // 8+9. Detección de solapamiento de horarios
            var conflictos = await GetConflictosHorario(dto.Fecha, dto.Hora, endTime);

            var conflictoPaciente = conflictos.FirstOrDefault(c => c.IdCliente == dto.IdCliente);
            if (conflictoPaciente != null)
                return Conflict(new { mensaje = $"El paciente ya tiene una cita ({conflictoPaciente.Codigo}: {conflictoPaciente.ServicioNombre} de {conflictoPaciente.HoraInicio:HH:mm} a {conflictoPaciente.HoraFin:HH:mm}) que se solapa con el horario solicitado." });

            var conflictoOdontologo = conflictos.FirstOrDefault(c => c.IdUsuario == dto.IdUsuario);
            if (conflictoOdontologo != null)
                return Conflict(new { mensaje = $"El horario solicitado se solapa con la cita {conflictoOdontologo.Codigo} ({conflictoOdontologo.ServicioNombre} de {conflictoOdontologo.HoraInicio:HH:mm} a {conflictoOdontologo.HoraFin:HH:mm})." });

            // 10. Generar código único
            string codigoCita;
            bool codigoExiste;
            do
            {
                var randomNum = new Random().Next(10000, 99999);
                codigoCita = $"CIT-{randomNum}";
                codigoExiste = await _context.Cita.AnyAsync(c => c.Codigo == codigoCita);
            } while (codigoExiste);

            // 11. Crear la Cita
            var cita = new Cita
            {
                IdCliente         = dto.IdCliente,
                IdUsuario         = dto.IdUsuario,
                Codigo            = codigoCita,
                MedioComunicacion = dto.MedioComunicacion,
                Fecha             = dto.Fecha,
                Hora              = dto.Hora,
                EstadoCita        = dto.EstadoCita, // ← respeta el estado enviado desde el frontend
                Estado            = "Activo"
            };

            _context.Cita.Add(cita);
            await _context.SaveChangesAsync();

            // 12. Crear DetalleCita
            var detalle = new DetalleCita
            {
                IdCita     = cita.IdCita,
                IdServicio = dto.IdServicio
            };

            _context.DetalleCita.Add(detalle);
            await _context.SaveChangesAsync();

            // 13. Sincronizar con Google Calendar
            string googleSyncError = null;
            try
            {
                var clienteNombre = $"{cliente.Nombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}".Trim();
                var googleEventId = await _googleCalendar.CreateEventAsync(
                    cita, clienteNombre, cliente.Telefono ?? "", servicio.Nombre, servicio.Duracion);

                cita.GoogleEventId = googleEventId;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                googleSyncError = $"Error al sincronizar con Google Calendar: {ex.Message}";
                Console.Error.WriteLine(googleSyncError);
            }

            var result = new { cita, advertenciaGoogle = googleSyncError };
            return CreatedAtAction("GetCita", new { id = cita.IdCita }, result);
        }

        public class DisponibilidadDto
        {
            public string? Fecha { get; set; }
        }

        // ─── GET|POST: api/Citas/disponibilidad ──────────────────────
        [HttpGet("disponibilidad")]
        [HttpPost("disponibilidad")]
        public async Task<ActionResult> Disponibilidad([FromQuery] string? fecha = null, [FromBody] DisponibilidadDto? dto = null)
        {
            var fechaStr = fecha ?? dto?.Fecha ?? DateOnly.FromDateTime(DateTime.Today).ToString("yyyy-MM-dd");
            if (!DateOnly.TryParse(fechaStr, out var fechaParsed))
                return BadRequest(new { success = false, mensaje = "Fecha inválida. Use YYYY-MM-DD." });

            if (fechaParsed.DayOfWeek == DayOfWeek.Saturday || fechaParsed.DayOfWeek == DayOfWeek.Sunday)
                return BadRequest(new { success = false, mensaje = "La clínica solo atiende de lunes a viernes." });

            // Horario laboral
            var workStart = new TimeOnly(8, 0);
            var workEnd = new TimeOnly(18, 0);

            // Obtener la duración mínima entre todos los servicios activos
            var duracionMin = await _context.Servicio
                .Where(s => s.Estado == "Activo" && s.EstadoServicio == "Disponible")
                .MinAsync(s => s.Duracion);
            var intervaloSlots = duracionMin.ToTimeSpan();

            // 1. Obtener eventos de Google Calendar para esa fecha
            var googleEvents = await _googleCalendar.GetAllEventsAsync();
            var eventosOcupados = new List<(TimeOnly inicio, TimeOnly fin)>();

            foreach (var ev in googleEvents)
            {
                if (ev.Start == null) continue;
                DateTime? startDt = ev.Start.DateTimeDateTimeOffset?.DateTime;
                if (startDt == null && !string.IsNullOrEmpty(ev.Start.Date))
                    startDt = DateTime.Parse(ev.Start.Date);
                if (startDt == null) continue;

                DateTime? endDt = ev.End?.DateTimeDateTimeOffset?.DateTime;
                if (endDt == null && ev.End != null && !string.IsNullOrEmpty(ev.End.Date))
                    endDt = DateTime.Parse(ev.End.Date);
                if (endDt == null) continue;

                if (DateOnly.FromDateTime(startDt.Value) == fechaParsed)
                {
                    eventosOcupados.Add((
                        TimeOnly.FromDateTime(startDt.Value),
                        TimeOnly.FromDateTime(endDt.Value)
                    ));
                }
            }

            // 2. Obtener citas de la BD para esa fecha
            var citasBD = await _context.Cita
                .Where(c => c.Fecha == fechaParsed && c.Estado == "Activo" && (c.EstadoCita == "Pendiente" || c.EstadoCita == "Confirmada"))
                .Include(c => c.DetalleCitas)
                .ThenInclude(d => d.Servicio)
                .ToListAsync();

            foreach (var c in citasBD)
            {
                var detalle = c.DetalleCitas.FirstOrDefault();
                var duracion = detalle?.Servicio?.Duracion ?? duracionMin;
                eventosOcupados.Add((c.Hora, c.Hora.Add(duracion.ToTimeSpan())));
            }

            // 3. Generar slots libres (cada 30 min)
            var slotsLibres = new List<string>();
            var current = workStart;
            var duracionDefault = intervaloSlots;

            while (current.Add(duracionDefault) <= workEnd)
            {
                var slotEnd = current.Add(duracionDefault);
                var ocupado = eventosOcupados.Any(e => current < e.fin && e.inicio < slotEnd);

                if (!ocupado)
                {
                    slotsLibres.Add(current.ToString("HH:mm"));
                }

                current = current.Add(new TimeSpan(0, 30, 0));
            }

            return Ok(new
            {
                success = true,
                fecha = fechaStr,
                fechaDia = fechaParsed.DayOfWeek.ToString(),
                slotsLibres = slotsLibres,
                horarioLaboral = new { inicio = workStart.ToString("HH:mm"), fin = workEnd.ToString("HH:mm") }
            });
        }

        // ─── DTO: Reagendar ───────────────────────────────────────────────────
        public class ReagendarDto
        {
            public string ClienteTelefono { get; set; } = string.Empty;
            public string FechaActual { get; set; } = string.Empty;
            public string HoraActual { get; set; } = string.Empty;
            public string NuevaFecha { get; set; } = string.Empty;
            public string NuevaHora { get; set; } = string.Empty;
            public string? Servicio { get; set; }
            public string? MedioComunicacion { get; set; }
        }

        // ─── POST: api/Citas/reagendar ────────────────────────────────────────
        [HttpPost("reagendar")]
        public async Task<ActionResult> Reagendar(ReagendarDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ClienteTelefono))
                return BadRequest(new { success = false, mensaje = "El teléfono del cliente es requerido." });

            if (!DateOnly.TryParse(dto.FechaActual, out var fechaVieja))
                return BadRequest(new { success = false, mensaje = $"FechaActual inválida: '{dto.FechaActual}'." });

            if (!TimeOnly.TryParse(dto.HoraActual, out var horaVieja))
                return BadRequest(new { success = false, mensaje = $"HoraActual inválida: '{dto.HoraActual}'." });

            if (!DateOnly.TryParse(dto.NuevaFecha, out var fechaNueva))
                return BadRequest(new { success = false, mensaje = $"NuevaFecha inválida: '{dto.NuevaFecha}'." });

            if (fechaNueva.DayOfWeek == DayOfWeek.Saturday || fechaNueva.DayOfWeek == DayOfWeek.Sunday)
                return BadRequest(new { success = false, mensaje = "La clínica solo atiende de lunes a viernes." });

            if (!TimeOnly.TryParse(dto.NuevaHora, out var horaNueva))
                return BadRequest(new { success = false, mensaje = $"NuevaHora inválida: '{dto.NuevaHora}'." });

            // Buscar cliente
            var cliente = await _context.Cliente
                .FirstOrDefaultAsync(c => c.Telefono == dto.ClienteTelefono && c.Estado == "Activo");
            if (cliente == null)
                return NotFound(new { success = false, mensaje = "Cliente no encontrado con ese teléfono." });

            // Buscar cita existente (activa) en esa fecha/hora
            var citaVieja = await _context.Cita
                .Where(c => c.IdCliente == cliente.IdCliente
                         && c.Fecha == fechaVieja
                         && c.Hora == horaVieja
                         && c.Estado == "Activo"
                         && c.EstadoCita != "Cancelada"
                         && c.EstadoCita != "Reagendado"
                         && c.EstadoCita != "Completada")
                .Include(c => c.DetalleCitas).ThenInclude(d => d.Servicio)
                .FirstOrDefaultAsync();

            if (citaVieja == null)
                return NotFound(new { success = false, mensaje = "No se encontró una cita activa en esa fecha/hora para el cliente." });

            // Marcar cita vieja como Reagendado y eliminar evento Calendar
            citaVieja.EstadoCita = "Reagendado";
            if (!string.IsNullOrEmpty(citaVieja.GoogleEventId))
            {
                try { await _googleCalendar.DeleteEventAsync(citaVieja.GoogleEventId); }
                catch (Exception ex) { Console.Error.WriteLine($"Error al eliminar evento Calendar: {ex.Message}"); }
                citaVieja.GoogleEventId = null;
            }
            await _context.SaveChangesAsync();

            // Crear nueva cita (reusa lógica de agendar-desde-n8n)
            var servicio = !string.IsNullOrWhiteSpace(dto.Servicio)
                ? await _context.Servicio
                    .Where(s => s.Estado == "Activo" && s.EstadoServicio == "Disponible")
                    .FirstOrDefaultAsync(s => EF.Functions.Like(s.Nombre, $"%{dto.Servicio}%"))
                : null;
            servicio ??= await _context.Servicio.FirstOrDefaultAsync(s => s.Estado == "Activo" && s.EstadoServicio == "Disponible");
            if (servicio == null)
                return BadRequest(new { success = false, mensaje = "No hay servicios disponibles." });

            var endTime = horaNueva.Add(servicio.Duracion.ToTimeSpan());
            if (horaNueva < new TimeOnly(8, 0) || endTime > new TimeOnly(18, 0))
                return BadRequest(new { success = false, mensaje = "El horario está fuera del horario de atención (08:00-18:00)." });

            // Validar conflictos (excluyendo la cita vieja)
            var conflictos = await GetConflictosHorario(fechaNueva, horaNueva, endTime);
            if (conflictos.Any(c => c.IdCliente == cliente.IdCliente))
                return Conflict(new { success = false, mensaje = "El paciente ya tiene otra cita en ese nuevo horario." });
            if (conflictos.Any())
                return Conflict(new { success = false, mensaje = "El nuevo horario solicitado ya está ocupado." });

            // Crear código
            string codigoNuevo;
            do { codigoNuevo = $"CIT-{new Random().Next(10000, 99999)}"; }
            while (await _context.Cita.AnyAsync(c => c.Codigo == codigoNuevo));

            var citaNueva = new Cita
            {
                IdCliente = cliente.IdCliente,
                IdUsuario = 1,
                Codigo = codigoNuevo,
                MedioComunicacion = dto.MedioComunicacion ?? "WhatsApp",
                Fecha = fechaNueva,
                Hora = horaNueva,
                EstadoCita = "Confirmada",
                Estado = "Activo"
            };
            _context.Cita.Add(citaNueva);
            await _context.SaveChangesAsync();

            _context.DetalleCita.Add(new DetalleCita { IdCita = citaNueva.IdCita, IdServicio = servicio.IdServicio });
            await _context.SaveChangesAsync();

            // Sincronizar nueva cita con Calendar
            string? googleSyncError = null;
            try
            {
                var clienteNombre = $"{cliente.Nombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}".Trim();
                var googleEventId = await _googleCalendar.CreateEventAsync(
                    citaNueva, clienteNombre, cliente.Telefono ?? "", servicio.Nombre, servicio.Duracion);
                citaNueva.GoogleEventId = googleEventId;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                googleSyncError = ex.Message;
            }

            return Ok(new
            {
                success = true,
                mensaje = $"Cita reagendada. Anterior ({citaVieja.Codigo}) marcada como Reagendado. Nueva cita {codigoNuevo} creada para {fechaNueva} a las {horaNueva}.",
                codigoAnterior = citaVieja.Codigo,
                codigoNuevo = codigoNuevo,
                advertenciaGoogle = googleSyncError
            });
        }

        // ─── DTO: AgendarDesdeN8n ─────────────────────────────────────────────
        public class AgendarDesdeN8nDto
        {
            // Opción A: IDs (para webhook)
            public int? IdCliente { get; set; }
            public int? IdUsuario { get; set; }
            public int? IdServicio { get; set; }

            // Opción B: Nombres (para AI Agent)
            public string? ClienteNombre { get; set; }
            public string? ClienteTelefono { get; set; }
            public string? ClienteCi { get; set; }
            public string? Servicio { get; set; }

            // Comunes
            public string? MedioComunicacion { get; set; }
            public string? Fecha { get; set; }
            public string? Hora { get; set; }
            public string? EstadoCita { get; set; }

            // Reagendado (opcional — si se envía, marca la cita anterior como Reagendado)
            public string? FechaActual { get; set; }
            public string? HoraActual { get; set; }
        }

        // ─── POST: api/Citas/agendar-desde-n8n ───────────────────────────────
        [HttpPost("agendar-desde-n8n")]
        public async Task<ActionResult> AgendarDesdeN8n(AgendarDesdeN8nDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Fecha) || string.IsNullOrWhiteSpace(dto.Hora))
                return BadRequest(new { success = false, mensaje = "La fecha y hora son requeridas." });

            if (!DateOnly.TryParse(dto.Fecha, out var fecha))
                return BadRequest(new { success = false, mensaje = $"Fecha inválida: '{dto.Fecha}'. Use formato YYYY-MM-DD." });

            if (!TimeOnly.TryParse(dto.Hora, out var hora))
                return BadRequest(new { success = false, mensaje = $"Hora inválida: '{dto.Hora}'. Use formato HH:mm:ss." });

            var today = DateOnly.FromDateTime(DateTime.Today);
            if (fecha < today)
                return BadRequest(new { success = false, mensaje = "La fecha no puede ser anterior al día de hoy." });

            if (fecha.DayOfWeek == DayOfWeek.Saturday || fecha.DayOfWeek == DayOfWeek.Sunday)
                return BadRequest(new { success = false, mensaje = "La clínica solo atiende de lunes a viernes." });

            var medio = dto.MedioComunicacion ?? "WhatsApp";
            if (medio != "WhatsApp" && medio != "Telefono" && medio != "Recepcion")
                return BadRequest(new { success = false, mensaje = "medioComunicacion debe ser 'WhatsApp', 'Telefono' o 'Recepcion'." });

            var estado = dto.EstadoCita ?? "Pendiente";
            if (estado != "Pendiente" && estado != "Confirmada")
                return BadRequest(new { success = false, mensaje = "estadoCita debe ser 'Pendiente' o 'Confirmada'." });

            // ─── Buscar o crear cliente ───────────────────────────────────────
            Cliente cliente;
            if (dto.IdCliente.HasValue && dto.IdCliente.Value > 0)
            {
                // Opción A: buscar por ID (webhook)
                cliente = await _context.Cliente
                    .FirstOrDefaultAsync(c => c.IdCliente == dto.IdCliente.Value && c.Estado == "Activo");
                if (cliente == null)
                    return BadRequest(new { success = false, mensaje = $"Cliente con id {dto.IdCliente} no encontrado." });
            }
            else if (!string.IsNullOrWhiteSpace(dto.ClienteTelefono) || !string.IsNullOrWhiteSpace(dto.ClienteCi))
            {
                // Opción B: buscar o crear por teléfono/CI (AI Agent)
                cliente = null;

                if (!string.IsNullOrWhiteSpace(dto.ClienteCi) && int.TryParse(dto.ClienteCi, out var ciBusqueda))
                {
                    cliente = await _context.Cliente
                        .FirstOrDefaultAsync(c => c.Ci == ciBusqueda && c.Estado == "Activo");

                    if (cliente != null && !string.IsNullOrWhiteSpace(dto.ClienteNombre))
                    {
                        string Normalizar(string s) => new string(
                            s.Normalize(NormalizationForm.FormD)
                             .Where(c => char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                             .ToArray()
                        ).Normalize(NormalizationForm.FormC).ToLowerInvariant();

                        var nombreGuardado = Normalizar($"{cliente.Nombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}".Trim());
                        var nombreRecibido = Normalizar(dto.ClienteNombre.Trim());

                        var palabrasGuardado = nombreGuardado.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                        var palabrasRecibido = nombreRecibido.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                        var coincidencias = palabrasGuardado.Intersect(palabrasRecibido).Count();
                        var maxPalabras = Math.Max(palabrasGuardado.Length, palabrasRecibido.Length);

                        if (coincidencias < Math.Min(maxPalabras, 2) || nombreRecibido.All(c => !char.IsLetter(c)))
                        {
                            var nombreMostrar = $"{cliente.Nombre} {cliente.ApellidoPaterno}".Trim();
                            return BadRequest(new
                            {
                                success = false,
                                mensaje = $"El CI ingresado pertenece a {nombreMostrar}. Verifica los datos o usa tu propio CI."
                            });
                        }
                    }
                }

                if (cliente == null && !string.IsNullOrWhiteSpace(dto.ClienteTelefono))
                {
                    cliente = await _context.Cliente
                        .FirstOrDefaultAsync(c => c.Telefono == dto.ClienteTelefono && c.Estado == "Activo");
                }

                if (cliente == null)
                {
                    var nombreCompleto = (dto.ClienteNombre ?? "Paciente").Trim();

                    // Validaciones básicas del nombre
                    if (nombreCompleto.Length < 3)
                        return BadRequest(new { success = false, mensaje = "El nombre debe tener al menos 3 caracteres." });
                    if (nombreCompleto.All(char.IsDigit))
                        return BadRequest(new { success = false, mensaje = "El nombre no puede ser solo números." });
                    if (!nombreCompleto.Any(char.IsLetter))
                        return BadRequest(new { success = false, mensaje = "El nombre debe contener al menos una letra." });
                    if (nombreCompleto.GroupBy(c => c).Any(g => g.Count() > nombreCompleto.Length * 0.6))
                        return BadRequest(new { success = false, mensaje = "Nombre inválido (caracteres repetitivos)." });

                    if (string.IsNullOrWhiteSpace(dto.ClienteCi) || !int.TryParse(dto.ClienteCi, out var ciNuevo))
                        return BadRequest(new { success = false, mensaje = "El CI (cédula de identidad) es requerido para registrar un nuevo cliente." });

                    cliente = new Cliente
                    {
                        Ci = ciNuevo,
                        Nombre = nombreCompleto,
                        ApellidoPaterno = "",
                        ApellidoMaterno = "",
                        Telefono = dto.ClienteTelefono ?? "",
                        TipoSangre = "No especificado",
                        FechaNacimiento = new DateOnly(2000, 1, 1),
                        Estado = "Activo"
                    };
                    _context.Cliente.Add(cliente);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                return BadRequest(new { success = false, mensaje = "Debe enviar clienteCi, clienteTelefono o idCliente." });
            }

            // ─── Buscar servicio ──────────────────────────────────────────────
            Servicio servicio;
            if (dto.IdServicio.HasValue && dto.IdServicio.Value > 0)
            {
                // Opción A: buscar por ID (webhook)
                servicio = await _context.Servicio
                    .FirstOrDefaultAsync(s => s.IdServicio == dto.IdServicio.Value && s.Estado == "Activo" && s.EstadoServicio == "Disponible");
                if (servicio == null)
                    return BadRequest(new { success = false, mensaje = $"Servicio con id {dto.IdServicio} no encontrado o no disponible." });
            }
            else if (!string.IsNullOrWhiteSpace(dto.Servicio))
            {
                // Opción B: buscar por nombre (AI Agent)
                servicio = await _context.Servicio
                    .Where(s => s.Estado == "Activo" && s.EstadoServicio == "Disponible")
                    .FirstOrDefaultAsync(s => EF.Functions.Like(s.Nombre, $"%{dto.Servicio}%"));
                if (servicio == null)
                    servicio = await _context.Servicio.FirstOrDefaultAsync(s => s.Estado == "Activo" && s.EstadoServicio == "Disponible");
                if (servicio == null)
                    return BadRequest(new { success = false, mensaje = "No hay servicios disponibles." });
            }
            else
            {
                return BadRequest(new { success = false, mensaje = "Debe enviar idServicio o servicio (nombre)." });
            }

            // ─── REAGENDADO: si vienen fechaActual/horaActual, marcar cita anterior ──
            string? advertenciaReagendar = null;
            if (!string.IsNullOrWhiteSpace(dto.FechaActual) && !string.IsNullOrWhiteSpace(dto.HoraActual))
            {
                if (!DateOnly.TryParse(dto.FechaActual, out var fechaVieja))
                    return BadRequest(new { success = false, mensaje = $"FechaActual inválida: '{dto.FechaActual}'." });
                if (!TimeOnly.TryParse(dto.HoraActual, out var horaVieja))
                    return BadRequest(new { success = false, mensaje = $"HoraActual inválida: '{dto.HoraActual}'." });

                var citaVieja = await _context.Cita
                    .Where(c => c.IdCliente == cliente.IdCliente
                             && c.Fecha == fechaVieja
                             && c.Hora == horaVieja
                             && c.Estado == "Activo"
                             && c.EstadoCita != "Cancelada"
                             && c.EstadoCita != "Reagendado"
                             && c.EstadoCita != "Completada")
                    .Include(c => c.DetalleCitas).ThenInclude(d => d.Servicio)
                    .FirstOrDefaultAsync();

                if (citaVieja == null)
                {
                    advertenciaReagendar = "No se encontró una cita activa en esa fecha/hora para marcar como reagendada. Se creará solo la nueva cita.";
                }
                else
                {
                    citaVieja.EstadoCita = "Reagendado";
                    if (!string.IsNullOrEmpty(citaVieja.GoogleEventId))
                    {
                        try { await _googleCalendar.DeleteEventAsync(citaVieja.GoogleEventId); }
                        catch (Exception ex) { Console.Error.WriteLine($"Error al eliminar evento Calendar: {ex.Message}"); }
                        citaVieja.GoogleEventId = null;
                    }
                    await _context.SaveChangesAsync();
                }
            }

            var workStart = new TimeOnly(8, 0);
            var workEnd = new TimeOnly(18, 0);
            var endTime = hora.Add(servicio.Duracion.ToTimeSpan());

            if (hora < workStart)
                return BadRequest(new { success = false, mensaje = "La clínica atiende desde las 08:00." });
            if (endTime > workEnd)
                return BadRequest(new { success = false, mensaje = "La cita excede el horario de cierre (18:00)." });

            if (hora.Minute != 0 && hora.Minute != 30)
                return BadRequest(new { success = false, mensaje = "La hora debe ser en intervalos de 30 minutos." });

            var conflictos = await GetConflictosHorario(fecha, hora, endTime);
            if (conflictos.Any(c => c.IdCliente == cliente.IdCliente))
                return Conflict(new { success = false, mensaje = "El paciente ya tiene una cita en ese horario." });
            if (conflictos.Any())
                return Conflict(new { success = false, mensaje = "El horario solicitado ya está ocupado por otra cita." });

            string codigoCita;
            bool codigoExiste;
            do
            {
                var randomNum = new Random().Next(10000, 99999);
                codigoCita = $"CIT-{randomNum}";
                codigoExiste = await _context.Cita.AnyAsync(c => c.Codigo == codigoCita);
            } while (codigoExiste);

            var cita = new Cita
            {
                IdCliente = cliente.IdCliente,
                IdUsuario = dto.IdUsuario ?? 1,
                Codigo = codigoCita,
                MedioComunicacion = medio,
                Fecha = fecha,
                Hora = hora,
                EstadoCita = estado,
                Estado = "Activo"
            };

            _context.Cita.Add(cita);
            await _context.SaveChangesAsync();

            var detalle = new DetalleCita
            {
                IdCita = cita.IdCita,
                IdServicio = servicio.IdServicio
            };
            _context.DetalleCita.Add(detalle);
            await _context.SaveChangesAsync();

            string googleSyncError = null;
            try
            {
                var clienteNombre = $"{cliente.Nombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}".Trim();
                var googleEventId = await _googleCalendar.CreateEventAsync(
                    cita, clienteNombre, cliente.Telefono ?? "", servicio.Nombre, servicio.Duracion);
                cita.GoogleEventId = googleEventId;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                googleSyncError = ex.Message;
                Console.Error.WriteLine($"Error al sincronizar con Google Calendar: {ex.Message}");
            }

            return Ok(new
            {
                success = true,
                mensaje = $"Cita creada para {cliente.Nombre} {cliente.ApellidoPaterno} el {dto.Fecha} a las {dto.Hora}",
                codigo = codigoCita,
                advertenciaGoogle = googleSyncError,
                advertenciaReagendar = advertenciaReagendar
            });
        }

        // ─── POST: api/Citas (scaffold default, kept for compatibility) ───────
        [HttpPost]
        public async Task<ActionResult<Cita>> PostCita(Cita cita)
        {
            _context.Cita.Add(cita);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetCita", new { id = cita.IdCita }, cita);
        }

        // ─── DELETE: api/Citas/5 ───────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCita(int id)
        {
            var cita = await _context.Cita.FindAsync(id);
            if (cita == null || cita.Estado != "Activo") return NotFound();
            
            // Soft delete: set state to "Inactivo" to avoid physical data loss
            cita.Estado = "Inactivo";
            await _context.SaveChangesAsync();

            // Eliminar evento de Google Calendar si existe
            if (!string.IsNullOrEmpty(cita.GoogleEventId))
            {
                try
                {
                    await _googleCalendar.DeleteEventAsync(cita.GoogleEventId);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error al eliminar evento de Google Calendar: {ex.Message}");
                }
            }
            
            return NoContent();
        }

        // ─── DTO: CancelarDesdeN8n ──────────────────────────────────────────────
        public class CancelarDesdeN8nDto
        {
            public string? ClienteNombre { get; set; }
            public string? ClienteTelefono { get; set; }
            public string? ClienteCi { get; set; }
        }

        // ─── POST: api/Citas/cancelar-desde-n8n ──────────────────────────────────
        [HttpPost("cancelar-desde-n8n")]
        public async Task<ActionResult> CancelarDesdeN8n(CancelarDesdeN8nDto dto)
        {
            Cliente? cliente = null;

            if (!string.IsNullOrWhiteSpace(dto.ClienteCi) && int.TryParse(dto.ClienteCi, out var ci))
                cliente = await _context.Cliente.FirstOrDefaultAsync(c => c.Ci == ci && c.Estado == "Activo");

            if (cliente == null && !string.IsNullOrWhiteSpace(dto.ClienteTelefono))
                cliente = await _context.Cliente.FirstOrDefaultAsync(c => c.Telefono == dto.ClienteTelefono && c.Estado == "Activo");

            if (cliente == null)
                return NotFound(new { success = false, mensaje = "Cliente no encontrado con esos datos." });

            var cita = await _context.Cita
                .Where(c => c.IdCliente == cliente.IdCliente
                         && c.Estado == "Activo"
                         && c.EstadoCita != "Cancelada"
                         && c.EstadoCita != "Reagendado"
                         && c.EstadoCita != "Completada")
                .OrderByDescending(c => c.Fecha)
                .ThenByDescending(c => c.Hora)
                .FirstOrDefaultAsync();

            if (cita == null)
                return NotFound(new { success = false, mensaje = "No se encontró una cita activa para cancelar." });

            cita.EstadoCita = "Cancelada";

            if (!string.IsNullOrEmpty(cita.GoogleEventId))
            {
                try { await _googleCalendar.DeleteEventAsync(cita.GoogleEventId); }
                catch (Exception ex) { Console.Error.WriteLine($"Error al eliminar evento Calendar: {ex.Message}"); }
                cita.GoogleEventId = null;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                mensaje = $"Cita {cita.Codigo} del {cita.Fecha} a las {cita.Hora} cancelada.",
                codigo = cita.Codigo
            });
        }

        private bool CitaExists(int id) =>
            _context.Cita.Any(e => e.IdCita == id);
    }
}
