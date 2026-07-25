# 👥 Épica: Gestión de Usuarios del Sistema

## HU-USR-001 — Administrar usuarios del sistema

### Historia de usuario

> **Como** administrador,  
> **quiero** gestionar los usuarios del sistema (crear, editar, listar y eliminar lógicamente),  
> **para** controlar el acceso del personal a la clínica dental según sus roles y permisos.

---

# ✅ Criterios de aceptación

- [ ] La pantalla debe listar todos los usuarios activos en una tabla paginada.
- [ ] Cada usuario debe mostrar:
  - Código.
  - Nombre de usuario.
  - Rol, mediante un badge visual.
  - Estado, indicando Activo/Inactivo.
- [ ] Se debe poder buscar usuarios por:
  - Nombre.
  - Código.
  - Rol.
- [ ] Se debe poder filtrar usuarios por:
  - Rol.
  - Estado.
- [ ] Se debe poder crear un nuevo usuario con:
  - Código.
  - Nombre de usuario.
  - Contraseña de mínimo 8 caracteres.
  - Rol.
- [ ] Se debe poder editar un usuario existente.
- [ ] El cambio de contraseña durante la edición debe ser opcional.
- [ ] El botón **Eliminar** debe desactivar al usuario mediante eliminación lógica.
- [ ] No se debe eliminar físicamente el registro de la base de datos.
- [ ] Se debe mostrar un modal con formulario para crear o editar usuarios.
- [ ] Se debe poder exportar la lista de usuarios a formato JSON.
- [ ] Se deben mostrar estadísticas relacionadas con los usuarios:
  - Total de usuarios.
  - Roles definidos.
  - Otras estadísticas disponibles.

---

# 📋 Subtareas

## Backend

- [ ] Crear endpoint `GET /api/Usuarios` que retorne únicamente los usuarios activos.
- [ ] Crear endpoint `GET /api/Usuarios/{id}` para obtener un usuario específico.
- [ ] Crear endpoint `POST /api/Usuarios` para crear un usuario.
- [ ] Crear endpoint `PUT /api/Usuarios/{id}` para actualizar un usuario.
- [ ] Crear endpoint `DELETE /api/Usuarios/{id}` para realizar eliminación lógica.
- [ ] Al realizar DELETE, cambiar el estado del usuario a `Inactivo`.
- [ ] Crear endpoint `GET /api/Roles` para obtener todos los roles disponibles.
- [ ] Crear endpoint `GET /api/Roles/{id}` para obtener un rol específico.
- [ ] Implementar `UsuarioDto` para separar las respuestas de la entidad de base de datos.

## Frontend

- [ ] Implementar tabla con paginación de 4 usuarios por página.
- [ ] Implementar buscador por:
  - Nombre.
  - Código.
  - Rol.
- [ ] Implementar filtros por Rol y Estado.
- [ ] Implementar formulario de creación y edición dentro de un modal.
- [ ] Implementar selector dinámico de roles utilizando la API.
- [ ] Implementar exportación de usuarios a JSON.
- [ ] Implementar tarjetas de estadísticas.
- [ ] Implementar validaciones del formulario.
- [ ] Implementar estados de carga, error y resultados vacíos.
- [ ] Implementar confirmación antes de eliminar un usuario.

---

# 📊 Estimación

| Campo | Valor |
|---|---|
| Story Points | 5 |
| Tiempo estimado | 10 horas |
| Prioridad | Alta |
| Estado | Pendiente / En desarrollo |

---

# 📂 Control de Archivos

## Backend — ASP.NET Core 8

| Archivo | Líneas / Métodos Clave | Propósito |
|---|---|---|
| `Controllers/UsuariosController.cs` | `GetUsuario()`, `GetUsuario(id)`, `PostUsuario()`, `PutUsuario()`, `DeleteUsuario()`, `UsuarioDto` | CRUD completo de usuarios |
| `Controllers/RolesController.cs` | `GetRol()`, `GetRol(id)` | Obtener roles disponibles del sistema |
| `Clases/Usuario.cs` | `IdUsuario`, `IdRol`, `Codigo`, `NombreUsuario`, `Contrasenia`, `Estado`, `Rol` | Modelo de datos de usuario |
| `Clases/Rol.cs` | `IdRol`, `Codigo`, `Nombre`, `Estado` | Modelo de datos de rol |
| `Program.cs` | Seed de roles | Datos iniciales de roles, como Administrador y Recepcionista |
| `Data/DentalCareContext.cs` | `DbSet<Usuario>`, `DbSet<Rol>` | Contexto de acceso a la base de datos |

