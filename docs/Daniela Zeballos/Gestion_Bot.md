# MODULO_BOT - Documentacion Tecnica

## 1. Vision General del Modulo Bot

El Modulo Bot permite a los pacientes agendar, reagendar y cancelar citas
odontologicas a traves de WhatsApp utilizando n8n + OpenRouter AI.
El flujo completo es:

```
WhatsApp -> n8n (AI Agent + OpenRouter) -> API Backend -> PostgreSQL + Google Calendar
```

Cuando un paciente escribe por WhatsApp, n8n interpreta el mensaje con IA,
determina la intencion (agendar/reagendar/cancelar/consultar) y llama a los
endpoints del backend para ejecutar la accion. Cada cita creada/actualizada
se sincroniza automaticamente con Google Calendar.

## 2. Analisis Git

### Rama: feature/gestion_bot (creada desde feature/gestion_citas)
- Commit 1: `feat: agregar GoogleCalendarService y migracion GoogleEventId`
  - GoogleCalendarService.cs, Cita.cs, migrations, config
- Commit 2: `feat: agregar endpoints bot y catalogo servicios`
  - CitasController.cs, ServiciosController.cs, api.ts
- Commit 3: `chore: agregar .gitignore para credenciales Google`
  - .gitignore

### Autor
Todos los commits realizados por Dani-zm.

### Historial relevante
feature/gestion_bot contiene 22 commits en total (3 de modulo bot +
19 previos de feature/gestion_citas base). Los commits de modulo bot
son los unicos agregados por Dani-zm en esta rama.

## 3. API Backend - Endpoints del Bot

### Nuevos endpoints agregados

| Metodo | Ruta | Proposito |
|--------|------|-----------|
| POST | /api/Citas/agendar-desde-n8n | Crear cita desde n8n (soporta IDs o busqueda por nombre/telefono/CI) |
| POST | /api/Citas/cancelar-desde-n8n | Cancelar cita desde n8n buscando por telefono o CI |
| POST | /api/Citas/reagendar | Reagendar cita (busca por telefono + fecha/hora actual -> nueva fecha/hora) |
| GET/POST | /api/Citas/disponibilidad | Obtener slots libres (considera Google Calendar + BD) |
| GET | /api/Citas/test-calendar | Verificar conexion con Google Calendar |
| POST | /api/Citas/sincronizar | Sincronizar citas sin GoogleEventId a Google Calendar |
| GET | /api/Servicios/catalogo | Listar servicios disponibles para el AI Agent |

### Endpoints modificados (con sincronizacion Calendar)

| Metodo | Ruta | Cambio |
|--------|------|--------|
| PUT | /api/Citas/{id} | Al actualizar cita, sincroniza con Google Calendar |
| PATCH | /api/Citas/{id}/estado | Al cambiar estado, actualiza evento en Calendar |
| DELETE | /api/Citas/{id} | Al eliminar (soft delete), elimina evento de Calendar |

## 4. Google Calendar - GoogleCalendarService

### Archivo: `backend/DentalCare/Services/GoogleCalendarService.cs`

Servicio singleton que gestiona eventos de Google Calendar usando
una cuenta de servicio (google-credentials.json).

**Metodos:**
- `CreateEventAsync` - Crea evento en Calendar con datos de la cita
- `UpdateEventAsync` - Actualiza evento existente (fecha, hora, servicio)
- `DeleteEventAsync` - Elimina evento del calendario
- `CancelEventAsync` - Marca evento como cancelado (actualiza status)
- `GetAllEventsAsync` - Obtiene eventos de los ultimos/m proximos meses
- `GetCalendarId` - Devuelve el ID del calendario configurado

### Configuracion en appsettings.json:
```json
"GoogleCalendar": {
  "CredentialsPath": "google-credentials.json",
  "CalendarId": "b1a7453f8813111595b027b1eae844b17d095a8806ffb83ed5d928d13e9713df@group.calendar.google.com"
}
```

