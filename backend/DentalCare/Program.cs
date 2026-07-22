using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using DentalCare.Data;
using DentalCare.Clases;
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
app.UseHttpsRedirection();

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
        var rol = context.Rol.First();
        var user = new Usuario
        {
            IdRol = rol.IdRol,
            Codigo = "USR001",
            NombreUsuario = "admin",
            Contrasenia = "admin123",
            Estado = "Activo"
        };
        context.Usuario.Add(user);
        context.SaveChanges();
    }

    if (!context.Categoria.Any())
    {
        var catGeneral = new Categoria { Codigo = "CAT001", Nombre = "General", Estado = "Activo" };
        var catOrtodoncia = new Categoria { Codigo = "CAT002", Nombre = "Ortodoncia", Estado = "Activo" };
        var catCirugia = new Categoria { Codigo = "CAT003", Nombre = "Cirugía", Estado = "Activo" };
        context.Categoria.AddRange(catGeneral, catOrtodoncia, catCirugia);
        context.SaveChanges();
    }

    if (!context.Servicio.Any())
    {
        var catGen = context.Categoria.First(c => c.Nombre == "General");
        var catOrto = context.Categoria.First(c => c.Nombre == "Ortodoncia");
        var catCir = context.Categoria.First(c => c.Nombre == "Cirugía");

        var s1 = new Servicio { IdCategoria = catGen.IdCategoria, Codigo = "SRV001", Nombre = "Limpieza Profunda", Descripcion = "Limpieza dental profunda", Duracion = new TimeOnly(1, 0), EstadoServicio = "Disponible", Estado = "Activo" };
        var s2 = new Servicio { IdCategoria = catOrto.IdCategoria, Codigo = "SRV002", Nombre = "Ortodoncia Control", Descripcion = "Control de brackets", Duracion = new TimeOnly(0, 30), EstadoServicio = "Disponible", Estado = "Activo" };
        var s3 = new Servicio { IdCategoria = catCir.IdCategoria, Codigo = "SRV003", Nombre = "Implante Fase 2", Descripcion = "Fase 2 de implantes", Duracion = new TimeOnly(1, 30), EstadoServicio = "Disponible", Estado = "Activo" };
        var s4 = new Servicio { IdCategoria = catCir.IdCategoria, Codigo = "SRV004", Nombre = "Extracción Molar", Descripcion = "Extracción quirúrgica", Duracion = new TimeOnly(1, 0), EstadoServicio = "Disponible", Estado = "Activo" };

        context.Servicio.AddRange(s1, s2, s3, s4);
        context.SaveChanges();
    }

    if (!context.Cliente.Any())
    {
        var c1 = new Cliente { Ci = 1234567, Nombre = "Ricardo", ApellidoPaterno = "Mendoza", ApellidoMaterno = "Salas", TipoSangre = "O+", Telefono = "77777777", FechaNacimiento = new DateOnly(1990, 5, 10), Estado = "Activo" };
        var c2 = new Cliente { Ci = 4567890, Nombre = "Lucía", ApellidoPaterno = "González", ApellidoMaterno = "Paz", TipoSangre = "A+", Telefono = "76666666", FechaNacimiento = new DateOnly(1995, 8, 15), Estado = "Activo" };
        var c3 = new Cliente { Ci = 3221445, Nombre = "Carlos", ApellidoPaterno = "Pereira", ApellidoMaterno = "Luna", TipoSangre = "B+", Telefono = "75555555", FechaNacimiento = new DateOnly(1988, 11, 20), Estado = "Activo" };
        var c4 = new Cliente { Ci = 1726354, Nombre = "Gael", ApellidoPaterno = "Rodriguez", ApellidoMaterno = "Sanchez", TipoSangre = "O+", Telefono = "74444444", FechaNacimiento = new DateOnly(2000, 1, 1), Estado = "Activo" };

        context.Cliente.AddRange(c1, c2, c3, c4);
        context.SaveChanges();
    }

    if (!context.Cita.Any())
    {
        var cli1 = context.Cliente.First(c => c.Nombre == "Ricardo");
        var cli2 = context.Cliente.First(c => c.Nombre == "Lucía");
        var cli3 = context.Cliente.First(c => c.Nombre == "Carlos");
        var cli4 = context.Cliente.First(c => c.Nombre == "Gael");
        var usr = context.Usuario.First();

        var cita1 = new Cita { IdCliente = cli1.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT001", MedioComunicacion = "WhatsApp", Fecha = new DateOnly(2023, 10, 15), Hora = new TimeOnly(9, 0), EstadoCita = "Confirmada", Estado = "Activo" };
        var cita2 = new Cita { IdCliente = cli2.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT002", MedioComunicacion = "Teléfono", Fecha = new DateOnly(2023, 10, 15), Hora = new TimeOnly(10, 30), EstadoCita = "Pendiente", Estado = "Activo" };
        var cita3 = new Cita { IdCliente = cli3.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT003", MedioComunicacion = "Recepción", Fecha = new DateOnly(2023, 10, 15), Hora = new TimeOnly(11, 45), EstadoCita = "Cancelada", Estado = "Activo" };
        var cita4 = new Cita { IdCliente = cli4.IdCliente, IdUsuario = usr.IdUsuario, Codigo = "CIT004", MedioComunicacion = "WhatsApp", Fecha = new DateOnly(2023, 10, 16), Hora = new TimeOnly(13, 30), EstadoCita = "Pendiente", Estado = "Activo" };

        context.Cita.AddRange(cita1, cita2, cita3, cita4);
        context.SaveChanges();

        var s1 = context.Servicio.First(s => s.Nombre == "Limpieza Profunda");
        var s2 = context.Servicio.First(s => s.Nombre == "Ortodoncia Control");
        var s3 = context.Servicio.First(s => s.Nombre == "Implante Fase 2");
        var s4 = context.Servicio.First(s => s.Nombre == "Extracción Molar");

        var det1 = new DetalleCita { IdCita = cita1.IdCita, IdServicio = s1.IdServicio };
        var det2 = new DetalleCita { IdCita = cita2.IdCita, IdServicio = s2.IdServicio };
        var det3 = new DetalleCita { IdCita = cita3.IdCita, IdServicio = s3.IdServicio };
        var det4 = new DetalleCita { IdCita = cita4.IdCita, IdServicio = s4.IdServicio };

        context.DetalleCita.AddRange(det1, det2, det3, det4);
        context.SaveChanges();
    }
}