---

## Frontend — React 19 + TypeScript

| Archivo | Propósito |
|---|---|
| `src/pages/Usuarios.tsx` | Página principal. Orquesta carga, búsqueda, filtros, modal y paginación |
| `src/components/UserForm.tsx` | Formulario para crear y editar usuarios con validaciones |
| `src/components/UserTable.tsx` | Tabla paginada con avatar, código, nombre, rol, estado y acciones |
| `src/components/UserStats.tsx` | Tarjetas de resumen: total de usuarios, sesiones activas y roles definidos |
| `src/components/Modal.tsx` | Modal reutilizable con backdrop y animación |
| `src/services/api.ts` | Servicios `getRoles()`, `getUsuarios()`, `createUsuario()`, `updateUsuario()` y `deleteUsuario()` |

---

# 🛠️ Detalles de Implementación Técnica

## 🔄 Flujo de la pantalla de Usuarios

### 1. Carga inicial

Cuando se monta `Usuarios.tsx`:

```text
Usuarios.tsx
    │
    │ mount
    ▼
loadUsers()
    │
    ▼
apiService.getUsuarios()
    │
    │ GET /api/Usuarios
    ▼
Backend
    │
    │ Retorna usuarios activos
    ▼
setUsers(data)
    │
    ▼
setFilteredUsers(data)
    │
    ▼
Mostrar usuarios en la tabla
```

---

### 2. Búsqueda y filtros

Cuando el administrador escribe en el buscador o cambia un filtro:

```text
Usuario escribe una búsqueda
        │
        ▼
Aplicar filtro por:
        │
        ├── Nombre
        ├── Código
        ├── Rol
        ├── Estado
        │
        ▼
setFilteredUsers(result)
        │
        ▼
setCurrentPage(1)
        │
        ▼
Actualizar tabla
```

El filtrado se realiza localmente sobre los usuarios cargados.

---

### 3. Crear nuevo usuario

Cuando el administrador selecciona **Nuevo Usuario**:

```text
Clic en "Nuevo Usuario"
        │
        ▼
setShowForm(true)
        │
        ▼
setEditingUser(null)
        │
        ▼
Abrir Modal
        │
        ▼
UserForm
        │
        ▼
Modo creación
```

Después de completar el formulario:

```text
Guardar formulario
        │
        ▼
handleSaveUser()
        │
        ▼
POST /api/Usuarios
        │
        ▼
Crear usuario en BD
        │
        ▼
loadUsers()
        │
        ▼
Actualizar tabla
```

---

### 4. Editar usuario

Cuando el administrador selecciona **Editar**:

```text
Clic en "Editar"
        │
        ▼
setEditingUser(user)
        │
        ▼
setShowForm(true)
        │
        ▼
Abrir Modal
        │
        ▼
UserForm
        │
        ▼
Modo edición
        │
        ▼
Cargar datos existentes
```

Al guardar:

```text
Guardar formulario
        │
        ▼
handleSaveUser()
        │
        ▼
PUT /api/Usuarios/{id}
        │
        ▼
Actualizar usuario en BD
        │
        ▼
loadUsers()
        │
        ▼
Actualizar tabla
```

---

### 5. Eliminar usuario

La eliminación se realiza de manera lógica.

```text
Clic en "Eliminar"
        │
        ▼
handleDeleteUser()
        │
        ▼
Mostrar diálogo de confirmación
        │
        ├── Cancelar → No realizar cambios
        │
        └── Confirmar
                │
                ▼
        DELETE /api/Usuarios/{id}
                │
                ▼
        Backend cambia Estado
        de "Activo" a "Inactivo"
                │
                ▼
        loadUsers()
                │
                ▼
        Usuario desaparece
        de la lista de activos
```

> El registro no se elimina físicamente de la base de datos.

---

# 📦 Estructura del DTO — UsuarioDto

El sistema utiliza un DTO para separar los datos expuestos por la API de la entidad de base de datos.

