# DEN-21: Módulo Bot WhatsApp (Épica)

## 1. Refinamiento de Respuestas del Chatbot
**ID:** DEN-21 / DEN-41

**Descripción:** Como clínica, quiero que el chatbot tenga respuestas naturales, claras y amigables para brindar una buena experiencia de atención al usuario.

**Subtareas (0% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| DEN-70 | Ajustar el system prompt del Agente IA | Medium | DZ | Por hacer |
| DEN-71 | Manejar excepciones y respuestas de error | Medium | DZ | Por hacer |
| DEN-72 | Hacer pruebas en vivo simulando ser un paciente | Medium | DZ | Por hacer |
| DEN-110 | El bot debe pedir los datos necesarios uno a uno y sin confundir al paciente | Medium | DZ | Por hacer |
| DEN-111 | Debe saber cómo reaccionar si el usuario escribe algo fuera de contexto | Medium | DZ | Por hacer |
| DEN-113 | Debe entregar un mensaje claro de confirmación de cita | Medium | DZ | Por hacer |

---

## 2. Prevención de Solapamiento en Agendamiento
**ID:** DEN-21 / DEN-40

**Descripción:** Como paciente, quiero que el sistema valide la disponibilidad real antes de agendar para evitar que mi cita choque con la de otra persona.

**Subtareas (0% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| DEN-67 | Desarrollar lógica de consulta cruzada (leer BD + Calendar) | Medium | DZ | En revisión |
| DEN-68 | Implementar bloqueo/validación final justo antes del registro ("doble check") | Medium | DZ | En revisión |
| DEN-69 | Gestionar el guardado final en Google Calendar y en la BD simultáneamente | Medium | DZ | En revisión |

---

## 3. Conexión a la Base de Datos (BD)
**ID:** DEN-21 / DEN-39

**Descripción:** Como sistema de chatbot, quiero estar conectado a la base de datos para poder consultar información de pacientes y registrar citas.

**Subtareas (0% completado)**

| ID | Actividad | Prioridad | Persona | Estado |
|---|---|---|---|---|
| DEN-65 | Configurar nodo/módulo de conexión a la BD | Medium | AG | Por hacer |
| DEN-66 | Crear consultas SQL seguras para registrar información básica | Medium | AG | Por hacer |

## Autor
Dani-zm
