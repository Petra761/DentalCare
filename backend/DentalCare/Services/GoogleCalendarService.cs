using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using DentalCare.Clases;

namespace DentalCare.Services
{
    public class GoogleCalendarService
    {
        private readonly CalendarService _service;
        private readonly string _calendarId;

        public GoogleCalendarService(IConfiguration config)
        {
            var credentialsPath = config["GoogleCalendar:CredentialsPath"]
                ?? Path.Combine(AppContext.BaseDirectory, "google-credentials.json");
            _calendarId = config["GoogleCalendar:CalendarId"] ?? "primary";

            GoogleCredential credential;
            using (var stream = new FileStream(credentialsPath, FileMode.Open, FileAccess.Read))
            {
                credential = GoogleCredential.FromStream(stream)
                    .CreateScoped(CalendarService.Scope.Calendar);
            }

            _service = new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "DentalCare",
            });
        }

        public async Task<string> CreateEventAsync(Cita cita, string clienteNombre, string clienteTelefono, string servicioNombre, TimeOnly duracion)
        {
            var startDateTime = new DateTime(cita.Fecha.Year, cita.Fecha.Month, cita.Fecha.Day,
                cita.Hora.Hour, cita.Hora.Minute, 0, DateTimeKind.Local);
            var endDateTime = startDateTime.AddHours(duracion.Hour).AddMinutes(duracion.Minute);

            var eventData = new Event
            {
                Summary = $"{servicioNombre} - {clienteNombre}",
                Description = $"Código: {cita.Codigo}\n" +
                              $"Paciente: {clienteNombre}\n" +
                              $"Teléfono: {clienteTelefono}\n" +
                              $"Medio: {cita.MedioComunicacion}\n" +
                              $"Estado: {cita.EstadoCita}",
                Start = new EventDateTime
                {
                    DateTime = startDateTime,
                    TimeZone = "America/La_Paz",
                },
                End = new EventDateTime
                {
                    DateTime = endDateTime,
                    TimeZone = "America/La_Paz",
                },
            };

            var created = await _service.Events.Insert(eventData, _calendarId).ExecuteAsync();
            return created.Id;
        }

        public async Task UpdateEventAsync(string googleEventId, Cita cita, string clienteNombre, string servicioNombre, TimeOnly duracion)
        {
            var startDateTime = new DateTime(cita.Fecha.Year, cita.Fecha.Month, cita.Fecha.Day,
                cita.Hora.Hour, cita.Hora.Minute, 0, DateTimeKind.Local);
            var endDateTime = startDateTime.AddHours(duracion.Hour).AddMinutes(duracion.Minute);

            var eventData = new Event
            {
                Summary = $"{servicioNombre} - {clienteNombre}",
                Description = $"Código: {cita.Codigo}\n" +
                              $"Paciente: {clienteNombre}\n" +
                              $"Estado: {cita.EstadoCita}",
                Start = new EventDateTime
                {
                    DateTime = startDateTime,
                    TimeZone = "America/La_Paz",
                },
                End = new EventDateTime
                {
                    DateTime = endDateTime,
                    TimeZone = "America/La_Paz",
                },
            };

            await _service.Events.Update(eventData, _calendarId, googleEventId).ExecuteAsync();
        }

        public async Task DeleteEventAsync(string googleEventId)
        {
            try
            {
                await _service.Events.Delete(_calendarId, googleEventId).ExecuteAsync();
            }
            catch (Google.GoogleApiException ex) when (ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Event already gone — ignore
            }
        }

        public async Task CancelEventAsync(string googleEventId, string estadoCita)
        {
            try
            {
                var ev = await _service.Events.Get(_calendarId, googleEventId).ExecuteAsync();
                ev.Summary = $"[{estadoCita}] {ev.Summary}";
                ev.Status = estadoCita == "Cancelada" ? "cancelled" : "confirmed";
                ev.Description = (ev.Description ?? "") + $"\nEstado actualizado: {estadoCita}";
                await _service.Events.Update(ev, _calendarId, googleEventId).ExecuteAsync();
            }
            catch (Google.GoogleApiException ex) when (ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Event not found — ignore
            }
        }

        public async Task<List<Event>> GetAllEventsAsync()
        {
            var request = _service.Events.List(_calendarId);
            request.TimeMin = DateTime.Now.AddMonths(-1);
            request.TimeMax = DateTime.Now.AddMonths(3);
            request.ShowDeleted = false;
            request.SingleEvents = true;
            request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;

            var result = await request.ExecuteAsync();
            return result.Items?.ToList() ?? new List<Event>();
        }

        public string GetCalendarId() => _calendarId;
    }
}
