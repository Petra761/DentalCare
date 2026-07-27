using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using DentalCare.Data;
using DentalCare.Clases;
using DentalCare.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<DentalCareContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DentalCareContext") ?? throw new InvalidOperationException("Connection string 'DentalCareContext' not found.")));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt Key is missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt Issuer is missing");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt Audience is missing");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Configure CORS (Allow all origins for development, and include AllowFrontend policy)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<GoogleCalendarService>();

var app = builder.Build();

// Semillado de la base de datos
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DentalCareContext>();
    SeedDatabase(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

void SeedDatabase(DentalCareContext context)
{
    context.Database.EnsureCreated();

    if (!context.Rol.Any())
    {
        var rolAdmin = new Rol { Codigo = "ADM", Nombre = "Administrador", Estado = "Activo" };
        var rolRecep = new Rol { Codigo = "REC", Nombre = "Recepcionista", Estado = "Activo" };
        context.Rol.AddRange(rolAdmin, rolRecep);
        context.SaveChanges();
    }

    if (!context.Usuario.Any())
    {
        var rol = context.Rol.FirstOrDefault(r => r.Codigo == "ADM");
        if (rol != null)
        {
            var user = new Usuario
            {
                IdRol = rol.IdRol,
                Codigo = "USR001",
                NombreUsuario = "admin",
                Contrasenia = PasswordHasher.Hash("admin123"),
                Estado = "Activo"
            };
            context.Usuario.Add(user);
            context.SaveChanges();
        }
    }

    if (!context.Categoria.Any())
    {
        context.Categoria.AddRange(
            new Categoria { Codigo = "CAT001", Nombre = "General", Estado = "Activo" },
            new Categoria { Codigo = "CAT002", Nombre = "Ortodoncia", Estado = "Activo" },
            new Categoria { Codigo = "CAT003", Nombre = "Cirugía", Estado = "Activo" }
        );
        context.SaveChanges();
    }

    if (!context.Servicio.Any())
    {
        var catGen = context.Categoria.FirstOrDefault(c => c.Nombre == "General");
        var catOrto = context.Categoria.FirstOrDefault(c => c.Nombre == "Ortodoncia");
        var catCir = context.Categoria.FirstOrDefault(c => c.Nombre == "Cirugía");

        if (catGen != null && catOrto != null && catCir != null)
        {
            context.Servicio.AddRange(
                new Servicio { IdCategoria = catGen.IdCategoria, Codigo = "SRV001", Nombre = "Limpieza Profunda", Descripcion = "Limpieza dental profunda", Duracion = new TimeOnly(1, 0), EstadoServicio = "Disponible", Estado = "Activo" },
                new Servicio { IdCategoria = catOrto.IdCategoria, Codigo = "SRV002", Nombre = "Ortodoncia Control", Descripcion = "Control de brackets", Duracion = new TimeOnly(0, 30), EstadoServicio = "Disponible", Estado = "Activo" },
                new Servicio { IdCategoria = catCir.IdCategoria, Codigo = "SRV003", Nombre = "Implante Fase 2", Descripcion = "Fase 2 de implantes", Duracion = new TimeOnly(1, 30), EstadoServicio = "Disponible", Estado = "Activo" },
                new Servicio { IdCategoria = catCir.IdCategoria, Codigo = "SRV004", Nombre = "Extracción Molar", Descripcion = "Extracción quirúrgica", Duracion = new TimeOnly(1, 0), EstadoServicio = "Disponible", Estado = "Activo" }
            );
            context.SaveChanges();
        }
    }

    if (!context.Cliente.Any())
    {
        context.Cliente.AddRange(
            new Cliente { Ci = 1234567, Nombre = "Ricardo", ApellidoPaterno = "Mendoza", ApellidoMaterno = "Salas", TipoSangre = "O+", Telefono = "77777777", FechaNacimiento = new DateOnly(1990, 5, 10), Estado = "Activo" },
            new Cliente { Ci = 4567890, Nombre = "Lucía", ApellidoPaterno = "González", ApellidoMaterno = "Paz", TipoSangre = "A+", Telefono = "76666666", FechaNacimiento = new DateOnly(1995, 8, 15), Estado = "Activo" },
            new Cliente { Ci = 3221445, Nombre = "Carlos", ApellidoPaterno = "Pereira", ApellidoMaterno = "Luna", TipoSangre = "B+", Telefono = "75555555", FechaNacimiento = new DateOnly(1988, 11, 20), Estado = "Activo" },
            new Cliente { Ci = 1726354, Nombre = "Gael", ApellidoPaterno = "Rodriguez", ApellidoMaterno = "Sanchez", TipoSangre = "O+", Telefono = "74444444", FechaNacimiento = new DateOnly(2000, 1, 1), Estado = "Activo" }
        );
        context.SaveChanges();
    }

    if (!context.Cita.Any())
    {
        var cli1 = context.Cliente.FirstOrDefault(c => c.Nombre == "Ricardo");
        var cli2 = context.Cliente.FirstOrDefault(c => c.Nombre == "Lucía");
        var cli3 = context.Cliente.FirstOrDefault(c => c.Nombre == "Carlos");
        var cli4 = context.Cliente.FirstOrDefault(c => c.Nombre == "Gael");
        var usr = context.Usuario.FirstOrDefault();

        if (cli1 != null && cli2 != null && cli3 != null && cli4 != null && usr != null)
        {
            var hoy = DateOnly.FromDateTime(DateTime.Today);
            var manana = hoy.AddDays(1);

            var cita1 = new Cita { IdCliente = cli1.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT001", MedioComunicacion = "WhatsApp", Fecha = hoy, Hora = new TimeOnly(9, 0), EstadoCita = "Confirmada", Estado = "Activo" };
            var cita2 = new Cita { IdCliente = cli2.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT002", MedioComunicacion = "Teléfono", Fecha = hoy, Hora = new TimeOnly(10, 30), EstadoCita = "Pendiente", Estado = "Activo" };
            var cita3 = new Cita { IdCliente = cli3.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT003", MedioComunicacion = "Recepción", Fecha = manana, Hora = new TimeOnly(9, 0), EstadoCita = "Confirmada", Estado = "Activo" };
            var cita4 = new Cita { IdCliente = cli4.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT004", MedioComunicacion = "WhatsApp", Fecha = manana, Hora = new TimeOnly(11, 0), EstadoCita = "Pendiente", Estado = "Activo" };

            context.Cita.AddRange(cita1, cita2, cita3, cita4);
            context.SaveChanges();

            // Buscar servicios para los detalles
            var s1 = context.Servicio.FirstOrDefault(s => s.Nombre == "Limpieza Profunda");
            var s2 = context.Servicio.FirstOrDefault(s => s.Nombre == "Ortodoncia Control");
            var s3 = context.Servicio.FirstOrDefault(s => s.Nombre == "Implante Fase 2");
            var s4 = context.Servicio.FirstOrDefault(s => s.Nombre == "Extracción Molar");

            if (s1 != null && s2 != null && s3 != null && s4 != null)
            {
                context.DetalleCita.AddRange(
                    new DetalleCita { IdCita = cita1.IdCita, IdServicio = s1.IdServicio },
                    new DetalleCita { IdCita = cita2.IdCita, IdServicio = s2.IdServicio },
                    new DetalleCita { IdCita = cita3.IdCita, IdServicio = s3.IdServicio },
                    new DetalleCita { IdCita = cita4.IdCita, IdServicio = s4.IdServicio }
                );
                context.SaveChanges();
            }
        }
    }
}