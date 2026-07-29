# 🔐 Épica: Login

## HU-AUTH-001 — Inicio de sesión de usuarios

### Historia de usuario

**Como** usuario registrado,  
**quiero** iniciar sesión con mis credenciales,  
**para** acceder de forma segura al sistema según los permisos de mi cuenta.
---

## Criterios de aceptación

- [ ] El formulario de login debe solicitar **Nombre de Usuario** y **Contraseña**.
- [ ] Debe existir un botón para **mostrar/ocultar la contraseña**.
- [ ] Si las credenciales son incorrectas, mostrar el mensaje: `"Usuario o contraseña incorrectos."`
- [ ] Si el usuario está inactivo, mostrar el mensaje: `"El usuario está inactivo."`
- [ ] Al iniciar sesión correctamente:
  - Si es **Administrador**, redirigir al **Dashboard**.
  - Si es **Dentista**, redirigir a **Gestión de Citas**.
  - Si es **Paciente**, redirigir a **Gestión de Citas**.
- [ ] La sesión debe persistir al recargar la página mediante `localStorage`.
- [ ] Debe existir un botón de **Cerrar Sesión** que limpie la sesión y redirija al login.
- [ ] Si el backend está offline, debe activarse el **Modo Demo** con usuarios predefinidos.

---

# 📋 Subtareas

## Backend

- [ ] Crear endpoint `POST /api/Usuarios/login` con generación de JWT.
- [ ] Implementar validación de credenciales contra la base de datos.
- [ ] Validar `NombreUsuario` y `Contrasenia`.
- [ ] Implementar validación del estado del usuario: `Activo` / `Inactivo`.
- [ ] Generar token JWT con los siguientes claims:
  - `NameIdentifier`
  - `Name`
  - `Role`
  - `Estado`

## Frontend

- [ ] Crear formulario de login con validaciones.
- [ ] Implementar `AuthContext` para el manejo global de la sesión.
- [ ] Persistir la sesión en `localStorage`:
  - `dental_session`
  - `dental_token`
- [ ] Implementar detección de backend offline.
- [ ] Implementar Modo Mock/Demo.
- [ ] Implementar redirección post-login basada en el rol.
- [ ] Implementar guardias de ruta en `Layout`.
- [ ] Separar rutas públicas, privadas y restringidas por rol.

---

# 📊 Estimación

| Campo | Valor |
|---|---|
| Story Points | 3 |
| Tiempo estimado | 6 horas |
| Prioridad | Alta |
| Estado | Pendiente / En desarrollo |

---

# 📂 Control de Archivos

## Backend — ASP.NET Core 8

| Archivo | Propósito |
|---|---|
| `Controllers/UsuariosController.cs` | Endpoint `POST /api/Usuarios/login` (línea 138-198) |
| `Clases/Usuario.cs` | Entidad `Usuario` (`IdUsuario`, `IdRol`, `NombreUsuario`, `Contrasenia`, `Estado`) |
| `Clases/Rol.cs` | Entidad `Rol` (`IdRol`, `Nombre`, `Estado`) |
| `Data/DentalCareContext.cs` | `DbContext` con `DbSet<Usuario>` y `DbSet<Rol>` |
| `Program.cs` | Configuración JWT (línea 14-35) y seed de datos (línea 86-179) |
| `appsettings.json` | Configuración JWT (`Key`, `Issuer`, `Audience`) y `ConnectionString` |

---

## Frontend — React 19 + TypeScript

| Archivo | Propósito |
|---|---|
| `src/pages/Login.tsx` | Formulario de inicio de sesión |
| `src/context/AuthContext.tsx` | Provider con estado global de autenticación |
| `src/services/api.ts` | Servicio `login()` (línea 234-269) y detección de Mock Mode |
| `src/layouts/Layout.tsx` | Guardias de ruta: público/privado y rutas por rol (línea 18-52) |
| `src/components/Sidebar.tsx` | Filtrado del menú según el rol (línea 81-86) |
| `src/components/Navbar.tsx` | Muestra el usuario actual y botón de cerrar sesión |
| `src/App.tsx` | Definición de rutas protegidas |

---

# 🛠️ Detalles de Implementación Técnica

## 🔄 Flujo de Login — Frontend → Backend

```text
Login.tsx
    │
    │ login(nombreUsuario, contrasena)
    ▼
AuthContext.tsx
    │
    │ apiService.login(nombreUsuario, contrasena)
    ▼
api.ts
    │
    │ POST /api/Usuarios/login
    │ { nombreUsuario, contrasena }
    ▼
UsuariosController.cs
    │
    ├── Buscar usuario en BD
    ├── Validar nombre de usuario
    ├── Validar contraseña
    ├── Validar Estado == "Activo"
    ├── Obtener información del rol
    ├── Generar JWT
    ▼
Respuesta del Backend
    │
    │ {
    │   token,
    │   usuario: {
    │      idUsuario,
    │      codigo,
    │      nombreUsuario,
    │      idRol,
    │      rol,
    │      estado
    │   }
    │ }
    ▼
AuthContext.tsx
    │
    ├── Guardar dental_session
    └── Guardar dental_token
    ▼
Login.tsx
    │
    ├── Administrador → /dashboard
    └── Dentista/Paciente → /gestion-citas
```

