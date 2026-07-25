# 🦷 DentalCare - Gestión de Clientes

> **Proyecto:** DentalCare  
> **Módulo:** Gestión de Clientes  
> **Desarrolladora:** Carla Adriana Condori Veizaga

---

# 📋 Índice

- Información General
- Historia de Usuario HU-DEN-129
- Historia de Usuario HU-DEN-130
- Tarea DCJ-47
- Resumen de Estimación
- Estructura del Proyecto
- Implementación Técnica
- Endpoints
- Funcionalidades Frontend

---

# 📌 Información General

Este módulo permite la administración completa de clientes del sistema **DentalCare**, incluyendo:

- Registrar clientes.
- Buscar clientes.
- Editar clientes.
- Eliminar clientes.
- Cambiar el estado Activo/Inactivo.
- Visualizar la ficha completa del cliente.
- Mostrar las alergias registradas.

---

# 🛡️ HU-DEN-129 — Gestionar Clientes (CRUD Completo)

## Historia de Usuario

**Como** Recepcionista / Administrador del sistema DentalCare,

**Quiero** contar con un módulo completo para crear, consultar, modificar, eliminar y listar clientes,

**Para** mantener actualizada la información de los pacientes y garantizar un flujo eficiente durante la atención odontológica.

---

## ✅ Criterios de aceptación

- Crear un cliente registrando todos sus datos personales.
- Modificar un cliente precargando la información existente.
- Eliminar un cliente mediante un modal de confirmación.
- Buscar clientes por:
  - CI
  - Nombre
  - Teléfono
- Listar clientes con iconos de acceso rápido.
- Actualizar inmediatamente el estado Activo/Inactivo.
- Visualizar la ficha del cliente con sus alergias.

---

## 📌 Subtareas

| Estado | Código  | Descripción                                     |
| ------ | ------- | ----------------------------------------------- |
| ✅     | BCJ-75  | Crear Cliente registrando datos personales      |
| ✅     | BCJ-76  | Modificar Cliente precargando los datos         |
| ✅     | BCJ-77  | Eliminar Cliente mediante modal de confirmación |
| ✅     | BCJ-78  | Buscar Cliente por CI, Nombre o Teléfono        |
| ✅     | BCJ-79  | Listar Clientes con iconos de acceso rápido     |
| ✅     | BCJ-80  | Mostrar cambio de estado Activo/Inactivo        |
| ✅     | BCJ-140 | Ver ficha del cliente con sus alergias          |

---

## ⏱️ Estimación

| Story Points | Tiempo     |
| ------------ | ---------- |
| **8**        | **2 días** |

---

# 📄 HU-DEN-130 — Visualización de Ficha Cliente y Alergias

## Historia de Usuario

**Como** Recepcionista u Odontólogo,

**Quiero** acceder a la ficha detallada del paciente,

**Para** visualizar su información personal y las alergias registradas durante la atención.

---

## ✅ Criterios de aceptación

- Mostrar:
  - Nombres
  - Apellidos
  - CI
  - Teléfono
  - Correo electrónico
  - Estado
- Mostrar listado de alergias.
- Mostrar mensaje cuando no existan alergias registradas.
- Permitir editar la información del cliente.
- Navegar nuevamente al listado de clientes.
- Adaptarse a dispositivos móviles.

---

## 📌 Subtareas

| Estado | Descripción                                   |
| ------ | --------------------------------------------- |
| ✅     | Crear HeaderPaciente.tsx                      |
| ✅     | Implementar visualización de alergias         |
| ✅     | Crear estado vacío para clientes sin alergias |
| ✅     | Navegación entre ficha y listado              |
| ✅     | Diseño responsive                             |

---

## ⏱️ Estimación

| Story Points | Tiempo      |
| ------------ | ----------- |
| **3**        | **6 horas** |

---

# 🗄️ DCJ-47 — Crear la Base de Datos y la Conexión

## Descripción

Crear la base de datos del proyecto DentalCare y configurar la conexión entre la aplicación y SQL Server mediante Entity Framework Core.

---

## ⏱️ Estimación

| Tiempo      |
| ----------- |
| **5 horas** |

---

# 📊 Resumen de Estimación

| Actividad                                 | Tiempo  |
| ----------------------------------------- | ------- |
| HU-DEN-129 - Gestionar Clientes           | 2 días  |
| HU-DEN-130 - Ficha del Cliente y Alergias | 6 horas |
| DCJ-47 - Crear Base de Datos y Conexión   | 5 horas |

---

# 📂 Estructura del Proyecto

## Backend

```text
Models/
│
├── Cliente.cs
├── Alergia.cs
├── AlergiaCliente.cs
├── Cita.cs
├── DetalleCita.cs
├── Categoria.cs
├── Servicio.cs
├── Usuario.cs
└── Rol.cs

Controllers/
│
├── ClientesController.cs
├── AlergiasController.cs
├── AlergiasClienteController.cs
├── CitasController.cs
├── CategoriasController.cs
├── ServiciosController.cs
├── UsuariosController.cs
├── RolesController.cs
└── ReportesController.cs

Data/
│
└── DentalCareContext.cs

Migrations/

appsettings.json
```

---

## Frontend

```text
components/
└── FichaCliente/
    ├── BuscarPaciente.tsx
    ├── EditarPacienteModal.tsx
    ├── HeaderPaciente.tsx
    ├── ListaCliente.tsx
    ├── RegistrarPacienteForm.tsx
    └── VerHistorialPaciente.tsx

pages/
└── FichaCliente/
    └── PacientesPagina.tsx

services/
└── FichaCliente/
    └── pacienteServices.ts
```

---

# ⚙️ Implementación Técnica

## Backend

### Tecnologías utilizadas

- ASP.NET Core
- Entity Framework Core
- SQL Server
- Code First

---

### Arquitectura

- Arquitectura por capas.
- Entity Framework Core para el acceso a datos.
- Validaciones de negocio implementadas en los controladores.

---

### Relación de entidades

```text
Cliente
   │
   ▼
AlergiaCliente
   ▲
   │
Alergia
```

---

### Validaciones implementadas

- CI único.
- Campos obligatorios.
- Integridad de datos.
- Relación Cliente ↔ Alergia.

---

# 🌐 Endpoints REST

| Método | Endpoint                      | Descripción                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/clientes`               | Obtener todos los clientes   |
| GET    | `/api/clientes/{id}`          | Obtener cliente con alergias |
| GET    | `/api/clientes/buscar?query=` | Buscar cliente               |
| POST   | `/api/clientes`               | Registrar cliente            |
| PUT    | `/api/clientes/{id}`          | Actualizar cliente           |
| DELETE | `/api/clientes/{id}`          | Eliminar cliente             |

---

# 💻 Funcionalidades Frontend

## Gestión de Estado

- React Context API.
- React Query.

---

## Formularios

- Formularios controlados.
- Validaciones de datos.
- Precarga de información para edición.

---

## Modal

- Confirmación antes de eliminar un cliente.

---

## Actualización de datos

- Optimistic Update para actualizar la lista sin recargar la página.

---

## Búsqueda

Permite buscar clientes por:

- CI
- Nombre
- Teléfono

---

## Interfaz

- Diseño responsive.
- Iconos de acciones rápidas.
- Diseño institucional de DentalCare.

---

# 👩‍💻 Desarrolladora

**Carla Adriana Condori Veizaga**
