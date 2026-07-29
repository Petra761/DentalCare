using System.ComponentModel.DataAnnotations;

namespace DentalCare.Clases
{
    public class Alergia
    {
        [Key]
        public int IdAlergia { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Estado { get; set; } = "Activo";
    }
}
