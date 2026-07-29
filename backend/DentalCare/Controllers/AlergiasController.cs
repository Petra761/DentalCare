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
    public class AlergiasController : ControllerBase
    {
        private readonly DentalCareContext _context;

        public AlergiasController(DentalCareContext context)
        {
            _context = context;
        }

        // GET: api/Alergias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alergia>>> GetAlergia()
        {
            return await _context.Alergia.ToListAsync();
        }

        // GET: api/Alergias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Alergia>> GetAlergia(int id)
        {
            var alergia = await _context.Alergia.FindAsync(id);

            if (alergia == null)
            {
                return NotFound();
            }

            return alergia;
        }

        // PUT: api/Alergias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlergia(int id, Alergia alergia)
        {
            if (id != alergia.IdAlergia)
            {
                return BadRequest();
            }

            _context.Entry(alergia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlergiaExists(id))
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

        // POST: api/Alergias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Alergia>> PostAlergia(Alergia alergia)
        {
            _context.Alergia.Add(alergia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAlergia", new { id = alergia.IdAlergia }, alergia);
        }

        // DELETE: api/Alergias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlergia(int id)
        {
            var alergia = await _context.Alergia.FindAsync(id);
            if (alergia == null)
            {
                return NotFound();
            }

            _context.Alergia.Remove(alergia);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlergiaExists(int id)
        {
            return _context.Alergia.Any(e => e.IdAlergia == id);
        }
    }
}
