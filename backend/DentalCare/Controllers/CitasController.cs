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

        // GET: api/Citas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cita>>> GetCita()
        {
            return await _context.Cita
                .Include(c => c.DetalleCitas)
                    .ThenInclude(d => d.Servicio)
                .ToListAsync();
        }

        // GET: api/Citas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cita>> GetCita(int id)
        {
            var cita = await _context.Cita
                .Include(c => c.DetalleCitas)
                    .ThenInclude(d => d.Servicio)
                .FirstOrDefaultAsync(c => c.IdCita == id);

            if (cita == null)
            {
                return NotFound();
            }

            return cita;
        }

        // PUT: api/Citas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCita(int id, Cita cita)
        {
            if (id != cita.IdCita)
            {
                return BadRequest("El ID de la ruta no coincide con el objeto.");
            }

            // Validar solapamiento excluyendo la cita actual
            var errorValidacion = await ValidarDisponibilidadCitaAsync(cita, idExcluir: id);
            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            _context.Entry(cita).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CitaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Citas
        [HttpPost]
        public async Task<ActionResult<Cita>> PostCita(Cita cita)
        {
            // Validar solapamiento de horarios
            var errorValidacion = await ValidarDisponibilidadCitaAsync(cita);
            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            _context.Cita.Add(cita);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCita", new { id = cita.IdCita }, cita);
        }

        // DELETE: api/Citas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCita(int id)
        {
            var cita = await _context.Cita.FindAsync(id);
            if (cita == null)
            {
                return NotFound();
            }

            _context.Cita.Remove(cita);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CitaExists(int id)
        {
            return _context.Cita.Any(e => e.IdCita == id);
        }

        #region Métodos de Validación

        /// <summary>
        /// Comprueba si la cita ingresada se solapa con alguna cita existente del mismo usuario/médico.
        /// </summary>
        private async Task<string?> ValidarDisponibilidadCitaAsync(Cita nuevaCita, int? idExcluir = null)
        {
            if (nuevaCita.DetalleCitas == null || !nuevaCita.DetalleCitas.Any())
            {
                return "La cita debe contener al menos un servicio asignado en el detalle.";
            }

            // 1. Obtener IDs de los servicios solicitados
            var serviciosIds = nuevaCita.DetalleCitas.Select(d => d.IdServicio).ToList();

            // 2. Cargar servicios desde la base de datos
            var servicios = await _context.Servicio
                .Where(s => serviciosIds.Contains(s.IdServicio))
                .ToListAsync();

            if (servicios.Count != serviciosIds.Distinct().Count())
            {
                return "Uno o más servicios especificados no existen.";
            }

            // 3. Sumar duraciones
            TimeSpan duracionTotalNueva = TimeSpan.Zero;
            foreach (var servicio in servicios)
            {
                duracionTotalNueva += servicio.Duracion.ToTimeSpan();
            }

            // 4. Combinar DateOnly + TimeOnly a DateTime para calcular rangos
            DateTime inicioNueva = nuevaCita.Fecha.ToDateTime(nuevaCita.Hora);
            DateTime finNueva = inicioNueva.Add(duracionTotalNueva);

            // 5. Cargar citas del mismo usuario y fecha
            var queryCitasExistentes = _context.Cita
                .Where(c => c.IdUsuario == nuevaCita.IdUsuario
                         && c.Fecha == nuevaCita.Fecha
                         && c.Estado != "Cancelado");

            if (idExcluir.HasValue)
            {
                queryCitasExistentes = queryCitasExistentes.Where(c => c.IdCita != idExcluir.Value);
            }

            var citasDelDia = await queryCitasExistentes
                .Include(c => c.DetalleCitas)
                    .ThenInclude(d => d.Servicio)
                .ToListAsync();

            // 6. Verificar traslape de rangos
            foreach (var citaExistente in citasDelDia)
            {
                TimeSpan duracionExistente = TimeSpan.Zero;
                foreach (var detalle in citaExistente.DetalleCitas)
                {
                    if (detalle.Servicio != null)
                    {
                        duracionExistente += detalle.Servicio.Duracion.ToTimeSpan();
                    }
                }

                DateTime inicioExistente = citaExistente.Fecha.ToDateTime(citaExistente.Hora);
                DateTime finExistente = inicioExistente.Add(duracionExistente);

                if (inicioNueva < finExistente && finNueva > inicioExistente)
                {
                    return $"El horario seleccionado ({inicioNueva:HH:mm} - {finNueva:HH:mm}) se solapa con una cita existente ({inicioExistente:HH:mm} - {finExistente:HH:mm}).";
                }
            }

            return null;
        }

        #endregion
    }
}