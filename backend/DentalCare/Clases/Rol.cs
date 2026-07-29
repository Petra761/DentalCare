using System.ComponentModel.DataAnnotations;

namespace DentalCare.Clases
{
    public class Rol
    {
        [Key]
        public int IdRol {  get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Estado { get; set; } = "Activo";

    }
}