### ¿Por que se agrego GoogleEventId a la base de datos?
Google Calendar asigna un ID unico a cada evento creado (ej: `abc123def456`).
Si no guardamos ese ID en la BD, no podriamos:
- ACTUALIZAR un evento cuando se modifica la cita (fecha, hora, servicio)
- CANCELAR/ELIMINAR el evento cuando se cancela la cita
- VERIFICAR que citas ya estan sincronizadas vs cuales faltan
- EVITAR duplicados (crear el mismo evento cada vez que se consulta)

Sin GoogleEventId, cada sincronizacion crearia eventos duplicados en el
calendario sin forma de limpiarlos. Por eso se agrego la columna.

## 5. Base de Datos

### Migracion: AddGoogleEventId
- Archivo: `20260723050837_AddGoogleEventId.cs`
- Cambio: Agrega columna `GoogleEventId` (text, nullable) a tabla `Cita`
- Snapshot actualizado: `DentalCareContextModelSnapshot.cs`

### Modelo Cita actualizado
```csharp
public class Cita
{
    // ... campos existentes ...
    public string? GoogleEventId { get; set; }
}
```

## 6. Flujo n8n (Workflow)

El workflow n8n NO esta versionado en el repositorio.
Existe unicamente en la instancia n8n del usuario.

**Estructura del flujo:**
1. Trigger: Webhook de WhatsApp (recibe mensaje del paciente)
2. AI Agent: OpenRouter (interpreta lenguaje natural)
3. Clasificador: Determina intencion (agendar/reagendar/cancelar/consulta)
4. HTTP Request: Llama a los endpoints del backend segun la accion
5. Respuesta: Envia confirmacion al paciente por WhatsApp

**Endpoints consumidos por n8n:**
- GET /api/Servicios/catalogo (lista servicios disponibles)
- POST /api/Citas/disponibilidad (consulta horarios libres)
- POST /api/Citas/agendar-desde-n8n (crea cita)
- POST /api/Citas/reagendar (reagenda cita)
- POST /api/Citas/cancelar-desde-n8n (cancela cita)

## 7. Frontend - api.ts

### Metodos agregados/actualizados
- `getServicios()` - Obtiene lista de servicios (usa catalogo)
- `getDbCitas()` - Obtiene citas desde BD real (no mock)
- `getDetallesCita()` - Obtiene detalles de citas
- `crearNuevaCita(dto)` - Crea cita via POST /api/Citas/nueva
- `actualizarEstadoCita(id, estado)` - Cambia estado via PATCH

## 8. Configuracion

### Program.cs
- `builder.Services.AddSingleton<GoogleCalendarService>()`
- CORS: AllowAll + AllowFrontend (http://localhost:5173)

### DentalCare.csproj
```xml
<PackageReference Include="Google.Apis.Calendar.v3" Version="1.75.0.4206" />
```

## 9. Riesgos y Observaciones

1. **Credenciales en el proyecto**: google-credentials.json NO debe
   subirse al repositorio. Esta en .gitignore pero debe compartirse
   de forma segura con el equipo.
2. **CORS AllowAll**: En produccion debe restringirse a origenes
   conocidos.
3. **IdUsuario hardcodeado**: En reagendar y agendar-desde-n8n se usa
   `IdUsuario = 1` como fallback. Debe obtenerse del contexto real.
4. **n8n no versionado**: El workflow de n8n deberia exportarse como
   JSON y guardarse en el repo para tener trazabilidad completa.
5. **Manejo de errores Calendar**: Los errores de Google Calendar se
   capturan pero no se propagan al cliente (solo log). Podrian
   ocultar problemas de sincronizacion.

## 10. Recomendaciones

1. **Seguridad**: Mover google-credentials.json a variables de entorno
   o Azure Key Vault / AWS Secrets Manager en produccion.
2. **Testing**: Agregar pruebas unitarias para los endpoints del bot
   y el servicio de Google Calendar.
3. **Versionar n8n**: Exportar el workflow como JSON y agregarlo a
   `/docs/n8n-workflow.json` en el repo.
4. **Mejorar busqueda cliente**: Agregar endpoint de busqueda de
   clientes por CI/telefono para que el AI Agent pueda confirmar
   datos antes de agendar.
5. **Webhook seguro**: Validar que las llamadas de n8n al backend
   incluyan un token de autenticacion (API Key) para evitar usos
   no autorizados.
