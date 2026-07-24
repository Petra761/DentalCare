# DEN-10: Cancelar Cita

## Descripcion
El sistema debe permitir cancelar una cita existente.

## Criterios de Aceptacion
1. Buscar la cita por telefono o CI del cliente
2. Validar que la cita exista y este activa
3. Cambiar el estado de la cita a "Cancelada"
4. Las citas canceladas deben ser visibles en el historial del paciente
5. Eliminar el evento asociado de Google Calendar
6. Notificar la confirmacion de cancelacion

## Nota
A diferencia de "Reagendado", las citas con estado "Cancelada" SI deben
aparecer en las consultas de historial para mantener trazabilidad.

## Autor
Dani-zm
