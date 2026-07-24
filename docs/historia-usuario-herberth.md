# 🛡️ Épica: Gestión de Agenda

---

## HU-DEN-127 — Consultar y gestionar la agenda de citas

**Historia de usuario:**
Como administrador u odontólogo, quiero consultar la agenda de citas mediante un calendario y visualizar el detalle de las atenciones programadas, para organizar y controlar las actividades de cada jornada.

**Criterios de aceptación:**  
- Al ingresar a la Agenda se debe mostrar el mes actual.
- El calendario debe mostrar un indicador por cada paciente con cita programada.
- Se debe poder navegar entre meses anteriores y posteriores.
- Se debe poder seleccionar un día para visualizar sus citas.
- Las citas del día seleccionado deben mostrarse en orden cronológico.
- Cada cita debe mostrar como mínimo: **Nombre del paciente, Hora de la cita y Tratamiento solicitado.**
- Se debe poder filtrar las citas por **paciente** y por **tratamiento** (individual o combinado).
- Se debe poder limpiar los filtros aplicados.
- Si no existen citas que coincidan con los filtros, se debe mostrar un mensaje informativo.
- El día actual debe diferenciarse visualmente en el calendario.

**Subtareas:**
- [x] Crear la vista del calendario mensual dinámico.
- [x] Implementar navegación entre meses y botón "Hoy".
- [x] Mostrar indicadores de actividad en los días con citas.
- [x] Implementar selección de un día y resaltado visual.
- [x] Crear el panel lateral de detalle diario.
- [x] Ordenar las citas cronológicamente.
- [x] Implementar filtros lógicos (Paciente/Tratamiento).
- [x] Implementar estados vacíos (*Empty States*) para búsquedas sin resultados.

**Estimación:** 
- **Story Points:** 5  
- **Tiempo:** 8 horas (1 día)

---

## HU-DEN-128 — Imprimir y acceder al registro de citas

**Historia de usuario:**
Como administrador u odontólogo, quiero imprimir la agenda de un día y acceder al registro de una nueva cita desde el módulo de Agenda, para facilitar la organización de las atenciones y la programación de nuevas consultas.

**Criterios de aceptación:**
- Debe existir un botón para imprimir la agenda diaria del día seleccionado.
- Las citas impresas deben aparecer ordenadas cronológicamente.
- La información impresa debe incluir: **Nombre del paciente, Hora y Tratamiento.**
- **Optimización de impresión:** Los elementos innecesarios (menús, filtros, calendario) deben ocultarse en el papel.
- Si no existen citas para el día, informar antes de imprimir.
- Debe existir un botón flotante (FAB) para crear una nueva cita.
- Al seleccionar el botón, redirigir al formulario de registro de citas.

**Subtareas:**
- [x] Crear botón de impresión de agenda.
- [x] Preparar formato de impresión mediante CSS `@media print`.
- [x] Validar contenido del día seleccionado antes de imprimir.
- [x] Diseñar e implementar botón flotante (FAB) con color institucional.
- [x] Configurar navegación hacia `/gestion-citas`.

**Estimación:** 
- **Story Points:** 3  
- **Tiempo:** 6 horas

---

## 📊 Resumen de Estimación

| ID | Historia de Usuario | Story Points | Tiempo Estimado |
| :--- | :--- | :---: | :--- |
| **HU-DEN-127** | Consultar y gestionar la agenda de citas | 5 | 8 horas (1 día) |
| **HU-DEN-128** | Imprimir y acceder al registro de citas | 3 | 6 horas |
| **TOTAL** | | **8** | **14 horas** |

---

## 📂 Control de Archivos (Estructura del Proyecto)

Para la implementación de este módulo, se han creado y modificado los siguientes archivos:

### **1. Archivos Creados (Nuevos)**
*   `src/pages/AgendaPage.tsx`: Componente principal que orquesta el estado del calendario, filtros y comunicación con la API.
*   `src/components/agenda/AgendaHeader.tsx`: Control de navegación (Mes anterior/siguiente) y título dinámico.
*   `src/components/agenda/AgendaFilters.tsx`: Panel de búsqueda por nombre y selector de servicios/tratamientos.
*   `src/components/agenda/CalendarGrid.tsx`: Lógica de renderizado del calendario, cálculo de días y gestión de indicadores de citas.
*   `src/components/agenda/DailyTimeline.tsx`: Panel lateral que lista las citas del día seleccionado con funcionalidad de impresión.
*   `src/hooks/useCitas.ts`: Hook personalizado para manejar el fetch de citas, el filtrado lógico y el cruce de datos con la base de datos de pacientes y servicios.

---

## 🛠️ Detalles de Implementación Técnica

*   **Lógica de Calendario:** Implementada con la API nativa `Intl.DateTimeFormat` de JavaScript para manejar nombres de meses y días de forma internacionalizable.
*   **Gestión de Impresión:** Se utilizó una técnica de "clase CSS de impresión" que garantiza que el reporte diario salga en una hoja blanca limpia, sin colores de fondo pesados ni elementos de navegación.
*   **Filtros:** La búsqueda es insensible a mayúsculas/minúsculas y se actualiza en tiempo real (*debounce* no requerido por la baja carga de datos actual).
*   **UI/UX:** Se utilizó **Framer Motion** para animar la entrada del panel lateral de detalles, proporcionando una sensación de fluidez moderna.