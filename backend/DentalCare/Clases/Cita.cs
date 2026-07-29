using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DentalCare.Clases
{
    public class Cita
    {
        [Key]
        public int IdCita { get; set; }
        public int IdCliente { get; set; }
        public int IdUsuario { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string MedioComunicacion { get; set; } = string.Empty;
        public DateOnly Fecha { get; set; } = new DateOnly();
        public TimeOnly Hora { get; set; } = new TimeOnly();
        public string EstadoCita { get; set; } = "Pendiente";
        public string Estado { get; set; } = "Activo";
        public string? GoogleEventId { get; set; }

        [ForeignKey("IdCliente")]
        [JsonIgnore]
        public Cliente? Cliente { get; set; }

        [ForeignKey("IdUsuario")]
        [JsonIgnore]
        public Usuario? Usuario { get; set; }
        public ICollection<DetalleCita> DetalleCitas { get; set; } = new List<DetalleCita>();
    }
}
