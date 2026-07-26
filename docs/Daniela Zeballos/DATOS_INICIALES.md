# DATOS INICIALES - Seed para Base de Datos

Ejecutar en el orden indicado para poblar la base de datos con datos de prueba.

```sql
-- =============================================
-- 1. Roles
-- =============================================
INSERT INTO "Rol" ("Codigo", "Nombre", "Estado") VALUES
('ADM', 'Administrador', 'Activo'),
('REC', 'Recepcionista', 'Activo');

-- =============================================
-- 2. Usuario
-- =============================================
INSERT INTO "Usuario" ("IdRol", "Codigo", "NombreUsuario", "Contrasenia", "Estado") VALUES
(1, 'USR001', 'admin', 'admin123', 'Activo');

-- =============================================
-- 3. Categorias
-- =============================================
INSERT INTO "Categoria" ("Codigo", "Nombre", "Estado") VALUES
('CAT001', 'General', 'Activo'),
('CAT002', 'Ortodoncia', 'Activo'),
('CAT003', 'Cirugia', 'Activo');

-- =============================================
-- 4. Servicios
-- =============================================
INSERT INTO "Servicio" ("IdCategoria", "Codigo", "Nombre", "Descripcion", "Duracion", "EstadoServicio", "Estado") VALUES
(1, 'SRV001', 'Limpieza Profunda',        'Limpieza dental profunda',    '01:00:00', 'Disponible', 'Activo'),
(2, 'SRV002', 'Ortodoncia Control',        'Control de brackets',        '00:30:00', 'Disponible', 'Activo'),
(3, 'SRV003', 'Implante Fase 2',           'Fase 2 de implantes',        '01:30:00', 'Disponible', 'Activo'),
(3, 'SRV004', 'Extraccion Molar',          'Extraccion quirurgica',      '01:00:00', 'Disponible', 'Activo'),
(1, 'SRV005', 'Consulta General',          'Revision dental general',    '00:30:00', 'Disponible', 'Activo'),
(2, 'SRV006', 'Colocacion de Brackets',    'Colocacion completa',        '02:00:00', 'Disponible', 'Activo');

-- =============================================
-- 5. Clientes (varios casos)
-- =============================================
INSERT INTO "Cliente" ("Ci", "Nombre", "ApellidoPaterno", "ApellidoMaterno", "Telefono", "TipoSangre", "FechaNacimiento", "Estado") VALUES
-- Cliente con datos completos
(1234567, 'Ricardo',   'Mendoza', 'Salas',    '77777777', 'O+', '1990-05-10', 'Activo'),
-- Cliente con datos completos
(4567890, 'Lucia',     'Gonzalez', 'Paz',     '76666666', 'A+', '1995-08-15', 'Activo'),
-- Cliente con datos completos
(3221445, 'Carlos',    'Pereira', 'Luna',     '75555555', 'B+', '1988-11-20', 'Activo'),
-- Cliente con datos completos
(1726354, 'Gael',      'Rodriguez', 'Sanchez', '74444444', 'O+', '2000-01-01', 'Activo'),
-- Cliente SIN telefono (datos incompletos)
(9876543, 'Maria',     'Quispe', 'Vargas',    NULL,       'A-', '1992-03-22', 'Activo'),
-- Cliente SIN apellido paterno (datos incompletos)
(1112233, 'Pedro',     NULL,      'Rojas',    '71111111', 'O+', '1985-07-14', 'Activo'),
-- Cliente con telefono corto (invalido pero no nulo)
(9988776, 'Ana',       'Lopez',   'Cruz',     '70000000', 'B-', '1998-12-01', 'Activo');

-- =============================================
-- 6. Citas (variedad de estados y fechas)
-- =============================================
-- Nota: Ajusta las fechas segun corresponda.
-- CURRENT_DATE = hoy, CURRENT_DATE +/- N = dias relativos.
INSERT INTO "Cita" ("IdCliente", "IdUsuario", "Codigo", "MedioComunicacion", "Fecha", "Hora", "EstadoCita", "Estado") VALUES

-- Citas para HOY
(1, 1, 'CIT001', 'WhatsApp',  CURRENT_DATE, '09:00:00', 'Confirmada', 'Activo'),
(2, 1, 'CIT002', 'Telefono',  CURRENT_DATE, '10:30:00', 'Pendiente',  'Activo'),
(5, 1, 'CIT005', 'WhatsApp',  CURRENT_DATE, '11:00:00', 'Confirmada', 'Activo'),  -- cliente sin telefono (datos incompletos)

-- Citas para MAÑANA
(3, 1, 'CIT003', 'Recepcion', CURRENT_DATE + 1, '09:00:00', 'Confirmada', 'Activo'),
(4, 1, 'CIT004', 'WhatsApp',  CURRENT_DATE + 1, '11:00:00', 'Pendiente',  'Activo'),

-- Cita ya Completada (para historial)
(1, 1, 'CIT006', 'WhatsApp',  CURRENT_DATE - 3, '08:00:00', 'Completada', 'Activo'),

-- Cita Cancelada
(2, 1, 'CIT007', 'Telefono',  CURRENT_DATE - 2, '15:00:00', 'Cancelada',  'Activo'),

-- Cita Reagendada (existe en BD pero NO debe mostrarse en frontend activo ni historial)
(3, 1, 'CIT008', 'WhatsApp',  CURRENT_DATE - 1, '10:00:00', 'Reagendado', 'Activo'),

-- Cita Vencida (pasada, Confirmada, sin completar)
(4, 1, 'CIT009', 'WhatsApp',  CURRENT_DATE - 1, '07:30:00', 'Confirmada', 'Activo'),

-- Cita Vencida con datos incompletos
(6, 1, 'CIT010', 'Recepcion', CURRENT_DATE - 1, '08:00:00', 'Confirmada', 'Activo'),  -- cliente sin apellido paterno

-- Cita para el futuro (dentro de una semana)
(1, 1, 'CIT011', 'WhatsApp',  CURRENT_DATE + 7, '14:00:00', 'Pendiente',  'Activo'),
(7, 1, 'CIT012', 'Telefono',  CURRENT_DATE + 7, '16:00:00', 'Confirmada', 'Activo');

-- =============================================
-- 7. DetalleCita (servicios de cada cita)
-- =============================================
INSERT INTO "DetalleCita" ("IdCita", "IdServicio") VALUES
(1,  1),  -- Limpieza Profunda
(2,  2),  -- Ortodoncia Control
(3,  5),  -- Consulta General
(4,  4),  -- Extraccion Molar
(5,  1),  -- Limpieza Profunda
(6,  3),  -- Implante Fase 2
(7,  2),  -- Ortodoncia Control
(8,  4),  -- Extraccion Molar
(9,  5),  -- Consulta General
(10, 6),  -- Colocacion de Brackets
(11, 1),  -- Limpieza Profunda
(12, 2);  -- Ortodoncia Control
```

## Resumen de casos de prueba incluidos

| Caso | Cliente | Cita | Comportamiento esperado |
|------|---------|------|------------------------|
| Cliente completo, cita vencida | Ricardo Mendoza (1) | CIT009 | Badge Vencida + auto-completa a historial |
| Cliente sin telefono, cita vencida | Maria Quispe (5) | CIT005 | Badge Vencida + badge Datos incompletos + NO auto-completa |
| Cliente sin apellido, cita vencida | Pedro Rojas (6) | CIT010 | Badge Vencida + badge Datos incompletos + NO auto-completa |
| Cita reagendada | Carlos Pereira (3) | CIT008 | No visible en frontend (ni activa ni historial) |
| Cita completada | Ricardo Mendoza (1) | CIT006 | Visible solo en historial |
| Cita cancelada | Lucia Gonzalez (2) | CIT007 | Visible en activa con estado Cancelada |
