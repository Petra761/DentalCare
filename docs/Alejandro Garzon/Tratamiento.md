# 🩺 Épica: Gestión de Tratamientos y Servicios

## 📌 Historia de Usuario

### HU-TRT-001 — Consultar tratamientos y servicios odontológicos

**Como** administrador u odontólogo,  
**quiero** consultar los servicios odontológicos y tratamientos disponibles en el sistema,  
**para** conocer la oferta de atención de la clínica.

---

# ✅ Criterios de Aceptación

- La pantalla debe cargar y mostrar todos los servicios activos desde la API.
- Cada servicio debe mostrar:
  - Código
  - Nombre
  - Descripción
  - Categoría
  - Duración
  - Estado (Disponible / No Disponible)
- Se debe poder buscar por:
  - Código
  - Nombre
  - Descripción
  - Categoría
- Se debe poder filtrar por:
  - Categoría (dinámico desde la API)
  - Estado (Disponible / No Disponible)
- La tabla debe estar paginada (5 elementos por página).
- Se debe mostrar un mensaje informativo cuando no existan resultados.
- Se deben mostrar tarjetas de estadísticas con:
  - Total de servicios
  - Servicios disponibles
  - Duración promedio
  - Categorías activas

---

# 📋 Subtareas

- [ ] Crear endpoint `GET /api/Servicios` que retorne todos los servicios.
- [ ] Crear endpoint `GET /api/Categorias` que retorne todas las categorías.
- [ ] Implementar tabla con paginación (5 elementos por página).
- [ ] Implementar buscador por:
  - Código
  - Nombre
  - Descripción
  - Categoría
- [ ] Implementar filtro por Categoría (opciones dinámicas desde la API).
- [ ] Implementar filtro por Estado del Servicio (Disponible / No Disponible).
- [ ] Implementar tarjetas de estadísticas:
  - Total de servicios
  - Disponibles
  - Duración promedio
  - Categorías activas
- [ ] Formatear la duración (`TimeOnly` → `"1h 30m"`).
- [ ] Ocultar servicios inactivos (`Estado != "Activo"`).
- [ ] Implementar estados de:
  - Carga
  - Error
  - Vacío

---

# ⏱️ Estimación

| Concepto | Valor |
|----------|------:|
| Story Points | **3** |
| Tiempo estimado | **6 horas** |

---

# 📂 Control de Archivos

## Backend (ASP.NET Core 8)

| Archivo | Líneas / Métodos Clave | Propósito |
|----------|------------------------|-----------|
| `Controllers/ServiciosController.cs` | `GetServicio()`, `GetServicio(id)`, `GetCatalogo()`, `PostServicio()`, `PutServicio()`, `DeleteServicio()` | CRUD completo de servicios |
| `Controllers/CategoriasController.cs` | `GetCategoria()`, `GetCategoria(id)`, `PostCategoria()`, `PutCategoria()`, `DeleteCategoria()` | CRUD completo de categorías |
| `Clases/Servicio.cs` | Entidad Servicio | Modelo de datos del servicio |
| `Clases/Categoria.cs` | Entidad Categoría | Modelo de datos de la categoría |
| `Program.cs` | Datos semilla | Inicialización de categorías y servicios |
| `Data/DentalCareContext.cs` | `DbSet<Servicio>`, `DbSet<Categoria>` | Contexto de Entity Framework |

---

## Frontend (React 19 + TypeScript)

| Archivo | Propósito |
|----------|-----------|
| `src/pages/Tratamientos.tsx` | Página principal de consulta, búsqueda, filtros, estadísticas y paginación |
| `src/services/api.ts` | Métodos `getServicios()` y `getCategorias()` |

---

# 🛠️ Detalles de Implementación Técnica

## Flujo de la Pantalla

```text
Tratamientos.tsx (mount)
        │
        ▼
     loadData()
        │
        ▼
Promise.all([
    apiService.getServicios(),
    apiService.getCategorias()
])
        │
        ▼
GET /api/Servicios
GET /api/Categorias
        │
        ▼
setServices(data)
setCategories(data)
        │
        ▼
Filtrado automático (useEffect)
        │
        ├── Mantiene solo Estado == "ACTIVO"
        ├── Búsqueda por texto
        ├── Filtro por Categoría
        ├── Filtro por EstadoServicio
        ▼
setFilteredServices()
setCurrentPage(1)
        │
        ▼
Renderizado
        │
        ├── Tarjetas de estadísticas
        ├── Tabla (5 elementos)
        └── Paginación
```

---

# 📦 Entidad Servicio

```csharp
public class Servicio
{
    int IdServicio;
    int IdCategoria;

    string Codigo;
    string Nombre;
    string Descripcion;

    TimeOnly Duracion;

    string EstadoServicio; // Disponible | No Disponible
    string Estado;         // Activo | Inactivo

    Categoria? Categoria;  // Navigation Property
}
```

---

# 🔄 Mapeo de Datos en el Frontend

## Servicio

```typescript
export interface Servicio {
    idServicio: number;
    idCategoria: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    duracion: string;      // HH:mm:ss
    estadoServicio: string;
    estado: string;
}
```

## Categoría

```typescript
export interface Categoria {
    idCategoria: number;
    codigo: string;
    nombre: string;
    estado: string;
}
```

---

# ⏰ Formateo de Duración

| Backend | Frontend |
|---------|----------|
| `01:00:00` | `1h` |
| `00:30:00` | `30m` |
| `01:30:00` | `1h 30m` |

---

# 🔍 Filtros Dinámicos

## Categoría

- Opciones cargadas desde:
  - `GET /api/Categorias`
- El `<select>` se genera dinámicamente.

## Estado del Servicio

Opciones disponibles:

- Disponible
- No Disponible

## Búsqueda

La búsqueda es **insensible a mayúsculas y minúsculas** y se realiza sobre:

- Código
- Nombre
- Descripción
- Nombre de la categoría

---

# 🌱 Datos Semilla

## Categorías

- General
- Ortodoncia
- Cirugía

## Servicios

| Servicio | Categoría | Duración | Estado |
|----------|-----------|----------|--------|
| Limpieza Profunda | General | 1h | Disponible |
| Ortodoncia Control | Ortodoncia | 30m | Disponible |
| Implante Fase 2 | Cirugía | 1h 30m | Disponible |
| Extracción Molar | Cirugía | 1h | Disponible |