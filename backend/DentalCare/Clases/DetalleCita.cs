using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DentalCare.Clases
{
    public class DetalleCita
    {
        [Key]
        public int IdDetalleCita { get; set; }
        public int IdCita { get; set; }
        public int IdServicio { get; set; }

        [ForeignKey("IdCita")]
        [JsonIgnore]
        public Cita? Cita { get; set; }

        [ForeignKey("IdServicio")]
        [JsonIgnore]

        public Servicio? Servicio { get; set; }
    }
}
