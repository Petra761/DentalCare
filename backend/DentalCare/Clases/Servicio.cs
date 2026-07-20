using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DentalCare.Clases
{
    public class Servicio
    {
        [Key]
        public int IdServicio { get; set; }
        public int IdCategoria { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; }= string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public TimeOnly Duracion { get; set; } = new TimeOnly();
        public string EstadoServicio { get; set; } = "Disponible";
        public string Estado { get; set; } = "Activo";

        [ForeignKey("IdCategoria")]
        [JsonIgnore]
        public Categoria? Categoria { get; set; }
    }
}
