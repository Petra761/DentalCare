# DEN-9: Reagendar Cita

## Descripcion
El sistema debe permitir reagendar una cita existente a una nueva fecha
y/u hora.

## Criterios de Aceptacion
1. Buscar la cita original por telefono del cliente + fecha/hora actual
2. Validar que la cita original exista y este activa
3. Marcar la cita original como "Reagendado"
4. Crear una nueva cita con los datos actualizados
5. Aplicar las mismas validaciones que al agendar (horario, conflictos)
6. Sincronizar cambios con Google Calendar

## Nota
El estado "Reagendado" no debe mostrarse en la lista de citas activas
del panel de gestion. Las citas con este estado solo son visibles en
el historial del paciente.

## Autor
Dani-zm
