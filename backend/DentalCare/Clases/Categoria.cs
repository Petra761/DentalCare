using System.ComponentModel.DataAnnotations;

namespace DentalCare.Clases
{
    public class Categoria
    {
        [Key]
        public int IdCategoria { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Estado { get; set; } = "Activo";
    }
}
