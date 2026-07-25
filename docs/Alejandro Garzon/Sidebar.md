# 📍 Épica: Navegación del Sistema

## 📌 Historia de Usuario

### HU-NAV-001 — Barra lateral de navegación (Sidebar)

**Como** usuario autenticado,  
**quiero** una barra lateral que me permita navegar entre los módulos del sistema según mi rol,  
**para** acceder rápidamente a las funcionalidades que tengo permitidas.

---

# ✅ Criterios de Aceptación

- El sidebar debe mostrar el logo y nombre de la clínica (**DentalCare**).
- Debe contener enlaces de navegación a:
  - Dashboard
  - Agenda
  - Pacientes
  - Tratamientos
  - Reportes
  - Usuarios
- Los enlaces **Dashboard** y **Usuarios** deben ser visibles únicamente para usuarios con rol **Administrador**.
- El elemento activo debe resaltarse visualmente.
- En dispositivos móviles debe mostrarse como un menú desplegable con **overlay** (backdrop).
- Debe mostrar la información del usuario autenticado (nombre y rol) en la parte inferior.
- Debe incluir un botón **Cerrar Sesión** que elimine la sesión y redirija al inicio de sesión.
- En dispositivos móviles debe cerrarse automáticamente al seleccionar un enlace.

---

# 📋 Subtareas

- [ ] Crear el componente `Sidebar` con la lista de rutas.
- [ ] Implementar filtrado de opciones según el rol del usuario.
- [ ] Implementar estado activo utilizando `NavLink` de React Router.
- [ ] Implementar diseño responsive:
  - Sidebar fijo en escritorio.
  - Sidebar tipo overlay en dispositivos móviles.
- [ ] Implementar backdrop semitransparente en móviles.
- [ ] Mostrar avatar con las iniciales del usuario.
- [ ] Implementar botón **Cerrar Sesión**.
- [ ] Sincronizar la apertura y cierre del Sidebar desde el Layout.

---

# ⏱️ Estimación

| Concepto | Valor |
|----------|------:|
| Story Points | **2** |
| Tiempo estimado | **4 horas** |

---

# 📂 Control de Archivos

| Archivo | Propósito |
|----------|-----------|
| `src/components/Sidebar.tsx` | Componente principal del Sidebar con navegación, información del usuario y cierre de sesión |
| `src/layouts/Layout.tsx` | Renderiza el Sidebar y controla el estado `isOpen` |
| `src/context/AuthContext.tsx` | Proporciona el usuario autenticado y la función `logout()` |
| `src/App.tsx` | Define las rutas del sistema utilizadas por el Sidebar |

---

# 🛠️ Detalles de Implementación Técnica

## Estructura del Sidebar

```text
┌──────────────────────────────┐
│ 🩺 DentalCare                │
│ Logo + Nombre de la clínica  │
├──────────────────────────────┤
│ 📊 Dashboard          *      │
│ 📅 Agenda                    │
│ 👥 Pacientes                 │
│ 🩹 Tratamientos              │
│ 📈 Reportes                  │
│ 👤 Usuarios           *      │
├──────────────────────────────┤
│ 👤 AN                        │
│ Nombre del usuario           │
│ Rol del usuario              │
│ 🚪 Cerrar Sesión             │
└──────────────────────────────┘

(*) Visible únicamente para Administradores.
```

---

# 🔐 Filtrado por Rol

El Sidebar filtra automáticamente las opciones visibles según el rol del usuario autenticado.

```typescript
.filter(item => {
  if (item.path === '/dashboard' || item.path === '/usuarios') {
    return user?.rol?.toLowerCase() === 'administrador';
  }
  return true;
})
```

Los módulos **Dashboard** y **Usuarios** solo estarán disponibles para usuarios cuyo rol sea **Administrador**.

---

# 🧭 Navegación con React Router

Se utiliza el componente **NavLink** de React Router para identificar automáticamente la ruta activa y aplicar el estilo correspondiente.

## Rutas disponibles

| Ruta | Módulo |
|------|---------|
| `/dashboard` | Dashboard |
| `/gestion-citas` | Agenda |
| `/pacientes` | Pacientes |
| `/tratamientos` | Tratamientos |
| `/reportes` | Reportes |
| `/usuarios` | Usuarios |

---

# 📱 Diseño Responsive

## Escritorio

- Sidebar fijo dentro del `Layout`.
- Visible permanentemente.

## Dispositivos móviles

- Sidebar oculto inicialmente mediante:

```css
translate-x-full
```

- Se despliega mediante un botón hamburguesa.
- Utiliza una animación de deslizamiento.
- Incluye un **backdrop** semitransparente con efecto **backdrop-blur**.
- Al seleccionar un enlace, el Sidebar se cierra automáticamente.

---

# 🚪 Cierre de Sesión

La funcionalidad de cierre de sesión realiza las siguientes acciones:

```typescript
const handleLogout = () => {
  logout();                     // Limpia la sesión
  onClose();                    // Cierra el Sidebar en móvil
  navigate('/', { replace: true }); // Redirige al Login
};
```

Durante el proceso se eliminan los datos almacenados en:

- `dental_session`
- `dental_token`

Posteriormente el usuario es redirigido a la pantalla de inicio de sesión.

---

# 👤 Información del Usuario

En la parte inferior del Sidebar se muestra la información del usuario autenticado.

Características:

- Avatar circular.
- Iniciales generadas a partir de las dos primeras letras del nombre de usuario.
- Nombre del usuario.
- Rol del usuario.

Ejemplo:

```text
👤 AN

Alejandro
Administrador
```

Toda esta información es obtenida desde el **AuthContext**, el cual lee los datos almacenados en `localStorage`.