Ejemplo:

```csharp
public class UsuarioDto
{
    public int IdUsuario { get; set; }
    public int IdRol { get; set; }
    public string Codigo { get; set; }
    public string NombreUsuario { get; set; }
    public string Contrasenia { get; set; }
    public string Estado { get; set; }
    public string? RolNombre { get; set; }
}
```

### Propósito del DTO

El `UsuarioDto` permite:

- Controlar qué información se devuelve al frontend.
- Separar la entidad de persistencia de la respuesta de la API.
- Evitar exponer directamente la entidad `Usuario`.
- Facilitar el mapeo de los datos.
- Preparar la aplicación para futuras modificaciones de la entidad.

> **Recomendación de seguridad:** La contraseña no debería devolverse en las respuestas de los endpoints de consulta (`GET`). En producción, se recomienda utilizar DTOs separados para lectura y escritura y almacenar únicamente contraseñas hasheadas.

---

# 📝 Validaciones del formulario — UserForm.tsx

## Nombre de usuario

- Es obligatorio.
- No puede estar vacío.

```text
Nombre de usuario
    │
    ├── Vacío → Mostrar error
    │
    └── Válido → Continuar
```

---

## Código

- Es obligatorio.
- Se genera automáticamente.
- Utiliza el prefijo `DC-`.
- Contiene 3 dígitos aleatorios.

Ejemplo:

```text
DC-123
DC-457
DC-891
```

---

## Rol

- Es obligatorio.
- El administrador debe seleccionar un rol.
- No se acepta el valor `0`.

```text
Seleccionar rol
    │
    ├── Valor 0 → Mostrar error
    │
    └── Rol válido → Continuar
```

---

## Contraseña

### Durante la creación

- Es obligatoria.
- Debe tener mínimo 8 caracteres.

```text
Contraseña < 8 caracteres
        │
        ▼
    Error de validación
```

### Durante la edición

La contraseña es opcional.

Si el administrador deja el campo vacío:

```text
Editar usuario
      │
      ▼
Contraseña vacía
      │
      ▼
Conservar contraseña existente
```

Si se introduce una nueva contraseña:

```text
Editar usuario
      │
      ▼
Nueva contraseña
      │
      ▼
Actualizar contraseña
```

---

# 👥 Mapeo de Roles

La versión anterior utilizaba un mapeo basado en valores fijos:

```typescript
idRol === 1 → "Administrador"
idRol === 2 → "Dentista"
else        → "Paciente"
```

Los badges utilizados son:

| Rol | Clase visual |
|---|---|
| Administrador | `bg-sky-50 text-sky-700` |
| Dentista | `bg-indigo-50 text-indigo-700` |
| Paciente | `bg-slate-50 text-slate-600` |

### Recomendación

Se recomienda evitar el hardcodeo de roles en el frontend.

En su lugar, los roles deben obtenerse dinámicamente desde:

```http
GET /api/Roles
```

De esta manera:

```text
Frontend
    │
    ▼
GET /api/Roles
    │
    ▼
Backend
    │
    ▼
Base de Datos
    │
    ▼
Lista de roles
    │
    ▼
Selector dinámico
```

Esto permite agregar nuevos roles desde el backend sin tener que modificar el código del frontend.

---

# 📄 Paginación

La tabla utiliza:

```typescript
itemsPerPage = 4
```

Por lo tanto, se muestran como máximo **4 usuarios por página**.

La navegación incluye:

- Botón **Anterior**.
- Números de página.
- Botón **Siguiente**.

Ejemplo:

```text
┌──────────────────────────────────────────┐
│ Usuario 1                                │
│ Usuario 2                                │
│ Usuario 3                                │
│ Usuario 4                                │
└──────────────────────────────────────────┘

[Anterior] [1] [2] [3] [Siguiente]
```

También se muestra un resumen:

```text
Mostrando X a Y de Z usuarios
```

Ejemplo:

```text
Mostrando 1 a 4 de 10 usuarios
```

---

# 🔍 Búsqueda y Filtrado

El sistema permite combinar diferentes criterios de búsqueda.

## Búsqueda por texto

Se puede buscar por:

- Nombre de usuario.
- Código.
- Nombre del rol.

Ejemplo:

```text
Buscar: admin
```

Resultado:

