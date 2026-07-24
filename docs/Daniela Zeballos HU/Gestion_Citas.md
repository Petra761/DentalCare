# Gestion de Citas - Documentacion del Modulo

## Vision General
El modulo de Gestion de Citas permite a recepcionistas y administradores
gestionar las citas odontologicas desde el panel web de DentalCare.
Incluye creacion, edicion, cambio de estado, cancelacion y consulta
de disponibilidad.

## Funcionalidades Principales
1. **Agendar cita** - Crear nueva cita con cliente, servicio, fecha y hora
2. **Editar cita** - Modificar datos de una cita existente
3. **Cambiar estado** - Pendiente, Confirmada, Cancelada, Completada, Reagendado
4. **Cancelar cita** - Soft delete (marca como Inactivo)
5. **Disponibilidad** - Consultar slots libres por fecha
6. **Historial** - Ver citas pasadas y canceladas

## Componentes Implementados
- `CitasController.cs` - CRUD completo + validaciones + deteccion de conflictos
- `frontend/` - Interfaz de gestion de citas en React/TypeScript
- `api.ts` - Servicios de conexion con el backend

## Reglas de Negocio
- La clinica atiende de 08:00 a 18:00, lun a vie
- Los slots son cada 30 minutos
- No se permiten citas en fecha pasada
- No se permiten solapamientos de horario (mismo paciente u odontologo)
- Los cambios de estado se sincronizan con Google Calendar

## Endpoints
| Metodo | Ruta | Proposito |
|--------|------|-----------|
| GET | /api/Citas | Listar citas activas |
| GET | /api/Citas/detalladas | Citas con datos de cliente, servicio, usuario |
| GET | /api/Citas/{id} | Obtener cita por ID |
| POST | /api/Citas/nueva | Crear nueva cita |
| PUT | /api/Citas/{id} | Editar cita completa |
| PATCH | /api/Citas/{id}/estado | Cambiar solo estado |
| DELETE | /api/Citas/{id} | Soft delete (Inactivo) |
| GET/POST | /api/Citas/disponibilidad | Consultar horarios libres |

## Autor
Dani-zm
