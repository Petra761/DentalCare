using System.ComponentModel.DataAnnotations;

namespace DentalCare.Clases
{
    public class Cliente
    {
        [Key]
        public int IdCliente { get; set; }
        public int Ci {  get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string ApellidoPaterno { get; set; } = string.Empty;
        public string ApellidoMaterno { get; set; } = string.Empty;
        public string TipoSangre { get; set; } = string.Empty;
        public DateOnly FechaNacimiento { get; set; } = new DateOnly();
        public string Estado { get; set; } = "Activo";
    }
}
