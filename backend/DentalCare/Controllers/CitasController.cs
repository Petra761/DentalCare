using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DentalCare.Clases;
using DentalCare.Data;

namespace DentalCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CitasController : ControllerBase
    {
        private readonly DentalCareContext _context;

        public CitasController(DentalCareContext context)
        {
            _context = context;
        }

        // ─── GET: api/Citas ────────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cita>>> GetCita()
        {
            return await _context.Cita.Where(c => c.Estado == "Activo").ToListAsync();
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
            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada" };
            if (!estadosValidos.Contains(dto.EstadoCita))
                return BadRequest(new { mensaje = "Estado de cita no válido. Opciones: Pendiente, Confirmada, Cancelada, Completada." });

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

            return NoContent();
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

            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada" };
            if (!estadosValidos.Contains(dto.EstadoCita))
                return BadRequest(new { mensaje = "Estado no válido. Opciones: Pendiente, Confirmada, Cancelada, Completada." });

            cita.EstadoCita = dto.EstadoCita;
            await _context.SaveChangesAsync();

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
            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada" };
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

            return CreatedAtAction("GetCita", new { id = cita.IdCita }, cita);
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
            
            return NoContent();
        }

        private bool CitaExists(int id) =>
            _context.Cita.Any(e => e.IdCita == id);
    }
}
