using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DentalCare.Clases
{
    public class Usuario
    {
        [Key]
        public int IdUsuario {  get; set; }
        public int IdRol {  get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string Contrasenia { get; set; } = string.Empty;
        public string Estado { get; set; } = "Activo";

        [ForeignKey("IdRol")]
        [JsonIgnore]
        public Rol? Rol { get; set; }
    }
}
