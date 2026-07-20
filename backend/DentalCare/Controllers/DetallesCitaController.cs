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
    public class DetallesCitaController : ControllerBase
    {
        private readonly DentalCareContext _context;

        public DetallesCitaController(DentalCareContext context)
        {
            _context = context;
        }

        // GET: api/DetallesCita
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetalleCita>>> GetDetalleCita()
        {
            return await _context.DetalleCita.ToListAsync();
        }

        // GET: api/DetallesCita/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DetalleCita>> GetDetalleCita(int id)
        {
            var detalleCita = await _context.DetalleCita.FindAsync(id);

            if (detalleCita == null)
            {
                return NotFound();
            }

            return detalleCita;
        }

        // PUT: api/DetallesCita/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDetalleCita(int id, DetalleCita detalleCita)
        {
            if (id != detalleCita.IdDetalleCita)
            {
                return BadRequest();
            }

            _context.Entry(detalleCita).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DetalleCitaExists(id))
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

        // POST: api/DetallesCita
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DetalleCita>> PostDetalleCita(DetalleCita detalleCita)
        {
            _context.DetalleCita.Add(detalleCita);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDetalleCita", new { id = detalleCita.IdDetalleCita }, detalleCita);
        }

        // DELETE: api/DetallesCita/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDetalleCita(int id)
        {
            var detalleCita = await _context.DetalleCita.FindAsync(id);
            if (detalleCita == null)
            {
                return NotFound();
            }

            _context.DetalleCita.Remove(detalleCita);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DetalleCitaExists(int id)
        {
            return _context.DetalleCita.Any(e => e.IdDetalleCita == id);
        }
    }
}
