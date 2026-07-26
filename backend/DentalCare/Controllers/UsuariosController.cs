using DentalCare.Clases;
using DentalCare.Data;
using DentalCare.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DentalCare.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly DentalCareContext _context;
        private readonly IConfiguration _configuration;


        public UsuariosController(DentalCareContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuario()
        {
            var usuarios = await _context.Usuario
                .Include(u => u.Rol)
                .Where(u => u.Estado == "Activo")
                .Select(u => new UsuarioDto
                {
                    IdUsuario = u.IdUsuario,
                    IdRol = u.IdRol,
                    Codigo = u.Codigo,
                    NombreUsuario = u.NombreUsuario,
                    Contrasenia = u.Contrasenia,
                    Estado = u.Estado,
                    RolNombre = u.Rol != null ? u.Rol.Nombre : null
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(int id)
        {
            var usuario = await _context.Usuario
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdUsuario == id);

            if (usuario == null)
            {
                return NotFound();
            }

            return Ok(new UsuarioDto
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Codigo = usuario.Codigo,
                NombreUsuario = usuario.NombreUsuario,
                Contrasenia = usuario.Contrasenia,
                Estado = usuario.Estado,
                RolNombre = usuario.Rol?.Nombre
            });
        }

        // PUT: api/Usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, UsuarioDto dto)
        {
            var usuario = await _context.Usuario.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            if (await _context.Usuario.AnyAsync(u => u.NombreUsuario.ToLower() == dto.NombreUsuario.ToLower() && u.IdUsuario != id))
            {
                return BadRequest("El nombre de usuario ya está registrado por otro usuario.");
            }

            usuario.IdRol = dto.IdRol;
            usuario.Codigo = dto.Codigo;
            usuario.NombreUsuario = dto.NombreUsuario;
            usuario.Estado = dto.Estado;

            if (string.IsNullOrEmpty(dto.Contrasenia) || dto.Contrasenia.Length < 8)
            {
                return BadRequest("La contraseña es requerida y debe tener al menos 8 caracteres.");
            }
            if (usuario.Contrasenia != dto.Contrasenia)
            {
                usuario.Contrasenia = PasswordHasher.Hash(dto.Contrasenia);
            }

            _context.Entry(usuario).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UsuarioExists(id))
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

        // POST: api/Usuarios
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> PostUsuario(UsuarioDto dto)
        {
            if (await _context.Usuario.AnyAsync(u => u.NombreUsuario.ToLower() == dto.NombreUsuario.ToLower()))
            {
                return BadRequest("El nombre de usuario ya está registrado.");
            }

            if (string.IsNullOrEmpty(dto.Contrasenia) || dto.Contrasenia.Length < 8)
            {
                return BadRequest("La contraseña debe tener al menos 8 caracteres.");
            }

            var usuario = new Usuario
            {
                IdRol = dto.IdRol,
                Codigo = dto.Codigo,
                NombreUsuario = dto.NombreUsuario,
                Contrasenia = PasswordHasher.Hash(dto.Contrasenia),
                Estado = "Activo"
            };

            _context.Usuario.Add(usuario);
            await _context.SaveChangesAsync();

            await _context.Entry(usuario).Reference(u => u.Rol).LoadAsync();

            return CreatedAtAction("GetUsuario", new { id = usuario.IdUsuario }, new UsuarioDto
            {
                IdUsuario = usuario.IdUsuario,
                IdRol = usuario.IdRol,
                Codigo = usuario.Codigo,
                NombreUsuario = usuario.NombreUsuario,
                Contrasenia = usuario.Contrasenia,
                Estado = usuario.Estado,
                RolNombre = usuario.Rol?.Nombre
            });
        }

        // DELETE: api/Usuarios/5 (Logical delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuario.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            usuario.Estado = "Inactivo";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UsuarioExists(int id)
        {
            return _context.Usuario.Any(e => e.IdUsuario == id);
        }
         // LOGIN
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuario
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.NombreUsuario == request.NombreUsuario);

        if (usuario == null || !PasswordHasher.Verify(request.Contrasena, usuario.Contrasenia))
        {
            return Unauthorized(new
            {
                mensaje = "Usuario o contraseña incorrectos."
            });
        }

        if (usuario.Estado != "Activo")
        {
            return Unauthorized(new
            {
                mensaje = "El usuario está inactivo."
            });
        }

        // Generate JWT Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Name, usuario.NombreUsuario),
                new Claim(ClaimTypes.Role, usuario.Rol?.Nombre ?? "Paciente"),
                new Claim("Estado", usuario.Estado)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new
        {
            mensaje = "Inicio de sesión exitoso.",
            token = tokenString,
            usuario = new
            {
                usuario.IdUsuario,
                usuario.Codigo,
                usuario.NombreUsuario,
                usuario.IdRol,
                Rol = usuario.Rol?.Nombre ?? "Paciente",
                usuario.Estado
            }
        });
    }

    }
}

public class LoginRequest
{
    public string NombreUsuario { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
}

public class UsuarioDto
{
    public int IdUsuario { get; set; }
    public int IdRol { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    [JsonPropertyName("contrasena")]
    public string Contrasenia { get; set; } = string.Empty;
    public string Estado { get; set; } = "Activo";
    public string? RolNombre { get; set; }
}