```text
admin
administrador2
admin-clinica
```

---

## Filtro por Rol

Ejemplo:

```text
Todos
Administrador
Dentista
Paciente
```

---

## Filtro por Estado

Ejemplo:

```text
Todos
Activo
Inactivo
```

---

# 📤 Exportación de Usuarios

El sistema permite exportar la lista actual de usuarios a formato JSON.

El botón:

```text
Exportar
```

debe descargar los datos filtrados actualmente.

### Nombre del archivo

```text
Reporte_Usuarios_YYYY-MM-DD.json
```

Ejemplo:

```text
Reporte_Usuarios_2026-07-25.json
```

El archivo contiene los usuarios que coinciden con los filtros y búsqueda aplicados.

Ejemplo:

```json
[
  {
    "idUsuario": 1,
    "codigo": "DC-001",
    "nombreUsuario": "admin",
    "rol": "Administrador",
    "estado": "Activo"
  },
  {
    "idUsuario": 2,
    "codigo": "DC-002",
    "nombreUsuario": "dr.garcia",
    "rol": "Dentista",
    "estado": "Activo"
  }
]
```

---

# 📊 Estadísticas de Usuarios

El componente:

```text
src/components/UserStats.tsx
```

muestra tarjetas de resumen.

Las estadísticas pueden incluir:

| Estadística | Descripción |
|---|---|
| Total de usuarios | Cantidad total de usuarios registrados |
| Sesiones activas | Cantidad de sesiones o usuarios activos según la lógica implementada |
| Roles definidos | Cantidad de roles disponibles en el sistema |

Ejemplo visual:

```text
┌─────────────────┐
│ Total Usuarios  │
│       25        │
└─────────────────┘

┌─────────────────┐
│ Sesiones Activas│
│       12        │
└─────────────────┘

┌─────────────────┐
│ Roles Definidos │
│        3        │
└─────────────────┘
```

---

# ⏳ Estados de la Interfaz

La pantalla debe manejar diferentes estados durante la interacción con el sistema.

## Estado de carga

Mientras se obtienen los usuarios:

```text
⟳ Cargando usuarios...
```

Se muestra:

- Spinner animado.
- Mensaje de carga.

---

## Estado de error

Si ocurre un error al obtener los usuarios:

```text
┌──────────────────────────────────┐
│ Error al cargar usuarios         │
│                                  │
│ No se pudo obtener la información│
│                                  │
│ [ Reintentar Carga ]             │
└──────────────────────────────────┘
```

Debe existir un botón:

```text
Reintentar Carga
```

---

## Estado sin resultados

Si la búsqueda o los filtros no encuentran usuarios:

```text
No se encontraron usuarios.
```

Este mensaje debe mostrarse dentro de la tabla o área de resultados.

---

# 🔗 Endpoints de la API

## Usuarios

### Obtener usuarios activos

```http
GET /api/Usuarios
```

Retorna los usuarios cuyo estado sea:

```text
Activo
```

---

### Obtener usuario por ID

```http
GET /api/Usuarios/{id}
```

Ejemplo:

```http
GET /api/Usuarios/1
```

---

### Crear usuario

```http
POST /api/Usuarios
```

Ejemplo de solicitud:

```json
{
  "idRol": 2,
  "codigo": "DC-003",
  "nombreUsuario": "dr.garcia",
  "contrasenia": "dentista123",
  "estado": "Activo"
}
```

---

### Actualizar usuario

```http
PUT /api/Usuarios/{id}
```

Ejemplo:

```http
PUT /api/Usuarios/2
```

---

### Eliminar usuario lógicamente

```http
DELETE /api/Usuarios/{id}
```

El backend no elimina el registro.

En su lugar:

```text
Estado = "Activo"
        │
        │ DELETE
        ▼
Estado = "Inactivo"
```

---

# 👥 Endpoints de Roles

### Obtener todos los roles

```http
GET /api/Roles
```

---

### Obtener rol por ID

```http
GET /api/Roles/{id}
```

Ejemplo:

```http
GET /api/Roles/1
```

---

# 🏗️ Arquitectura General