---

# 🔑 Endpoint de Login

### Método

```http
POST
```

### Ruta

```http
/api/Usuarios/login
```

### Body de la petición

```json
{
  "nombreUsuario": "admin",
  "contrasena": "admin123"
}
```

### Respuesta exitosa

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "idUsuario": 1,
    "codigo": "USR-001",
    "nombreUsuario": "admin",
    "idRol": 1,
    "rol": "Administrador",
    "estado": "Activo"
  }
}
```

---

# 🔀 Modo Mock vs Real Backend

| Aspecto | Modo Mock / Demo | Backend Real |
|---|---|---|
| Activación | Timeout o error al realizar `GET /api/Usuarios` | El backend responde correctamente |
| Usuarios | Usuarios predefinidos | Usuarios almacenados en PostgreSQL |
| Roles | 1 = Administrador, 2 = Dentista, 3 = Paciente | Roles existentes en BD |
| Login | Búsqueda local en `localStorage` | Consulta a BD |
| Token | `mock-jwt-token-xyz` | JWT firmado con HMAC-SHA256 |
| Persistencia | `localStorage` | `localStorage` + JWT |
| Validación | Datos predefinidos | Backend + base de datos |

---

## 👤 Usuarios del Modo Demo

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `dr.garcia` | `dentista123` | Dentista |
| `paciente1` | `paciente123` | Paciente |

Los usuarios del Modo Demo pueden almacenarse en:

```text
dental_users
```

dentro de `localStorage`.

---

# 🎫 Estructura del JWT

El token JWT generado por el backend contiene información sobre el usuario autenticado.

Ejemplo de Payload:

```json
{
  "sub": "1",
  "name": "admin",
  "role": "Administrador",
  "Estado": "Activo",
  "exp": 1785000000
}
```

### Claims

| Claim | Descripción |
|---|---|
| `sub` | Identificador del usuario (`IdUsuario`) |
| `name` | Nombre de usuario (`NombreUsuario`) |
| `role` | Rol del usuario |
| `Estado` | Estado actual del usuario |
| `exp` | Fecha y hora de expiración del token |

> El token tiene una duración estimada de **7 días desde su emisión**.

---

# 💾 Persistencia de Sesión

La información de la sesión se almacena en `localStorage`.

### Sesión del usuario

```typescript
localStorage.setItem(
  'dental_session',
  JSON.stringify(sessionData)
);
```

### Token JWT

```typescript
localStorage.setItem(
  'dental_token',
  tokenString
);
```

La estructura de almacenamiento es:

```text
localStorage
│
├── dental_session
│   └── Información del usuario autenticado
│
└── dental_token
    └── Token JWT
```

---

## 🔄 Recuperación de sesión

Cuando el usuario recarga la página:

```text
Aplicación inicia
      │
      ▼
AuthContext
      │
      ▼
useEffect()
      │
      ▼
Buscar dental_session
      │
      ├── Existe → Restaurar sesión
      │
      └── No existe → Usuario no autenticado
```

---

# 🚪 Cerrar Sesión

Cuando el usuario selecciona **Cerrar Sesión**, el sistema debe:

1. Eliminar `dental_session`.
2. Eliminar `dental_token`.
3. Limpiar el estado global de autenticación.
4. Redirigir al usuario al login.

Ejemplo:

```typescript
localStorage.removeItem('dental_session');
localStorage.removeItem('dental_token');
```

Flujo:

```text
Usuario autenticado
       │
       │ Cerrar Sesión
       ▼
Eliminar sesión
       │
       ▼
Eliminar token
       │
       ▼
Limpiar AuthContext
       │
       ▼
Redirigir a /
```

---

# 🛡️ Guardias de Ruta — Layout.tsx

El sistema utiliza guardias de ruta para controlar el acceso a las diferentes páginas.

## 🌐 Rutas públicas

Las rutas públicas pueden ser accedidas sin iniciar sesión.

Ejemplos:

```text
/
/register
```

Estas rutas muestran:

- Navbar
- Contenido público
- Footer

---

## 🔒 Rutas privadas

Las rutas privadas requieren que exista una sesión activa.

Si el usuario no está autenticado:

```text
Usuario intenta acceder a ruta privada
                │
                ▼
        ¿Existe sesión?
          /          \
        NO            SÍ
        │              │
        ▼              ▼
    Redirigir       Permitir
       a /           acceso
