# DEN-2: Gestión de Citas (Épica)

## 1. Listar citas con Filtros
**ID:** DEN-2 / DEN-8

**Descripción:** Como recepcionista, quiero ver la lista de citas con filtros por período (diario/mensual/todo), estado y búsqueda por paciente, para organizar el flujo de atención del día.

**Subtareas (100% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| ~~DEN-59~~ | Filtro "Hoy" que muestre solo citas del día actual | Medium | DZ | Listo |
| ~~DEN-60~~ | Filtro "Este Mes" que muestre citas del mes actual | Medium | DZ | Listo |
| ~~DEN-61~~ | Filtro "Todas" que muestre todas las citas activas | Medium | DZ | Listo |
| ~~DEN-62~~ | Filtros por estado: Pendiente, Confirmada, Cancelada | Medium | DZ | Listo |
| ~~DEN-63~~ | Búsqueda por nombre de cliente o CI | Medium | DZ | Listo |
| ~~DEN-64~~ | Badge de "Vencida" en citas pasadas no completadas | Medium | DZ | Listo |

---

## 2. Editar/Gestionar Cita
**ID:** DEN-2 / DEN-9

**Descripción:** Como recepcionista, quiero modificar los datos de una cita existente o cambiar su estado, para mantener la agenda actualizada ante cambios del paciente.

**Subtareas (100% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| ~~DEN-100~~ | Precarga de datos actuales de la cita | Medium | DZ | Listo |
| ~~DEN-101~~ | Modificación de paciente, tratamiento, fecha, hora | Medium | DZ | Listo |
| ~~DEN-102~~ | Validaciones idénticas a creación (conflictos, horario, etc.) | Medium | DZ | Listo |
| ~~DEN-103~~ | Cambio rápido de estado vía PATCH | Medium | DZ | Listo |
| ~~DEN-105~~ | Confirmación antes de guardar cambios | Medium | DZ | Listo |

---

## 3. Historial de Citas Completadas
**ID:** DEN-2 / DEN-10

**Descripción:** Como recepcionista, quiero consultar el historial de citas completadas, para revisar atenciones pasadas.

**Subtareas (100% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| ~~DEN-136~~ | Pestaña "Historial" separada de la activa | Medium | DZ | Listo |
| ~~DEN-137~~ | Muestra solo citas con estado "Completada" | Medium | DZ | Listo |
| ~~DEN-138~~ | Búsqueda por nombre o CI | Medium | DZ | Listo |
| ~~DEN-139~~ | Acción "Gestionar" disponible para corregir errores | Medium | DZ | Listo |
| ~~DEN-140~~ | Conteo de citas en el badge | Medium | DZ | Listo |

---

## 4. Crear Nueva Cita con Validaciones
**ID:** DEN-2 / DEN-11

**Descripción:** Como recepcionista, quiero agendar una nueva cita seleccionando paciente, tratamiento, fecha, hora y medio de comunicación, para registrar la atención del paciente sin conflictos de horario.

**Subtareas (100% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| ~~DEN-74~~ | Búsqueda de paciente por nombre o CI con autocomplete | Medium | DZ | Listo |
| ~~DEN-75~~ | Selección de tratamiento agrupado por categoría | Medium | DZ | Listo |
| ~~DEN-77~~ | Slots de hora dinámicos según duración del servicio (08:00-18:00) | Medium | DZ | Listo |
| ~~DEN-91~~ | Validación: fecha no anterior a hoy | Medium | DZ | Listo |
| ~~DEN-92~~ | Validación: hora en intervalos de 30 min | Medium | DZ | Listo |
| ~~DEN-93~~ | Validación: sin conflictos con citas existentes | Medium | DZ | Listo |
| ~~DEN-94~~ | Generación automática de código CIT-XXXXX | Medium | DZ | Listo |
| ~~DEN-95~~ | Selección de medio de comunicación (WhatsApp, Recepción, Teléfono) | Medium | DZ | Listo |
| ~~DEN-97~~ | Selección de estado inicial | Medium | DZ | Listo |

## Autor
Dani-zm