using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
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
    public class ClientesController : ControllerBase
    {
        private readonly DentalCareContext _context;

        public ClientesController(DentalCareContext context)
        {
            _context = context;
        }

        // GET: api/Clientes
        [HttpGet]
        public async Task<IActionResult> GetCliente(
            [FromQuery] int pagina = 1, 
            [FromQuery] int limite = 5, 
            [FromQuery] string? busqueda = null)
        {
            
            var query = _context.Cliente.AsQueryable();

            
            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                busqueda = busqueda.ToLower();
                query = query.Where(c => 
                    c.Nombre.ToLower().Contains(busqueda) ||
                    c.ApellidoPaterno.ToLower().Contains(busqueda) ||
                    c.ApellidoMaterno.ToLower().Contains(busqueda) ||
                    c.Ci.ToString().Contains(busqueda) ||
                    (c.Telefono != null && c.Telefono.Contains(busqueda))
                );
            }

            
            var totalPacientes = await query.CountAsync();

            
            var paginasTotales = (int)Math.Ceiling(totalPacientes / (double)limite);

            
            var pacientes = await query
                .OrderBy(c => c.IdCliente)
                .Skip((pagina - 1) * limite)
                .Take(limite)
                .Select(c => new 
                {
                    c.IdCliente,
                    c.Ci,
                    NombreCompleto = (c.Nombre + " " + c.ApellidoPaterno + " " + c.ApellidoMaterno).Trim(),
                    c.Nombre,
                    c.ApellidoPaterno,
                    c.ApellidoMaterno,
                    c.TipoSangre,
                    c.FechaNacimiento,
                    Telefono = c.Telefono ?? "",
                    c.Estado
                })
                .ToListAsync();

            
            return Ok(new
            {
                TotalPacientes = totalPacientes,
                PaginaActual = pagina,
                PaginasTotales = paginasTotales,
                Pacientes = pacientes
            });
        }

        [HttpGet("estadisticas")]
        public async Task<IActionResult> GetEstadisticas()
        {
            // Obtiene directamente el conteo total de la tabla Cliente
            var totalPacientes = await _context.Cliente.CountAsync();

            return Ok(new
            {
                TotalPacientes = totalPacientes
            });
        }
        // GET: api/Clientes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Cliente
                .Include(c => c.AlergiaClientes) 
                .FirstOrDefaultAsync(c => c.IdCliente == id);

            if (cliente == null)
            {
                return NotFound(new { mensaje = "El cliente no existe o fue eliminado." });
            }

            return Ok(cliente);
        }
        
        // PUT: api/Clientes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(int id, [FromBody] Cliente clienteDto)
        {
            if (id != clienteDto.IdCliente)
            {
                return BadRequest(new { mensaje = "El ID de la URL no coincide con el del objeto enviado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var soloLetras = new Regex(@"^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ\s]+$");
            if (!string.IsNullOrWhiteSpace(clienteDto.Nombre) && !soloLetras.IsMatch(clienteDto.Nombre))
                return BadRequest(new { mensaje = "El nombre solo puede contener letras y espacios." });
            if (!string.IsNullOrWhiteSpace(clienteDto.ApellidoPaterno) && !soloLetras.IsMatch(clienteDto.ApellidoPaterno))
                return BadRequest(new { mensaje = "El apellido paterno solo puede contener letras y espacios." });
            if (!string.IsNullOrWhiteSpace(clienteDto.ApellidoMaterno) && !soloLetras.IsMatch(clienteDto.ApellidoMaterno))
                return BadRequest(new { mensaje = "El apellido materno solo puede contener letras y espacios." });

            if (!string.IsNullOrWhiteSpace(clienteDto.Telefono) && !clienteDto.Telefono.All(char.IsDigit))
                return BadRequest(new { mensaje = "El teléfono solo puede contener números." });

            var clienteExistente = await _context.Cliente
                .Include(c => c.AlergiaClientes)
                .FirstOrDefaultAsync(c => c.IdCliente == id);

            if (clienteExistente == null)
            {
                return NotFound(new { mensaje = "El cliente no fue encontrado." });
            }

            
            _context.Entry(clienteExistente).CurrentValues.SetValues(clienteDto);

            
            if (clienteDto.AlergiaClientes != null)
            {
                foreach (var alergiaExistente in clienteExistente.AlergiaClientes.ToList())
                {
                    if (!clienteDto.AlergiaClientes.Any(a => a.IdAlergia == alergiaExistente.IdAlergia))
                    {
                        _context.Set<AlergiaCliente>().Remove(alergiaExistente);
                    }
                }

                foreach (var nuevaAlergia in clienteDto.AlergiaClientes)
                {
                    var existe = clienteExistente.AlergiaClientes
                        .Any(a => a.IdAlergia == nuevaAlergia.IdAlergia);

                    if (!existe)
                    {
                        nuevaAlergia.IdCliente = id; // Asegurar la relación FK
                        clienteExistente.AlergiaClientes.Add(nuevaAlergia);
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClienteExists(id))
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

        // POST: api/Clientes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<IActionResult> PostCliente([FromBody] Cliente cliente)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var soloLetras = new Regex(@"^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ\s]+$");
            if (!string.IsNullOrWhiteSpace(cliente.Nombre) && !soloLetras.IsMatch(cliente.Nombre))
                return BadRequest(new { mensaje = "El nombre solo puede contener letras y espacios." });
            if (!string.IsNullOrWhiteSpace(cliente.ApellidoPaterno) && !soloLetras.IsMatch(cliente.ApellidoPaterno))
                return BadRequest(new { mensaje = "El apellido paterno solo puede contener letras y espacios." });
            if (!string.IsNullOrWhiteSpace(cliente.ApellidoMaterno) && !soloLetras.IsMatch(cliente.ApellidoMaterno))
                return BadRequest(new { mensaje = "El apellido materno solo puede contener letras y espacios." });

            if (!string.IsNullOrWhiteSpace(cliente.Telefono) && !cliente.Telefono.All(char.IsDigit))
                return BadRequest(new { mensaje = "El teléfono solo puede contener números." });

            if (cliente.AlergiaClientes != null && cliente.AlergiaClientes.Any())
            {
                foreach (var item in cliente.AlergiaClientes)
                {
                    item.Cliente = cliente; 
                }
            }

            _context.Cliente.Add(cliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCliente", new { id = cliente.IdCliente }, cliente);
        }

        [HttpGet("{idCliente}/historial")]
        public async Task<IActionResult> GetHistorialCliente(int idCliente)
        {
            var historial = await _context.Cita
                .Include(c => c.Usuario)
                .Include(c => c.DetalleCitas)
                    .ThenInclude(dc => dc.Servicio)
                .Where(c => c.IdCliente == idCliente)
                .OrderByDescending(c => c.Fecha)
                .ThenByDescending(c => c.Hora)
                .Select(c => new
                {
                    idCita = c.IdCita,
                    codigo = c.Codigo,
                    fecha = c.Fecha.ToString("yyyy-MM-dd"),
                    hora = c.Hora.ToString("HH:mm"),
                    estadoCita = c.EstadoCita,
                    usuarioAtendio = c.Usuario != null ? c.Usuario.NombreUsuario : "Sin asignar",
                    servicios = c.DetalleCitas.Select(dc => new {
                        idServicio = dc.IdServicio,
                        nombreServicio = dc.Servicio != null ? dc.Servicio.Nombre : "Servicio general"
                    }).ToList()
                })
                .ToListAsync();

            return Ok(historial);
        }


        // DELETE: api/Clientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var cliente = await _context.Cliente.FindAsync(id);
            if (cliente == null)
            {
                return NotFound(new { mensaje = "El cliente no existe o ya fue eliminado." });
            }

            cliente.Estado = "Inactivo";

            _context.Entry(cliente).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Cliente desactivado exitosamente." });
        }

        private bool ClienteExists(int id)
        {
            return _context.Cliente.Any(e => e.IdCliente == id);
        }
    }
}
