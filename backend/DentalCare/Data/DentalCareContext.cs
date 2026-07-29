using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DentalCare.Clases;

namespace DentalCare.Data
{
    public class DentalCareContext : DbContext
    {
        public DentalCareContext (DbContextOptions<DentalCareContext> options)
            : base(options)
        {
        }

        public DbSet<DentalCare.Clases.Alergia> Alergia { get; set; } = default!;
        public DbSet<DentalCare.Clases.Categoria> Categoria { get; set; } = default!;
        public DbSet<DentalCare.Clases.Rol> Rol { get; set; } = default!;
        public DbSet<DentalCare.Clases.Cliente> Cliente { get; set; } = default!;
        public DbSet<DentalCare.Clases.AlergiaCliente> AlergiaCliente { get; set; } = default!;
        public DbSet<DentalCare.Clases.Servicio> Servicio { get; set; } = default!;
        public DbSet<DentalCare.Clases.Usuario> Usuario { get; set; } = default!;
        public DbSet<DentalCare.Clases.Cita> Cita { get; set; } = default!;
        public DbSet<DentalCare.Clases.DetalleCita> DetalleCita { get; set; } = default!;
    }
}
