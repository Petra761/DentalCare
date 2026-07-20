using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DentalCare.Clases
{
    public class AlergiaCliente
    {
        [Key]
        public int IdAlergiaCliente {  get; set; }
        public int IdAlergia {  get; set; }
        public int IdCliente { get; set; }

        [ForeignKey("IdAlergia")]
        [JsonIgnore]
        public Alergia? Alergia { get; set; }

        [ForeignKey("IdCliente")]
        [JsonIgnore]
        public Cliente? Cliente { get; set; }

    }
}