```text
┌──────────────────────────────────────────────┐
│                  FRONTEND                    │
│              React 19 + TypeScript          │
│                                              │
│  Usuarios.tsx                                │
│      │                                       │
│      ├── UserStats.tsx                       │
│      │                                       │
│      ├── UserTable.tsx                       │
│      │                                       │
│      ├── UserForm.tsx                        │
│      │                                       │
│      └── Modal.tsx                           │
│                  │                           │
│                  ▼                           │
│              services/api.ts                 │
└──────────────────┼───────────────────────────┘
                   │
                   │ HTTP / REST API
                   ▼
┌──────────────────────────────────────────────┐
│                  BACKEND                     │
│               ASP.NET Core 8                 │
│                                              │
│  UsuariosController.cs                       │
│      │                                       │
│      ├── GET                                  │
│      ├── POST                                 │
│      ├── PUT                                  │
│      └── DELETE                               │
│                                              │
│  RolesController.cs                          │
│      │                                       │
│      ├── GET                                  │
│      └── GET /{id}                            │
│                                              │
│              DentalCareContext                │
└──────────────────┼───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│                 PostgreSQL                   │
│                                              │
│  Usuario                                     │
│     │                                        │
│     └──────────────► Rol                     │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 🗃️ Eliminación Lógica

El sistema utiliza eliminación lógica para conservar el historial de los usuarios.

## Flujo

```text
Usuario activo
      │
      │ DELETE
      ▼
Usuario marcado como Inactivo
      │
      ▼
El registro permanece en BD
      │
      ▼
No aparece en GET /api/Usuarios
```

Esto permite:

- Conservar el historial.
- Evitar pérdida de información.
- Mantener referencias históricas.
- Reactivar usuarios posteriormente si el sistema lo permite.

---

# 🔐 Consideraciones de Seguridad

Para una implementación real se recomienda:

1. No guardar contraseñas en texto plano.
2. Utilizar hashing seguro de contraseñas.
3. No devolver `Contrasenia` en respuestas `GET`.
4. Validar los permisos del usuario en el backend.
5. Permitir las operaciones de gestión únicamente a administradores.
6. Validar los datos recibidos en el servidor.
7. Evitar confiar únicamente en las validaciones del frontend.
8. Registrar las operaciones administrativas importantes.

El flujo recomendado es:

```text
Administrador autenticado
        │
        ▼
JWT válido
        │
        ▼
¿Rol = Administrador?
      /       \
    NO         SÍ
    │           │
    ▼           ▼
  403        Permitir
Forbidden    operación
```

---

# 📌 Resumen de Componentes

| Componente | Responsabilidad |
|---|---|
| `Usuarios.tsx` | Gestionar el estado general de la página |
| `UserForm.tsx` | Crear y editar usuarios |
| `UserTable.tsx` | Mostrar usuarios y acciones |
| `UserStats.tsx` | Mostrar estadísticas |
| `Modal.tsx` | Mostrar formularios en ventanas modales |
| `api.ts` | Realizar las peticiones HTTP |
| `UsuariosController.cs` | Gestionar el CRUD de usuarios |
| `RolesController.cs` | Gestionar consultas de roles |
| `Usuario.cs` | Entidad de usuario |
| `Rol.cs` | Entidad de rol |
| `UsuarioDto` | Transferir datos de usuario |
| `DentalCareContext.cs` | Acceso a PostgreSQL |
| `Program.cs` | Configuración y datos iniciales |

---

# ✅ Resultado Esperado

Al finalizar la implementación, el sistema debe permitir al administrador:

1. Visualizar los usuarios activos.
2. Buscar usuarios por nombre, código o rol.
3. Filtrar usuarios por rol y estado.
4. Crear nuevos usuarios.
5. Editar usuarios existentes.
6. Cambiar opcionalmente la contraseña durante la edición.
7. Eliminar usuarios mediante eliminación lógica.
8. Consultar los roles disponibles desde la API.
9. Seleccionar roles dinámicamente.
10. Navegar entre páginas de usuarios.
11. Exportar los resultados actuales a JSON.
12. Visualizar estadísticas de usuarios y roles.
13. Gestionar estados de carga y errores.
14. Reintentar la carga cuando ocurre un error.
15. Mostrar mensajes cuando no existen resultados.
16. Mantener los registros eliminados lógicamente en la base de datos.
17. Proteger las operaciones de gestión mediante autorización basada en roles.
