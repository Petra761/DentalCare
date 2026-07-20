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
    public class AlergiasClienteController : ControllerBase
    {
        private readonly DentalCareContext _context;

        public AlergiasClienteController(DentalCareContext context)
        {
            _context = context;
        }

        // GET: api/AlergiasCliente
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlergiaCliente>>> GetAlergiaCliente()
        {
            return await _context.AlergiaCliente.ToListAsync();
        }

        // GET: api/AlergiasCliente/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AlergiaCliente>> GetAlergiaCliente(int id)
        {
            var alergiaCliente = await _context.AlergiaCliente.FindAsync(id);

            if (alergiaCliente == null)
            {
                return NotFound();
            }

            return alergiaCliente;
        }

        // PUT: api/AlergiasCliente/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlergiaCliente(int id, AlergiaCliente alergiaCliente)
        {
            if (id != alergiaCliente.IdAlergiaCliente)
            {
                return BadRequest();
            }

            _context.Entry(alergiaCliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlergiaClienteExists(id))
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

        // POST: api/AlergiasCliente
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AlergiaCliente>> PostAlergiaCliente(AlergiaCliente alergiaCliente)
        {
            _context.AlergiaCliente.Add(alergiaCliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAlergiaCliente", new { id = alergiaCliente.IdAlergiaCliente }, alergiaCliente);
        }

        // DELETE: api/AlergiasCliente/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlergiaCliente(int id)
        {
            var alergiaCliente = await _context.AlergiaCliente.FindAsync(id);
            if (alergiaCliente == null)
            {
                return NotFound();
            }

            _context.AlergiaCliente.Remove(alergiaCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlergiaClienteExists(int id)
        {
            return _context.AlergiaCliente.Any(e => e.IdAlergiaCliente == id);
        }
    }
}