```

---

## 👑 Rutas restringidas por rol

Algunas rutas solamente pueden ser utilizadas por usuarios con determinados roles.

### Administrador

Puede acceder a:

```text
/dashboard
/usuarios
```

Si el usuario tiene el rol:

```text
Administrador
```

se permite el acceso.

### Dentista y Paciente

Los usuarios con los roles:

```text
Dentista
Paciente
```

son redirigidos a:

```text
/gestion-citas
```

si intentan acceder a una ruta exclusiva del administrador.

---

# 🧭 Matriz de Acceso por Rol

| Ruta | Administrador | Dentista | Paciente |
|---|---:|---:|---:|
| `/` | ✅ | ✅ | ✅ |
| `/register` | ✅ | ✅ | ✅ |
| `/dashboard` | ✅ | ❌ | ❌ |
| `/usuarios` | ✅ | ❌ | ❌ |
| `/gestion-citas` | ✅ | ✅ | ✅ |

> La matriz puede ampliarse posteriormente para incluir nuevos módulos y permisos específicos.

---

# 📑 Sidebar

El componente:

```text
src/components/Sidebar.tsx
```

debe filtrar las opciones del menú según el rol del usuario autenticado.

### Administrador

Visualiza:

```text
Dashboard
Usuarios
Gestión de Citas
```

### Dentista

Visualiza:

```text
Gestión de Citas
```

### Paciente

Visualiza:

```text
Gestión de Citas
```

La lógica de filtrado debe impedir que los usuarios visualicen opciones de menú que no correspondan a su rol.

---

# 🏗️ Arquitectura General

```text
┌─────────────────────────────────────────┐
│              FRONTEND                   │
│          React 19 + TypeScript           │
│                                         │
│  Login.tsx                              │
│      │                                  │
│      ▼                                  │
│  AuthContext.tsx                        │
│      │                                  │
│      ▼                                  │
│  api.ts                                 │
│      │                                  │
│      │ HTTP POST /api/Usuarios/login    │
└──────┼──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│              BACKEND                    │
│           ASP.NET Core 8                │
│                                         │
│  UsuariosController.cs                  │
│      │                                  │
│      ├── Validar credenciales            │
│      ├── Validar estado                  │
│      ├── Obtener rol                     │
│      └── Generar JWT                     │
│                                         │
└──────────────────┼──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│             BASE DE DATOS               │
│               PostgreSQL                │
│                                         │
│  Usuario                                │
│     │                                   │
│     └──────► Rol                         │
│                                         │
└─────────────────────────────────────────┘
```

---

# 🔐 Flujo de Autorización Posterior al Login

```text
Login exitoso
     │
     ▼
JWT generado
     │
     ▼
JWT almacenado en localStorage
     │
     ▼
Usuario accede a una ruta
     │
     ▼
¿Existe sesión?
   /       \
 NO         SÍ
 │           │
 ▼           ▼
Login    ¿Tiene permiso?
            /     \
          NO       SÍ
          │         │
          ▼         ▼
      Redirigir   Permitir
      a ruta      acceso
      permitida
```

---

# 📌 Resumen de Componentes

| Componente | Responsabilidad |
|---|---|
| `Login.tsx` | Capturar credenciales e iniciar sesión |
| `AuthContext.tsx` | Mantener el estado global de autenticación |
| `api.ts` | Comunicarse con el backend y gestionar Modo Mock |
| `UsuariosController.cs` | Validar credenciales y generar JWT |
| `Usuario.cs` | Representar la entidad de usuario |
| `Rol.cs` | Representar la entidad de rol |
| `DentalCareContext.cs` | Acceso a datos mediante Entity Framework Core |
| `Program.cs` | Configurar JWT, autenticación y datos iniciales |
| `Layout.tsx` | Proteger rutas y controlar acceso |
| `Sidebar.tsx` | Mostrar opciones según el rol |
| `Navbar.tsx` | Mostrar usuario y cerrar sesión |
| `App.tsx` | Definir las rutas de la aplicación |

---

# ✅ Resultado Esperado

Al finalizar la implementación, el sistema debe permitir:

1. Iniciar sesión mediante usuario y contraseña.
2. Validar las credenciales contra PostgreSQL.
3. Verificar si el usuario está activo.
4. Generar un JWT válido desde ASP.NET Core 8.
5. Almacenar la sesión y el token en `localStorage`.
6. Mantener la sesión después de recargar la página.
7. Redirigir al usuario según su rol.
8. Proteger las rutas privadas.
9. Restringir determinadas rutas según el rol.
10. Filtrar las opciones del Sidebar según los permisos.
11. Cerrar sesión correctamente.
12. Funcionar en Modo Demo cuando el backend no esté disponible.

---

# ⚠️ Nota de Seguridad

En una implementación real, no se deben almacenar contraseñas en texto plano en la base de datos.

La contraseña debería almacenarse mediante un algoritmo de hashing seguro, por ejemplo:

- BCrypt.
- ASP.NET Core Identity.
- PBKDF2.

El proceso recomendado es:

```text
Registro
   │
   ▼
Contraseña ingresada
   │
   ▼
Hash de contraseña
   │
   ▼
Guardar hash en BD
```

Durante el login:

```text
Contraseña ingresada
   │
   ▼
Comparar con hash almacenado
   │
   ├── No coincide → Usuario o contraseña incorrectos
   │
   └── Coincide → Generar JWT
```
